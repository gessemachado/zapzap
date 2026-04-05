import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contact_groups')
    .select('id, name, color, created_at')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // count members per group
  const { data: counts } = await supabase
    .from('contact_group_members')
    .select('group_id')

  const countMap: Record<string, number> = {}
  for (const row of counts ?? []) {
    countMap[row.group_id] = (countMap[row.group_id] ?? 0) + 1
  }

  const groups = (data ?? []).map((g) => ({ ...g, member_count: countMap[g.id] ?? 0 }))

  return NextResponse.json(groups)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { name, color = '#25D366' } = body

  if (!name) {
    return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('contact_groups')
    .insert({ name, color })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
