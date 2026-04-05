import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const {
    meta_access_token,
    meta_phone_number_id,
    meta_waba_id,
    meta_api_version,
    webhook_verify_token,
    send_interval_ms,
    max_per_hour,
    auto_retry,
  } = body

  const { data: existing } = await supabase.from('app_settings').select('id').single()
  if (!existing) return NextResponse.json({ error: 'Settings not found' }, { status: 404 })

  const { error } = await supabase
    .from('app_settings')
    .update({
      meta_access_token,
      meta_phone_number_id,
      meta_waba_id,
      meta_api_version,
      webhook_verify_token,
      send_interval_ms,
      max_per_hour,
      auto_retry,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
