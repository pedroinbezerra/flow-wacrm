import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toProxyPath } from '@/lib/storage/media-src'

async function requireAccountUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false as const, status: 401, body: { error: 'Unauthorized' } }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.account_id) {
    return { ok: false as const, status: 400, body: { error: 'Sem conta vinculada.' } }
  }

  return { ok: true as const, userId: user.id, accountId: profile.account_id, supabase }
}

export async function GET() {
  const guard = await requireAccountUser()
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status })
  const { accountId, supabase } = guard

  const { data, error } = await supabase
    .from('ai_media_library')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: data ?? [] })
}

export async function POST(request: Request) {
  const guard = await requireAccountUser()
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status })
  const { accountId, supabase } = guard

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = (formData.get('title') as string) || ''
    const description = (formData.get('description') as string) || ''
    const customUrl = (formData.get('media_url') as string) || ''
    const mediaTypeInput = (formData.get('media_type') as string) || 'image'

    if (!title || (!file && !customUrl)) {
      return NextResponse.json(
        { error: 'Título e um Arquivo ou URL da Mídia são obrigatórios.' },
        { status: 400 }
      )
    }

    let finalMediaUrl = customUrl
    let finalFileName = file?.name || 'media_file'
    let finalMimeType = file?.type || 'application/octet-stream'
    let detectedType: 'image' | 'video' | 'document' = 'image'

    if (file) {
      const mime = file.type
      if (mime.startsWith('image/')) detectedType = 'image'
      else if (mime.startsWith('video/')) detectedType = 'video'
      else detectedType = 'document'

      const fileExt = file.name.split('.').pop() || 'bin'
      const timestamp = Date.now()
      const storagePath = `account-${accountId}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('ai-service-media')
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: true,
        })

      if (uploadErr) {
        return NextResponse.json(
          { error: `Erro no upload do arquivo: ${uploadErr.message}` },
          { status: 500 }
        )
      }

      finalMediaUrl = toProxyPath('ai-service-media', uploadData.path)
    } else {
      if (['image', 'video', 'document'].includes(mediaTypeInput)) {
        detectedType = mediaTypeInput as 'image' | 'video' | 'document'
      }
    }

    const { data, error } = await supabase
      .from('ai_media_library')
      .insert({
        account_id: accountId,
        title: title.trim(),
        media_type: detectedType,
        media_url: finalMediaUrl,
        filename: finalFileName,
        mime_type: finalMimeType,
        description: description.trim(),
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item: data })
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao processar formulário de mídia' }, { status: 400 })
  }
}
