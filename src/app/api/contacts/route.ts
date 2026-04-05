import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const groupId = searchParams.get('group') || ''

  let query = supabase
    .from('contacts')
    .select(`
      id, name, phone, active, created_at, updated_at,
      groups:contact_group_members(
        group:contact_groups(id, name, color)
      )
    `)
    .order('name')

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  if (groupId) {
    const { data: memberIds } = await supabase
      .from('contact_group_members')
      .select('contact_id')
      .eq('group_id', groupId)
    const ids = (memberIds ?? []).map((m) => m.contact_id)
    if (ids.length === 0) return NextResponse.json([])
    query = query.in('id', ids)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // flatten nested groups
  const contacts = (data ?? []).map((c) => ({
    ...c,
    groups: (c.groups ?? []).map((m: { group: unknown }) => m.group).filter(Boolean),
  }))

  return NextResponse.json(contacts)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { name, phone, active = true, group_ids = [] } = body

  if (!name || !phone) {
    return NextResponse.json({ error: 'Nome e telefone são obrigatórios.' }, { status: 400 })
  }

  const { data: contact, error } = await supabase
    .from('contacts')
    .insert({ name, phone, active })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Telefone já cadastrado.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (group_ids.length > 0) {
    await supabase.from('contact_group_members').insert(
      group_ids.map((gid: string) => ({ contact_id: contact.id, group_id: gid }))
    )
  }

  return NextResponse.json(contact, { status: 201 })
}
