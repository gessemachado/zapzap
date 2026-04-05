import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET — Meta webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('app_settings')
    .select('webhook_verify_token')
    .single()

  if (mode === 'subscribe' && token === settings?.webhook_verify_token) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// POST — Delivery status updates from Meta
export async function POST(request: NextRequest) {
  const body = await request.json()

  // Meta sends updates in nested structure
  const entries = body?.entry ?? []

  const supabase = await createClient()

  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      const statuses = change.value?.statuses ?? []
      for (const status of statuses) {
        const waMessageId: string = status.id
        const waStatus: string = status.status // sent, delivered, read, failed

        const newStatus =
          waStatus === 'delivered' ? 'delivered'
          : waStatus === 'read' ? 'read'
          : waStatus === 'failed' ? 'failed'
          : null

        if (!newStatus || !waMessageId) continue

        const updatePayload: Record<string, unknown> = { status: newStatus }
        if (newStatus === 'delivered') updatePayload.delivered_at = new Date().toISOString()
        if (newStatus === 'read') updatePayload.read_at = new Date().toISOString()

        // Update send record
        const { data: send } = await supabase
          .from('campaign_sends')
          .update(updatePayload)
          .eq('whatsapp_message_id', waMessageId)
          .select('campaign_id')
          .single()

        // Update campaign counters
        if (send?.campaign_id) {
          if (newStatus === 'delivered') {
            await supabase.rpc('increment_campaign_delivered', { campaign_id_param: send.campaign_id })
          } else if (newStatus === 'read') {
            await supabase.rpc('increment_campaign_read', { campaign_id_param: send.campaign_id })
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true })
}
