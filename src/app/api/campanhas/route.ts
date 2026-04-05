import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      id, name, message, status, audience_type,
      total_contacts, sent_count, delivered_count, read_count, failed_count,
      estimated_cost, real_cost, started_at, finished_at, created_at,
      group:contact_groups(id, name, color)
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const {
    name,
    message,
    product_image_url,
    flyer_url,
    flyer_slug,
    audience_type,
    audience_group_id,
    contact_ids,
    estimated_cost,
  } = body

  if (!name || !message) {
    return NextResponse.json({ error: 'Nome e mensagem são obrigatórios.' }, { status: 400 })
  }

  // count total contacts
  let total_contacts = 0
  if (audience_type === 'all') {
    const { count } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('active', true)
    total_contacts = count ?? 0
  } else if (audience_type === 'group' && audience_group_id) {
    const { count } = await supabase
      .from('contact_group_members')
      .select('contact_id', { count: 'exact', head: true })
      .eq('group_id', audience_group_id)
    total_contacts = count ?? 0
  } else if (audience_type === 'manual' && Array.isArray(contact_ids)) {
    total_contacts = contact_ids.length
  }

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert({
      name,
      message,
      product_image_url: product_image_url ?? null,
      flyer_url: flyer_url ?? null,
      flyer_slug: flyer_slug ?? null,
      audience_type,
      audience_group_id: audience_group_id ?? null,
      total_contacts,
      estimated_cost: estimated_cost ?? total_contacts * 0.13,
      status: 'draft',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // if manual, create audience entries
  if (audience_type === 'manual' && Array.isArray(contact_ids) && contact_ids.length > 0) {
    await supabase.from('campaign_sends').insert(
      contact_ids.map((cid: string) => ({ campaign_id: campaign.id, contact_id: cid }))
    )
  }

  return NextResponse.json(campaign, { status: 201 })
}
