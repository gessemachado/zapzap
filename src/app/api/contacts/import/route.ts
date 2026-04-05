import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { contacts, group_ids = [] }: { contacts: { name: string; phone: string }[]; group_ids: string[] } = body

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return NextResponse.json({ error: 'Nenhum contato enviado.' }, { status: 400 })
  }

  const rows = contacts.map((c) => ({ name: c.name.trim(), phone: c.phone.trim() }))

  const { data: inserted, error } = await supabase
    .from('contacts')
    .upsert(rows, { onConflict: 'phone', ignoreDuplicates: false })
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (group_ids.length > 0 && inserted && inserted.length > 0) {
    const members = inserted.flatMap((c) =>
      group_ids.map((gid) => ({ contact_id: c.id, group_id: gid }))
    )
    await supabase.from('contact_group_members').upsert(members, { ignoreDuplicates: true })
  }

  return NextResponse.json({ imported: inserted?.length ?? 0 })
}
