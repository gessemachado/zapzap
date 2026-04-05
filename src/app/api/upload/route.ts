import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = (formData.get('bucket') as string) || 'assets'

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()
    const filename = `${crypto.randomUUID()}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, { contentType: file.type, upsert: false })

    if (error) {
      console.error('[upload] storage error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename)

    return NextResponse.json({ url: urlData.publicUrl, filename })
  } catch (err) {
    console.error('[upload] unexpected error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
