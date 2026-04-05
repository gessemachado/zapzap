import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  const body = await request.json()
  const { name, phone, active, group_ids } = body

  const { error } = await supabase
    .from('contacts')
    .update({ name, phone, active, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Telefone já cadastrado.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (Array.isArray(group_ids)) {
    await supabase.from('contact_group_members').delete().eq('contact_id', id)
    if (group_ids.length > 0) {
      await supabase.from('contact_group_members').insert(
        group_ids.map((gid: string) => ({ contact_id: id, group_id: gid }))
      )
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { error } = await supabase.from('contacts').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
