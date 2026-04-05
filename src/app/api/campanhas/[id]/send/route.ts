import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: campaignId } = await params

  // Load settings
  const { data: settings, error: settingsError } = await supabase
    .from('app_settings')
    .select('*')
    .single()

  if (settingsError || !settings?.meta_access_token || !settings?.meta_phone_number_id) {
    return NextResponse.json(
      { error: 'Configure as credenciais da API Meta antes de enviar.' },
      { status: 400 }
    )
  }

  // Load campaign
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ error: 'Campanha não encontrada.' }, { status: 404 })
  }

  if (!['draft', 'paused'].includes(campaign.status)) {
    return NextResponse.json({ error: 'Campanha já foi enviada ou está em andamento.' }, { status: 409 })
  }

  // Determine contacts
  let contactIds: string[] = []

  if (campaign.audience_type === 'all') {
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id')
      .eq('active', true)
    contactIds = (contacts ?? []).map((c) => c.id)
  } else if (campaign.audience_type === 'group' && campaign.audience_group_id) {
    const { data: members } = await supabase
      .from('contact_group_members')
      .select('contact_id')
      .eq('group_id', campaign.audience_group_id)
    contactIds = (members ?? []).map((m) => m.contact_id)
  } else if (campaign.audience_type === 'manual') {
    const { data: sends } = await supabase
      .from('campaign_sends')
      .select('contact_id')
      .eq('campaign_id', campaignId)
    contactIds = (sends ?? []).map((s) => s.contact_id)
  }

  if (contactIds.length === 0) {
    return NextResponse.json({ error: 'Nenhum contato na audiência.' }, { status: 400 })
  }

  // Load contact phones
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, phone')
    .in('id', contactIds)

  if (!contacts || contacts.length === 0) {
    return NextResponse.json({ error: 'Contatos não encontrados.' }, { status: 400 })
  }

  // Create pending sends (upsert)
  const sendRows = contacts.map((c) => ({
    campaign_id: campaignId,
    contact_id: c.id,
    status: 'pending',
  }))
  await supabase.from('campaign_sends').upsert(sendRows, { ignoreDuplicates: true })

  // Mark campaign as sending
  await supabase.from('campaigns').update({
    status: 'sending',
    started_at: new Date().toISOString(),
    total_contacts: contacts.length,
    estimated_cost: contacts.length * 0.13,
  }).eq('id', campaignId)

  // Build flyer link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const flyerLink = campaign.flyer_slug ? `${appUrl}/f/${campaign.flyer_slug}` : undefined

  // Send messages respecting interval
  let sentCount = 0
  let failedCount = 0

  for (const contact of contacts) {
    const result = await sendWhatsAppMessage(
      settings.meta_access_token,
      settings.meta_phone_number_id,
      settings.meta_api_version ?? 'v19.0',
      {
        to: contact.phone,
        text: campaign.message,
        imageUrl: campaign.product_image_url ?? undefined,
        flyerLink,
      }
    )

    if (result.success) {
      sentCount++
      await supabase.from('campaign_sends').update({
        status: 'sent',
        whatsapp_message_id: result.messageId,
        sent_at: new Date().toISOString(),
      }).eq('campaign_id', campaignId).eq('contact_id', contact.id)
    } else {
      failedCount++
      await supabase.from('campaign_sends').update({
        status: 'failed',
        error_message: result.error,
      }).eq('campaign_id', campaignId).eq('contact_id', contact.id)
    }

    // Rate limiting
    if (settings.send_interval_ms > 0) {
      await new Promise((r) => setTimeout(r, settings.send_interval_ms))
    }

    // Check if campaign was paused externally
    const { data: check } = await supabase
      .from('campaigns')
      .select('status')
      .eq('id', campaignId)
      .single()

    if (check?.status === 'paused') {
      await supabase.from('campaigns').update({
        sent_count: sentCount,
        failed_count: failedCount,
      }).eq('id', campaignId)
      return NextResponse.json({ sent: sentCount, failed: failedCount, paused: true })
    }
  }

  // Mark campaign done/failed
  const finalStatus = failedCount === contacts.length ? 'failed' : 'done'
  await supabase.from('campaigns').update({
    status: finalStatus,
    sent_count: sentCount,
    failed_count: failedCount,
    finished_at: new Date().toISOString(),
    real_cost: sentCount * 0.13,
  }).eq('id', campaignId)

  return NextResponse.json({ sent: sentCount, failed: failedCount })
}
