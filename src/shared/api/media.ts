// Utilities for presigned uploads (S3/MinIO-like)
// Expected backend endpoints:
// POST /media/presign { filename, contentType } -> { uploadUrl, fields? }
// POST /media/complete { key } -> { id, url }

export async function uploadPresigned(file: File) {
  const filename = file.name
  const contentType = file.type || 'application/octet-stream'

  // 1) get presign
  const presignResp = await fetch(`${import.meta.env.VITE_API_URL}/media/presign`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType })
  })
  if (!presignResp.ok) throw new Error('Не удалось получить presign URL')
  const presign = await presignResp.json()

  if (presign.fields) {
    // POST multipart for S3-like
    const form = new FormData()
    Object.entries(presign.fields).forEach(([k, v]) => form.append(k, v as any))
    form.append('file', file)
    const up = await fetch(presign.uploadUrl, { method: 'POST', body: form })
    if (!up.ok) throw new Error('Загрузка в хранилище не удалась')
  } else {
    // PUT direct upload
    const up = await fetch(presign.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': contentType } })
    if (!up.ok) throw new Error('Загрузка файла не удалась')
  }

  // 3) notify backend
  const complete = await fetch(`${import.meta.env.VITE_API_URL}/media/complete`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: presign.key })
  })
  if (!complete.ok) throw new Error('Не удалось завершить загрузку')
  return await complete.json() // { id, url }
}
