import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      group:contact_groups(id, name, color),
      sends:campaign_sends(
        id, status, sent_at, delivered_at, read_at,
        contact:contacts(id, name, phone)
      )
    `)
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  return NextResponse.json(data)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  const body = await request.json()

  const { data, error } = await supabase
    .from('campaigns')
    .update({
      name: body.name,
      message: body.message,
      product_image_url: body.product_image_url ?? null,
      flyer_url: body.flyer_url ?? null,
      flyer_slug: body.flyer_slug ?? null,
      audience_type: body.audience_type,
      audience_group_id: body.audience_group_id ?? null,
      estimated_cost: body.estimated_cost ?? 0,
    })
    .eq('id', id)
    .in('status', ['draft', 'paused'])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  const { status } = await request.json()

  if (!['paused', 'draft'].includes(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('campaigns')
    .update({ status })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id)
    .in('status', ['draft', 'failed'])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
