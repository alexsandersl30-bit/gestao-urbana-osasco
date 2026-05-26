import imageCompression from 'browser-image-compression'

export async function compressToBase64(file) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 800,
    useWebWorker: true,
  }
  const compressed = await imageCompression(file, options)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(compressed)
  })
}
