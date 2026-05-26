import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, createSupabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { user } = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = (formData.get('bucket') as string) || 'logos'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate bucket name
    const allowedBuckets = ['logos', 'covers', 'items', 'categories']
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json(
        { error: `Invalid bucket: ${bucket}` },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServer()

    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log(`[UPLOAD] Uploading to ${bucket}/${fileName} (${file.type}, ${buffer.length} bytes)`)

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) {
      console.error('[UPLOAD] Error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    console.log('[UPLOAD] Success:', urlData.publicUrl)
    return NextResponse.json({ url: urlData.publicUrl })

  } catch (err: any) {
    console.error('[UPLOAD] Route error:', err.message)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
