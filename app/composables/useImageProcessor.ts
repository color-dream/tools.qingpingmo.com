/**
 * 图片处理公共逻辑 — 加载、Canvas 操作、下载等工具函数
 * 所有处理在浏览器本地完成，不上传服务器
 */

export function useImageProcessor() {
  /** File → HTMLImageElement */
  function loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('图片加载失败'))
      }
      img.src = url
    })
  }

  /** 创建离屏 Canvas */
  function createCanvas(w: number, h: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    return canvas
  }

  /** 将 Image 绘制到 Canvas 上，可指定目标宽高 */
  function imageToCanvas(
    img: HTMLImageElement,
    w?: number,
    h?: number,
  ): HTMLCanvasElement {
    const targetW = w ?? img.naturalWidth
    const targetH = h ?? img.naturalHeight
    const canvas = createCanvas(targetW, targetH)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, targetW, targetH)
    return canvas
  }

  /** Canvas → Blob */
  function canvasToBlob(
    canvas: HTMLCanvasElement,
    format: string = 'image/png',
    quality: number = 0.92,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas 转换失败'))
        },
        format,
        quality,
      )
    })
  }

  /** 触发浏览器下载 Blob */
  function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /** 文件大小人性化显示 */
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  /** MIME → 格式名 */
  function getFormatFromType(mime: string): string {
    const map: Record<string, string> = {
      'image/png': 'PNG',
      'image/jpeg': 'JPEG',
      'image/webp': 'WebP',
      'image/avif': 'AVIF',
      'image/bmp': 'BMP',
      'image/gif': 'GIF',
      'image/svg+xml': 'SVG',
      'image/tiff': 'TIFF',
    }
    return map[mime] ?? mime.replace('image/', '').toUpperCase()
  }

  /** 格式名 → MIME */
  function getMimeFromFormat(format: string): string {
    const map: Record<string, string> = {
      PNG: 'image/png',
      JPEG: 'image/jpeg',
      WebP: 'image/webp',
      AVIF: 'image/avif',
      BMP: 'image/bmp',
    }
    return map[format] ?? 'image/png'
  }

  /** 检查浏览器是否支持某格式导出 */
  function supportsFormat(format: string): boolean {
    // 通过 canvas.toDataURL 试探是否支持
    const canvas = createCanvas(1, 1)
    try {
      const dataUrl = canvas.toDataURL(getMimeFromFormat(format))
      return dataUrl.startsWith(`data:${getMimeFromFormat(format)}`)
    } catch {
      return false
    }
  }

  /** 计算宽高比的最简分数表示 */
  function aspectRatioLabel(w: number, h: number): string {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
    const d = gcd(w, h)
    return `${w / d}:${h / d}`
  }

  return {
    loadImageFromFile,
    createCanvas,
    imageToCanvas,
    canvasToBlob,
    downloadBlob,
    formatFileSize,
    getFormatFromType,
    getMimeFromFormat,
    supportsFormat,
    aspectRatioLabel,
  }
}
