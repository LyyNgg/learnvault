import { useRef, useState } from 'react'
import { uploadImage } from '../../lib/storage'

const MAX_IMAGES = 4

export default function ImagesInput({ userId, images, onChange, onBusy }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(0)
  const [error,     setError]     = useState('')

  async function onFiles(e) {
    const files = Array.from(e.target.files || []).slice(0, MAX_IMAGES - images.length)
    e.target.value = ''
    if (!files.length) return
    setError('')
    setUploading(files.length)
    onBusy?.(true)
    const urls = []
    for (const f of files) {
      try { urls.push(await uploadImage(userId, f)) }
      catch (err) { setError(err.message || 'Upload failed.') }
      setUploading(n => n - 1)
    }
    onChange([...images, ...urls])
    onBusy?.(false)
  }

  function move(i, dir) {
    const next = [...images]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div>
      <div className="thumbs">
        {images.map((src, i) => (
          <div key={src} className="thumb">
            <img src={src} alt="" />
            {i === 0 && <span className="thumb-cover">Cover</span>}
            <div className="thumb-actions">
              {i > 0 && <button type="button" onClick={() => move(i, -1)} aria-label="Move left">←</button>}
              <button type="button" onClick={() => onChange(images.filter(x => x !== src))} aria-label="Remove image">×</button>
            </div>
          </div>
        ))}
        {Array.from({ length: uploading }, (_, i) => <div key={`u${i}`} className="thumb thumb-loading">…</div>)}
        {images.length + uploading < MAX_IMAGES && (
          <button type="button" className="thumb thumb-add" onClick={() => fileRef.current?.click()}>
            + Image
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />
      <div className="field-hint">Up to {MAX_IMAGES} images, 5 MB each. The first one is the cover in grid view.</div>
      {error && <div className="field-error">{error}</div>}
    </div>
  )
}
