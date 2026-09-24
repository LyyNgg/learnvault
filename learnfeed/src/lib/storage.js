import { supabase } from './supabase'

const BUCKET = 'post-images'
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export async function uploadImage(userId, file) {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image.`)
  if (file.size > MAX_IMAGE_BYTES)     throw new Error(`${file.name} is larger than 5 MB.`)
  const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${userId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type })
  if (error) throw error
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
