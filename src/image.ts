// Photos for text recognition: shrunk and re-encoded as JPEG before sending them to the AI, so
// they upload quickly and cost fewer tokens.

/** Largest side sent to the AI (models downscale bigger images anyway). */
export const MAX_IMAGE_SIDE = 1568

/** Size that fits within `max` on both sides, keeping the proportions and never enlarging. */
export function fitWithin(width: number, height: number, max = MAX_IMAGE_SIDE): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height))
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

/** JPEG in base64 (without the data: prefix), ready for the AI. Browser only. */
export async function photoToJpegBase64(file: Blob): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const { width, height } = fitWithin(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('No se ha podido procesar la foto.')
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
  return dataUrl.slice(dataUrl.indexOf(',') + 1)
}
