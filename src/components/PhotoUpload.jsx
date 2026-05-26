import { useState } from 'react'
import { compressToBase64 } from '../utils/imageCompress'

export default function PhotoUpload({ fotos = [], onChange, disabled, maxPhotos = 10 }) {
  const [previews, setPreviews] = useState([])
  const [compressing, setCompressing] = useState(false)

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const slots = maxPhotos - fotos.length
    if (slots <= 0) return
    setCompressing(true)
    const newFotos = [...fotos]
    const newPreviews = [...previews]

    for (const file of files.slice(0, slots)) {
      try {
        const base64 = await compressToBase64(file)
        newFotos.push(base64)
        newPreviews.push(base64)
      } catch (err) {
        console.error('Erro ao comprimir imagem', err)
      }
    }

    setPreviews(newPreviews)
    onChange(newFotos)
    setCompressing(false)
    e.target.value = ''
  }

  const remove = (index) => {
    const updated = fotos.filter((_, i) => i !== index)
    setPreviews(updated)
    onChange(updated)
  }

  const allPreviews = previews.length ? previews : fotos

  return (
    <div className="space-y-3">
      {!disabled && fotos.length < maxPhotos && (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/40 rounded-lg cursor-pointer bg-primary-light/30 hover:bg-primary-light/50 transition">
          <span className="text-sm text-gray-600">
            {compressing ? 'Comprimindo imagens...' : `Adicionar fotos (${fotos.length}/${maxPhotos}) — máx. 800px`}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
            disabled={disabled || compressing}
          />
        </label>
      )}

      {allPreviews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allPreviews.map((src, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <img src={src} alt={`Preview ${i + 1}`} className="w-full h-24 object-cover" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-90 hover:opacity-100"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400">
        Preview antes de salvar — imagens comprimidas em base64
        {fotos.length >= maxPhotos && ' (limite atingido)'}
      </p>
    </div>
  )
}
