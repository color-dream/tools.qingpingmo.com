<template>
  <div class="tool-page">
    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="面包屑导航">
      <NuxtLink to="/" class="breadcrumb-link">首页</NuxtLink>
      <span class="breadcrumb-sep" aria-hidden="true">/</span>
      <span class="breadcrumb-current">图片处理</span>
    </nav>

    <!-- Page header -->
    <section class="page-header">
      <h1 class="page-title">图片处理工具</h1>
      <p class="page-desc">格式转换、尺寸调整、裁剪、旋转翻转、文字水印、图片信息查看</p>
    </section>

    <!-- Upload section -->
    <section class="upload-section">
      <div
        class="drop-zone"
        :class="{ 'has-image': sourceImage, dragging: isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="triggerUpload"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="file-input-hidden"
          @change="handleFileSelect"
        />

        <template v-if="!sourceImage">
          <div class="drop-icon">📁</div>
          <div class="drop-text">拖拽图片到此处，或点击选择文件</div>
          <div class="drop-hint">支持 PNG / JPEG / WebP / AVIF / BMP / GIF / SVG</div>
        </template>

        <template v-else>
          <div class="uploaded-info">
            <img :src="sourceDataUrl" class="uploaded-thumb" alt="已上传图片预览" />
            <div class="uploaded-meta">
              <div class="uploaded-name">{{ uploadedFile?.name ?? '图片' }}</div>
              <div class="uploaded-detail">
                {{ getFormatFromType(uploadedFile?.type ?? '') }}
                · {{ sourceImage.naturalWidth }} × {{ sourceImage.naturalHeight }}
                · {{ formatFileSize(uploadedFile?.size ?? 0) }}
              </div>
            </div>
            <button class="change-btn" @click.stop="resetImage">换一张</button>
          </div>
        </template>
      </div>
    </section>

    <!-- Tabs -->
    <section v-if="sourceImage" class="tabs-section">
      <div class="tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :id="'tab-' + tab.id"
          role="tab"
          :aria-selected="activeTab === tab.id"
          :class="['tab', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab 1: Format Conversion -->
      <div v-if="activeTab === 'format'" class="tab-panel" role="tabpanel">
        <div class="panel-card">
          <h3 class="panel-heading">格式转换</h3>
          <div class="field-row">
            <div class="field">
              <label class="field-label" for="target-format">目标格式</label>
              <select id="target-format" v-model="targetFormat" @change="convertFormat">
                <option v-for="f in availableFormats" :key="f.value" :value="f.value">
                  {{ f.label }}
                </option>
              </select>
            </div>
            <div class="field" v-if="showQualitySlider">
              <label class="field-label">质量：{{ targetQuality }}%</label>
              <input
                type="range"
                min="1"
                max="100"
                v-model.number="targetQuality"
                @input="convertFormat"
                class="quality-slider"
              />
            </div>
          </div>
          <div class="field">
            <label class="field-label">预览对比</label>
            <div class="compare-row">
              <div class="compare-item">
                <div class="compare-label">原图</div>
                <img :src="sourceDataUrl" class="compare-img" alt="原图" />
                <div class="compare-size">{{ formatFileSize(uploadedFile?.size ?? 0) }}</div>
              </div>
              <div class="compare-arrow">→</div>
              <div class="compare-item">
                <div class="compare-label">{{ targetFormat }}</div>
                <img v-if="convertedUrl" :src="convertedUrl" class="compare-img" alt="转换后" />
                <div v-else class="compare-placeholder">选择格式后自动预览</div>
                <div v-if="convertedSize !== null" class="compare-size changed">
                  {{ formatFileSize(convertedSize) }}
                  <span v-if="sizeDiff !== 0" :class="sizeDiff < 0 ? 'size-down' : 'size-up'">
                    ({{ sizeDiff < 0 ? '缩小' : '增大' }} {{ formatFileSize(Math.abs(sizeDiff)) }})
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button class="action-btn" @click="downloadConverted" :disabled="!convertedBlob">
            下载 {{ targetFormat }} 图片
          </button>
        </div>
      </div>

      <!-- Tab 2: Resize -->
      <div v-if="activeTab === 'resize'" class="tab-panel" role="tabpanel">
        <div class="panel-card">
          <h3 class="panel-heading">尺寸调整</h3>
          <div class="field-row">
            <div class="field">
              <label class="field-label" for="resize-w">宽度 (px)</label>
              <input
                id="resize-w"
                v-model.number="resizeW"
                type="number"
                min="1"
                max="10000"
                @input="onResizeInput('w')"
              />
            </div>
            <div class="field">
              <label class="field-label" for="resize-h">高度 (px)</label>
              <input
                id="resize-h"
                v-model.number="resizeH"
                type="number"
                min="1"
                max="10000"
                @input="onResizeInput('h')"
              />
            </div>
          </div>
          <div class="lock-row">
            <button class="lock-btn" :class="{ locked: lockAspect }" @click="lockAspect = !lockAspect">
              {{ lockAspect ? '🔗 锁定宽高比' : '🔓 解锁宽高比' }}
            </button>
          </div>
          <div class="field">
            <label class="field-label">预设尺寸</label>
            <div class="preset-row">
              <button v-for="p in sizePresets" :key="p.label" class="preset-btn" @click="applyPreset(p)">
                {{ p.label }}
              </button>
            </div>
          </div>
          <div class="field">
            <label class="field-label">预览</label>
            <div class="preview-box">
              <img v-if="resizedUrl" :src="resizedUrl" class="preview-img" alt="调整后预览" />
              <span v-else class="result-placeholder">调整尺寸后自动预览</span>
            </div>
          </div>
          <div class="field">
            <div class="result-box">
              <span class="result-text">
                原始：{{ sourceImage.naturalWidth }} × {{ sourceImage.naturalHeight }}
                → 调整后：{{ resizeW }} × {{ resizeH }}
              </span>
            </div>
          </div>
          <button class="action-btn" @click="downloadResized">
            下载调整后的图片
          </button>
        </div>
      </div>

      <!-- Tab 3: Crop -->
      <div v-if="activeTab === 'crop'" class="tab-panel" role="tabpanel">
        <div class="panel-card">
          <h3 class="panel-heading">图片裁剪</h3>
          <div class="field">
            <label class="field-label">裁剪比例</label>
            <div class="preset-row">
              <button
                v-for="r in cropRatios"
                :key="r.label"
                class="preset-btn"
                :class="{ active: cropRatioLabel === r.label }"
                @click="setCropRatio(r)"
              >
                {{ r.label }}
              </button>
            </div>
          </div>
          <div class="field">
            <label class="field-label">裁剪区域（拖拽移动，四角缩放）</label>
            <div
              ref="cropContainer"
              class="crop-container"
              @mousedown="onCropMouseDown"
              @mousemove="onCropMouseMove"
              @mouseup="onCropMouseUp"
              @mouseleave="onCropMouseUp"
              @touchstart.prevent="onCropTouchStart"
              @touchmove.prevent="onCropTouchMove"
              @touchend="onCropTouchEnd"
            >
              <img
                ref="cropImage"
                :src="sourceDataUrl"
                class="crop-source-img"
                alt="裁剪原图"
                @load="initCrop"
              />
              <!-- Crop mask -->
              <div
                class="crop-mask crop-mask-top"
                :style="cropMaskStyle.top"
              ></div>
              <div
                class="crop-mask crop-mask-bottom"
                :style="cropMaskStyle.bottom"
              ></div>
              <div
                class="crop-mask crop-mask-left"
                :style="cropMaskStyle.left"
              ></div>
              <div
                class="crop-mask crop-mask-right"
                :style="cropMaskStyle.right"
              ></div>
              <!-- Crop box -->
              <div class="crop-box" :style="cropBoxStyle">
                <div class="crop-handle crop-handle-nw" data-handle="nw"></div>
                <div class="crop-handle crop-handle-ne" data-handle="ne"></div>
                <div class="crop-handle crop-handle-sw" data-handle="sw"></div>
                <div class="crop-handle crop-handle-se" data-handle="se"></div>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="field-label">裁剪结果</label>
            <div class="preview-box">
              <img v-if="croppedUrl" :src="croppedUrl" class="preview-img" alt="裁剪预览" />
              <span v-else class="result-placeholder">调整裁剪区域后自动预览</span>
            </div>
          </div>
          <div class="field">
            <div class="result-box">
              <span class="result-text">
                裁剪尺寸：{{ cropRealW }} × {{ cropRealH }} px
              </span>
            </div>
          </div>
          <button class="action-btn" @click="downloadCropped">
            下载裁剪后的图片
          </button>
        </div>
      </div>

      <!-- Tab 4: Rotate & Flip -->
      <div v-if="activeTab === 'rotate'" class="tab-panel" role="tabpanel">
        <div class="panel-card">
          <h3 class="panel-heading">旋转翻转</h3>
          <div class="field">
            <label class="field-label">旋转</label>
            <div class="preset-row">
              <button class="preset-btn" @click="rotateImage(-90)">↺ 左转 90°</button>
              <button class="preset-btn" @click="rotateImage(90)">↻ 右转 90°</button>
              <button class="preset-btn" @click="rotateImage(180)">180°</button>
            </div>
          </div>
          <div class="field">
            <label class="field-label">翻转</label>
            <div class="preset-row">
              <button class="preset-btn" @click="flipImage('h')">⇔ 水平翻转</button>
              <button class="preset-btn" @click="flipImage('v')">⇕ 垂直翻转</button>
            </div>
          </div>
          <div class="field">
            <button class="preset-btn reset-btn" @click="resetRotate">重置</button>
          </div>
          <div class="field">
            <label class="field-label">预览</label>
            <div class="preview-box">
              <img v-if="rotatedUrl" :src="rotatedUrl" class="preview-img" alt="旋转翻转预览" />
              <span v-else class="result-placeholder">操作后自动预览</span>
            </div>
          </div>
          <button class="action-btn" @click="downloadRotated">
            下载处理后的图片
          </button>
        </div>
      </div>

      <!-- Tab 5: Text Watermark -->
      <div v-if="activeTab === 'watermark'" class="tab-panel" role="tabpanel">
        <div class="panel-card">
          <h3 class="panel-heading">文字水印</h3>
          <div class="field">
            <label class="field-label" for="wm-text">水印文字</label>
            <input
              id="wm-text"
              v-model="wmText"
              type="text"
              placeholder="输入水印文字"
              @input="applyWatermark"
            />
          </div>
          <div class="field-row">
            <div class="field">
              <label class="field-label">字号：{{ wmFontSize }}px</label>
              <input
                type="range"
                min="12"
                max="200"
                v-model.number="wmFontSize"
                @input="applyWatermark"
                class="quality-slider"
              />
            </div>
            <div class="field">
              <label class="field-label">透明度：{{ wmOpacity }}%</label>
              <input
                type="range"
                min="5"
                max="100"
                v-model.number="wmOpacity"
                @input="applyWatermark"
                class="quality-slider"
              />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label class="field-label" for="wm-color">颜色</label>
              <input
                id="wm-color"
                v-model="wmColor"
                type="color"
                @input="applyWatermark"
                class="color-input"
              />
            </div>
            <div class="field">
              <label class="field-label">旋转角度：{{ wmRotation }}°</label>
              <input
                type="range"
                min="-90"
                max="90"
                v-model.number="wmRotation"
                @input="applyWatermark"
                class="quality-slider"
              />
            </div>
          </div>
          <div class="field">
            <label class="field-label">位置</label>
            <div class="position-grid">
              <button
                v-for="pos in wmPositions"
                :key="pos.value"
                class="position-btn"
                :class="{ active: wmPosition === pos.value }"
                @click="wmPosition = pos.value; applyWatermark()"
              >
                {{ pos.label }}
              </button>
            </div>
          </div>
          <div class="field">
            <label class="field-label">预览</label>
            <div class="preview-box">
              <img v-if="watermarkedUrl" :src="watermarkedUrl" class="preview-img" alt="水印预览" />
              <span v-else class="result-placeholder">输入文字后自动预览</span>
            </div>
          </div>
          <button class="action-btn" @click="downloadWatermarked" :disabled="!wmText">
            下载带水印的图片
          </button>
        </div>
      </div>

      <!-- Tab 6: Image Info -->
      <div v-if="activeTab === 'info'" class="tab-panel" role="tabpanel">
        <div class="panel-card">
          <h3 class="panel-heading">图片信息</h3>
          <div class="info-section">
            <h4 class="info-subheading">基本信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">文件名</span>
                <span class="info-value">{{ uploadedFile?.name ?? '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">格式</span>
                <span class="info-value">{{ getFormatFromType(uploadedFile?.type ?? '') }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">尺寸</span>
                <span class="info-value">{{ sourceImage.naturalWidth }} × {{ sourceImage.naturalHeight }} px</span>
              </div>
              <div class="info-item">
                <span class="info-label">文件大小</span>
                <span class="info-value">{{ formatFileSize(uploadedFile?.size ?? 0) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">宽高比</span>
                <span class="info-value">{{ aspectRatioLabel(sourceImage.naturalWidth, sourceImage.naturalHeight) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">最后修改</span>
                <span class="info-value">{{ fileLastModified }}</span>
              </div>
            </div>
          </div>
          <div v-if="exifData && exifData.length > 0" class="info-section">
            <h4 class="info-subheading">EXIF 信息</h4>
            <div class="info-grid">
              <div v-for="item in exifData" :key="item.label" class="info-item">
                <span class="info-label">{{ item.label }}</span>
                <span class="info-value">{{ item.value }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="exifChecked" class="info-section">
            <p class="no-exif">该图片不含 EXIF 信息</p>
          </div>
          <button class="action-btn" @click="clearExifAndDownload">
            清除 EXIF 并下载
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import EXIF from 'exif-js'

// SEO
useHead({
  title: '图片处理工具 - 青萍之末',
  meta: [
    { name: 'description', content: '在线图片处理工具——格式转换、尺寸调整、图片裁剪、旋转翻转、文字水印、EXIF 信息查看。纯浏览器本地处理，图片不上传。' },
    { property: 'og:title', content: '图片处理工具 - 青萍之末' },
    { property: 'og:description', content: '在线图片处理工具——格式转换、尺寸调整、图片裁剪、旋转翻转、文字水印、图片信息查看。' },
    { property: 'og:url', content: 'https://tools.qingpingmo.com/tools/image' },
  ],
  link: [
    { rel: 'canonical', href: 'https://tools.qingpingmo.com/tools/image' },
  ],
})

// ===== Shared utilities =====
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function getFormatFromType(mime: string): string {
  const map: Record<string, string> = {
    'image/png': 'PNG',
    'image/jpeg': 'JPEG',
    'image/webp': 'WebP',
    'image/avif': 'AVIF',
    'image/bmp': 'BMP',
    'image/gif': 'GIF',
    'image/svg+xml': 'SVG',
  }
  return map[mime] ?? mime.replace('image/', '').toUpperCase()
}

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

function supportsFormat(format: string): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  try {
    const dataUrl = canvas.toDataURL(getMimeFromFormat(format))
    return dataUrl.startsWith(`data:${getMimeFromFormat(format)}`)
  } catch {
    return false
  }
}

function aspectRatioLabel(w: number, h: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const d = gcd(w, h)
  return `${w / d}:${h / d}`
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function canvasToBlob(canvas: HTMLCanvasElement, format: string = 'image/png', quality: number = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas 转换失败'))
    }, format, quality)
  })
}

// ===== Shared state =====
const fileInput = ref<HTMLInputElement>()
const sourceImage = ref<HTMLImageElement | null>(null)
const uploadedFile = ref<File | null>(null)
const sourceDataUrl = ref('')
const isDragging = ref(false)

const tabs = [
  { id: 'format' as const, label: '格式转换' },
  { id: 'resize' as const, label: '尺寸调整' },
  { id: 'crop' as const, label: '图片裁剪' },
  { id: 'rotate' as const, label: '旋转翻转' },
  { id: 'watermark' as const, label: '文字水印' },
  { id: 'info' as const, label: '图片信息' },
]
const activeTab = ref<typeof tabs[number]['id']>('format')

function triggerUpload() {
  fileInput.value?.click()
}

function resetImage() {
  sourceImage.value = null
  uploadedFile.value = null
  sourceDataUrl.value = ''
  activeTab.value = 'format'
  resetAllTabs()
}

async function loadSourceImage(file: File) {
  uploadedFile.value = file
  const url = URL.createObjectURL(file)
  sourceDataUrl.value = url
  const img = new Image()
  img.onload = () => {
    sourceImage.value = img
    resetAllTabs()
  }
  img.src = url
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) loadSourceImage(file)
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file?.type.startsWith('image/')) loadSourceImage(file)
}

// ===== Tab 1: Format Conversion =====
const targetFormat = ref('PNG')
const targetQuality = ref(92)
const convertedUrl = ref('')
const convertedBlob = ref<Blob | null>(null)
const convertedSize = ref<number | null>(null)
const sizeDiff = ref(0)

const availableFormats = [
  { value: 'PNG', label: 'PNG — 无损，支持透明' },
  { value: 'JPEG', label: 'JPEG — 有损，适合照片' },
  { value: 'WebP', label: 'WebP — 体积小，现代格式' },
  { value: 'AVIF', label: 'AVIF — 最新格式，压缩率高' },
  { value: 'BMP', label: 'BMP — 无压缩，位图格式' },
]

const showQualitySlider = computed(() =>
  ['JPEG', 'WebP', 'AVIF'].includes(targetFormat.value),
)

async function convertFormat() {
  if (!sourceImage.value) return
  const mime = getMimeFromFormat(targetFormat.value)
  const canvas = document.createElement('canvas')
  canvas.width = sourceImage.value.naturalWidth
  canvas.height = sourceImage.value.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(sourceImage.value, 0, 0)

  try {
    const blob = await canvasToBlob(canvas, mime, targetQuality.value / 100)
    convertedBlob.value = blob
    convertedSize.value = blob.size
    sizeDiff.value = blob.size - (uploadedFile.value?.size ?? 0)
    if (convertedUrl.value) URL.revokeObjectURL(convertedUrl.value)
    convertedUrl.value = URL.createObjectURL(blob)
  } catch {
    convertedUrl.value = ''
    convertedBlob.value = null
    convertedSize.value = null
  }
}

function downloadConverted() {
  if (!convertedBlob.value) return
  const ext = targetFormat.value.toLowerCase()
  const name = (uploadedFile.value?.name ?? 'image').replace(/\.[^.]+$/, '')
  triggerDownload(convertedBlob.value, `${name}.${ext}`)
}

// ===== Tab 2: Resize =====
const resizeW = ref(0)
const resizeH = ref(0)
const lockAspect = ref(true)
const resizedUrl = ref('')

const sizePresets = [
  { label: '50%', wFactor: 0.5, hFactor: 0.5 },
  { label: '200%', wFactor: 2, hFactor: 2 },
  { label: '1080p', wFactor: null, w: 1920, h: 1080 },
  { label: '720p', wFactor: null, w: 1280, h: 720 },
  { label: '头像', wFactor: null, w: 512, h: 512 },
]

function initResize() {
  if (!sourceImage.value) return
  resizeW.value = sourceImage.value.naturalWidth
  resizeH.value = sourceImage.value.naturalHeight
  doResize()
}

function onResizeInput(changed: 'w' | 'h') {
  if (!sourceImage.value || !lockAspect.value) {
    doResize()
    return
  }
  const ratio = sourceImage.value.naturalWidth / sourceImage.value.naturalHeight
  if (changed === 'w') {
    resizeH.value = Math.round(resizeW.value / ratio)
  } else {
    resizeW.value = Math.round(resizeH.value * ratio)
  }
  doResize()
}

function applyPreset(p: (typeof sizePresets)[number]) {
  if (!sourceImage.value) return
  if (p.wFactor !== null) {
    resizeW.value = Math.round(sourceImage.value.naturalWidth * p.wFactor)
    resizeH.value = Math.round(sourceImage.value.naturalHeight * p.hFactor!)
  } else {
    resizeW.value = p.w!
    resizeH.value = p.h!
  }
  lockAspect.value = false
  doResize()
}

async function doResize() {
  if (!sourceImage.value || resizeW.value < 1 || resizeH.value < 1) {
    resizedUrl.value = ''
    return
  }
  const canvas = document.createElement('canvas')
  canvas.width = resizeW.value
  canvas.height = resizeH.value
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(sourceImage.value, 0, 0, resizeW.value, resizeH.value)

  if (resizedUrl.value) URL.revokeObjectURL(resizedUrl.value)
  resizedUrl.value = canvas.toDataURL()
}

async function downloadResized() {
  if (!sourceImage.value) return
  const canvas = document.createElement('canvas')
  canvas.width = resizeW.value
  canvas.height = resizeH.value
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(sourceImage.value, 0, 0, resizeW.value, resizeH.value)
  const blob = await canvasToBlob(canvas)
  const name = (uploadedFile.value?.name ?? 'image').replace(/\.[^.]+$/, '')
  triggerDownload(blob, `${name}_resized.png`)
}

// ===== Tab 3: Crop =====
const cropContainer = ref<HTMLDivElement>()
const cropImage = ref<HTMLImageElement>()

// Crop state relative to displayed image dimensions
const cropX = ref(0)
const cropY = ref(0)
const cropW = ref(100)
const cropH = ref(100)

const cropRatioLabel = ref('自由')
const cropLockedRatio = ref<number | null>(null)
const croppedUrl = ref('')

const cropRealW = computed(() => {
  if (!sourceImage.value) return 0
  const imgEl = cropImage.value
  if (!imgEl) return 0
  const scaleX = sourceImage.value.naturalWidth / imgEl.clientWidth
  return Math.round(cropW.value * scaleX)
})

const cropRealH = computed(() => {
  if (!sourceImage.value) return 0
  const imgEl = cropImage.value
  if (!imgEl) return 0
  const scaleY = sourceImage.value.naturalHeight / imgEl.clientHeight
  return Math.round(cropH.value * scaleY)
})

const cropRatios = [
  { label: '自由', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:4', value: 3 / 4 },
  { label: '9:16', value: 9 / 16 },
  { label: '2:3', value: 2 / 3 },
]

const cropMaskStyle = computed(() => {
  return {
    top: { top: '0', left: '0', right: '0', height: `${cropY.value}px` },
    bottom: { top: `${cropY.value + cropH.value}px`, left: '0', right: '0', bottom: '0' },
    left: { top: `${cropY.value}px`, left: '0', width: `${cropX.value}px`, height: `${cropH.value}px` },
    right: { top: `${cropY.value}px`, left: `${cropX.value + cropW.value}px`, right: '0', height: `${cropH.value}px` },
  }
})

const cropBoxStyle = computed(() => ({
  left: `${cropX.value}px`,
  top: `${cropY.value}px`,
  width: `${cropW.value}px`,
  height: `${cropH.value}px`,
}))

function initCrop() {
  const imgEl = cropImage.value
  if (!imgEl) return
  const w = imgEl.clientWidth
  const h = imgEl.clientHeight
  // Default: center 75% area
  const cw = Math.round(w * 0.75)
  const ch = cropLockedRatio.value
    ? Math.round(cw / cropLockedRatio.value)
    : Math.round(h * 0.75)
  cropX.value = Math.round((w - cw) / 2)
  cropY.value = Math.round((h - ch) / 2)
  cropW.value = cw
  cropH.value = ch
  doCrop()
}

function setCropRatio(r: (typeof cropRatios)[number]) {
  cropRatioLabel.value = r.label
  cropLockedRatio.value = r.value
  initCrop()
}

// Crop dragging state
let cropDragging = false
let cropResizing = false
let cropDragHandle = ''
let cropStartX = 0
let cropStartY = 0
let cropStartCX = 0
let cropStartCY = 0
let cropStartCW = 0
let cropStartCH = 0

function getCropPos(e: MouseEvent | Touch): { x: number; y: number } {
  const container = cropContainer.value
  if (!container) return { x: 0, y: 0 }
  const rect = container.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function clampCrop() {
  const imgEl = cropImage.value
  if (!imgEl) return
  const maxW = imgEl.clientWidth
  const maxH = imgEl.clientHeight

  cropX.value = Math.max(0, Math.min(cropX.value, maxW - cropW.value))
  cropY.value = Math.max(0, Math.min(cropY.value, maxH - cropH.value))
  cropW.value = Math.max(10, Math.min(cropW.value, maxW - cropX.value))
  cropH.value = Math.max(10, Math.min(cropH.value, maxH - cropY.value))
}

function onCropMouseDown(e: MouseEvent) {
  const target = e.target as HTMLElement
  const handle = target.dataset.handle

  if (handle) {
    cropResizing = true
    cropDragHandle = handle
  } else if (target.classList.contains('crop-box') || (target as HTMLElement).closest('.crop-box')) {
    cropDragging = true
  } else {
    // Start a new crop from this point
    const pos = getCropPos(e)
    cropStartX = pos.x
    cropStartY = pos.y
    cropDragging = true
    cropResizing = true
    cropDragHandle = 'se'
    cropX.value = pos.x
    cropY.value = pos.y
    cropW.value = 10
    cropH.value = 10
    cropStartCX = cropX.value
    cropStartCY = cropY.value
    cropStartCW = cropW.value
    cropStartCH = cropH.value
    return
  }

  const pos = getCropPos(e)
  cropStartX = pos.x
  cropStartY = pos.y
  cropStartCX = cropX.value
  cropStartCY = cropY.value
  cropStartCW = cropW.value
  cropStartCH = cropH.value
}

function onCropMouseMove(e: MouseEvent) {
  if (!cropDragging && !cropResizing) return
  const pos = getCropPos(e)
  const dx = pos.x - cropStartX
  const dy = pos.y - cropStartY

  if (cropDragging && !cropResizing) {
    cropX.value = cropStartCX + dx
    cropY.value = cropStartCY + dy
  } else if (cropResizing) {
    handleCropResize(dx, dy)
  }
  clampCrop()
}

function onCropMouseUp() {
  if (cropDragging || cropResizing) {
    cropDragging = false
    cropResizing = false
    cropDragHandle = ''
    doCrop()
  }
}

function handleCropResize(dx: number, dy: number) {
  const ratio = cropLockedRatio.value
  let nx = cropStartCX
  let ny = cropStartCY
  let nw = cropStartCW
  let nh = cropStartCH

  switch (cropDragHandle) {
    case 'nw':
      nx = cropStartCX + dx
      ny = cropStartCY + dy
      nw = cropStartCW - dx
      nh = cropStartCH - dy
      break
    case 'ne':
      ny = cropStartCY + dy
      nw = cropStartCW + dx
      nh = cropStartCH - dy
      break
    case 'sw':
      nx = cropStartCX + dx
      nw = cropStartCW - dx
      nh = cropStartCH + dy
      break
    case 'se':
      nw = cropStartCW + dx
      nh = cropStartCH + dy
      break
  }

  if (ratio && nw > 0) {
    nh = nw / ratio
  }

  if (nw >= 10) {
    if (cropDragHandle === 'nw' || cropDragHandle === 'sw') {
      cropX.value = nx
    }
    cropW.value = nw
  }
  if (nh >= 10) {
    if (cropDragHandle === 'nw' || cropDragHandle === 'ne') {
      cropY.value = ny
    }
    cropH.value = nh
  }
}

// Touch handlers
function onCropTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    // Create a fake event from touch
    const touch = e.touches[0]
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    })
    // Set the target manually
    const elem = document.elementFromPoint(touch.clientX, touch.clientY)
    if (elem) {
      Object.defineProperty(mouseEvent, 'target', { value: elem, writable: false })
    }
    onCropMouseDown(mouseEvent)
  }
}

function onCropTouchMove(e: TouchEvent) {
  if (e.touches.length === 1 && (cropDragging || cropResizing)) {
    const touch = e.touches[0]
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    })
    onCropMouseMove(mouseEvent)
  }
}

function onCropTouchEnd() {
  onCropMouseUp()
}

async function doCrop() {
  if (!sourceImage.value) return
  const imgEl = cropImage.value
  if (!imgEl) return

  const scaleX = sourceImage.value.naturalWidth / imgEl.clientWidth
  const scaleY = sourceImage.value.naturalHeight / imgEl.clientHeight

  const sx = Math.round(cropX.value * scaleX)
  const sy = Math.round(cropY.value * scaleY)
  const sw = Math.round(cropW.value * scaleX)
  const sh = Math.round(cropH.value * scaleY)

  const canvas = document.createElement('canvas')
  canvas.width = sw
  canvas.height = sh
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(sourceImage.value, sx, sy, sw, sh, 0, 0, sw, sh)

  if (croppedUrl.value) URL.revokeObjectURL(croppedUrl.value)
  croppedUrl.value = canvas.toDataURL()
}

async function downloadCropped() {
  if (!croppedUrl.value) return
  const blob = await (await fetch(croppedUrl.value)).blob()
  const name = (uploadedFile.value?.name ?? 'image').replace(/\.[^.]+$/, '')
  triggerDownload(blob, `${name}_cropped.png`)
}

// ===== Tab 4: Rotate & Flip =====
const rotateAngle = ref(0)
const flipH = ref(false)
const flipV = ref(false)
const rotatedUrl = ref('')

async function applyRotate() {
  if (!sourceImage.value) return
  if (rotateAngle.value === 0 && !flipH.value && !flipV.value) {
    rotatedUrl.value = sourceDataUrl.value
    return
  }

  let w = sourceImage.value.naturalWidth
  let h = sourceImage.value.naturalHeight

  // Swap dimensions for 90/270 degree rotations
  if (Math.abs(rotateAngle.value % 180) === 90) {
    ;[w, h] = [h, w]
  }

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  ctx.translate(w / 2, h / 2)
  ctx.rotate((rotateAngle.value * Math.PI) / 180)
  ctx.scale(flipH.value ? -1 : 1, flipV.value ? -1 : 1)
  ctx.drawImage(
    sourceImage.value,
    -sourceImage.value.naturalWidth / 2,
    -sourceImage.value.naturalHeight / 2,
  )

  if (rotatedUrl.value && rotatedUrl.value !== sourceDataUrl.value) {
    URL.revokeObjectURL(rotatedUrl.value)
  }
  rotatedUrl.value = canvas.toDataURL()
}

function rotateImage(deg: number) {
  rotateAngle.value = (rotateAngle.value + deg) % 360
  if (rotateAngle.value < 0) rotateAngle.value += 360
  applyRotate()
}

function flipImage(dir: 'h' | 'v') {
  if (dir === 'h') flipH.value = !flipH.value
  else flipV.value = !flipV.value
  applyRotate()
}

function resetRotate() {
  rotateAngle.value = 0
  flipH.value = false
  flipV.value = false
  applyRotate()
}

async function downloadRotated() {
  if (!rotatedUrl.value) return
  const blob = await (await fetch(rotatedUrl.value)).blob()
  const name = (uploadedFile.value?.name ?? 'image').replace(/\.[^.]+$/, '')
  triggerDownload(blob, `${name}_rotated.png`)
}

// ===== Tab 5: Text Watermark =====
const wmText = ref('')
const wmFontSize = ref(48)
const wmOpacity = ref(50)
const wmColor = ref('#ffffff')
const wmRotation = ref(0)
const wmPosition = ref('center')
const watermarkedUrl = ref('')

const wmPositions = [
  { value: 'nw', label: '左上' },
  { value: 'n', label: '中上' },
  { value: 'ne', label: '右上' },
  { value: 'w', label: '左中' },
  { value: 'center', label: '正中' },
  { value: 'e', label: '右中' },
  { value: 'sw', label: '左下' },
  { value: 's', label: '中下' },
  { value: 'se', label: '右下' },
]

async function applyWatermark() {
  if (!sourceImage.value) return
  if (!wmText.value.trim()) {
    watermarkedUrl.value = ''
    return
  }

  const w = sourceImage.value.naturalWidth
  const h = sourceImage.value.naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  // Draw original image
  ctx.drawImage(sourceImage.value, 0, 0)

  // Draw watermark text
  const fontSize = wmFontSize.value
  ctx.font = `${fontSize}px "LXGW WenKai Screen", "PingFang SC", "Microsoft YaHei", sans-serif`
  ctx.fillStyle = wmColor.value
  ctx.globalAlpha = wmOpacity.value / 100

  const metrics = ctx.measureText(wmText.value)
  const textWidth = metrics.width
  const textHeight = fontSize

  // Calculate position
  const padding = 30
  let tx: number, ty: number

  const colMap: Record<string, number> = {
    w: padding,
    center: (w - textWidth) / 2,
    e: w - textWidth - padding,
    nw: padding,
    n: (w - textWidth) / 2,
    ne: w - textWidth - padding,
    sw: padding,
    s: (w - textWidth) / 2,
    se: w - textWidth - padding,
  }

  const rowMap: Record<string, number> = {
    nw: padding + textHeight,
    n: padding + textHeight,
    ne: padding + textHeight,
    w: (h + textHeight) / 2,
    center: (h + textHeight) / 2,
    e: (h + textHeight) / 2,
    sw: h - padding,
    s: h - padding,
    se: h - padding,
  }

  tx = colMap[wmPosition.value] ?? (w - textWidth) / 2
  ty = rowMap[wmPosition.value] ?? (h + textHeight) / 2

  // Apply rotation around text center
  ctx.save()
  const cx = tx + textWidth / 2
  const cy = ty - textHeight / 2
  ctx.translate(cx, cy)
  ctx.rotate((wmRotation.value * Math.PI) / 180)
  ctx.fillText(wmText.value, -textWidth / 2, textHeight / 2)
  ctx.restore()

  if (watermarkedUrl.value) URL.revokeObjectURL(watermarkedUrl.value)
  watermarkedUrl.value = canvas.toDataURL()
}

async function downloadWatermarked() {
  if (!watermarkedUrl.value) return
  const blob = await (await fetch(watermarkedUrl.value)).blob()
  const name = (uploadedFile.value?.name ?? 'image').replace(/\.[^.]+$/, '')
  triggerDownload(blob, `${name}_watermarked.png`)
}

// ===== Tab 6: Image Info =====
const exifData = ref<{ label: string; value: string }[]>([])
const exifChecked = ref(false)

const fileLastModified = computed(() => {
  if (!uploadedFile.value) return '—'
  const d = new Date(uploadedFile.value.lastModified)
  return d.toLocaleString('zh-CN')
})

function readExif() {
  exifChecked.value = false
  exifData.value = []

  if (!uploadedFile.value || uploadedFile.value.type !== 'image/jpeg') {
    exifChecked.value = true
    return
  }

  // Use FileReader to get the data for EXIF parsing
  const reader = new FileReader()
  reader.onload = function () {
    try {
      EXIF.getData(uploadedFile.value!, function (this: unknown) {
        const exif = this as Record<string, unknown>
        const items: { label: string; value: string }[] = []

        const make = exif.Make as string | undefined
        const model = exif.Model as string | undefined
        if (make || model) {
          items.push({ label: '拍摄设备', value: [make, model].filter(Boolean).join(' ') })
        }

        const aperture = exif.FNumber as number | undefined
        if (aperture) items.push({ label: '光圈', value: `f/${aperture}` })

        const shutter = exif.ExposureTime as number | undefined
        if (shutter) {
          items.push({ label: '快门', value: shutter < 1 ? `1/${Math.round(1 / shutter)}s` : `${shutter}s` })
        }

        const iso = exif.ISOSpeedRatings as number | undefined
        if (iso) items.push({ label: 'ISO', value: String(iso) })

        const focal = exif.FocalLength as number | undefined
        if (focal) items.push({ label: '焦距', value: `${focal}mm` })

        const dateTime = exif.DateTimeOriginal as string | undefined
        if (dateTime) items.push({ label: '拍摄时间', value: dateTime })

        const gpsLat = exif.GPSLatitude as number[] | undefined
        const gpsLatRef = exif.GPSLatitudeRef as string | undefined
        const gpsLon = exif.GPSLongitude as number[] | undefined
        const gpsLonRef = exif.GPSLongitudeRef as string | undefined
        if (gpsLat && gpsLon) {
          const lat = gpsLat[0] + gpsLat[1] / 60 + gpsLat[2] / 3600
          const lon = gpsLon[0] + gpsLon[1] / 60 + gpsLon[2] / 3600
          items.push({
            label: 'GPS',
            value: `${lat.toFixed(4)}°${gpsLatRef ?? 'N'}, ${lon.toFixed(4)}°${gpsLonRef ?? 'E'}`,
          })
        }

        const software = exif.Software as string | undefined
        if (software) items.push({ label: '软件', value: software })

        exifData.value = items
        exifChecked.value = true
      })
    } catch {
      exifChecked.value = true
    }
  }
  reader.readAsArrayBuffer(uploadedFile.value)
}

async function clearExifAndDownload() {
  if (!sourceImage.value) return
  const canvas = document.createElement('canvas')
  canvas.width = sourceImage.value.naturalWidth
  canvas.height = sourceImage.value.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(sourceImage.value, 0, 0)
  const blob = await canvasToBlob(canvas)
  const name = (uploadedFile.value?.name ?? 'image').replace(/\.[^.]+$/, '')
  triggerDownload(blob, `${name}_noexif.png`)
}

// ===== Reset all tabs =====
function resetAllTabs() {
  // Format
  convertedUrl.value = ''
  convertedBlob.value = null
  convertedSize.value = null
  sizeDiff.value = 0

  // Resize
  initResize()

  // Crop
  nextTick(initCrop)

  // Rotate
  rotateAngle.value = 0
  flipH.value = false
  flipV.value = false
  if (sourceImage.value) {
    rotatedUrl.value = sourceDataUrl.value
  }

  // Watermark
  watermarkedUrl.value = ''

  // EXIF
  exifData.value = []
  exifChecked.value = false
  if (uploadedFile.value) readExif()
}

// ===== Watch for tab changes =====
watch(activeTab, (tab) => {
  if (tab === 'crop') nextTick(initCrop)
})

watch(sourceImage, (img) => {
  if (img) {
    initResize()
    readExif()
  }
})
</script>

<style scoped>
/* ===== Page layout ===== */
.tool-page {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 2rem;
}

/* ===== Breadcrumb ===== */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 0 0.75rem;
  font-size: 0.875rem;
}

.breadcrumb-link {
  color: var(--color-light-ink);
  text-decoration: none;
}

.breadcrumb-link:hover {
  color: var(--color-duckweed);
}

.breadcrumb-sep {
  color: var(--color-rain);
}

.breadcrumb-current {
  color: var(--color-ink);
}

/* ===== Page header ===== */
.page-header {
  text-align: center;
  padding: 2rem 0 1.5rem;
}

.page-title {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 500;
  color: var(--color-ink);
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.page-desc {
  font-size: 0.9375rem;
  color: var(--color-light-ink);
}

/* ===== Upload section ===== */
.upload-section {
  margin-bottom: 2rem;
}

.drop-zone {
  border: 2px dashed var(--color-rain);
  border-radius: var(--radius-lg);
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.25s, background-color 0.25s;
  background: var(--color-white);
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: var(--color-duckweed);
  background: var(--color-surface);
}

.drop-zone.has-image {
  padding: 1.25rem 1.5rem;
  cursor: default;
}

.drop-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.drop-text {
  font-size: 1rem;
  color: var(--color-ink);
  margin-bottom: 0.5rem;
}

.drop-hint {
  font-size: 0.8125rem;
  color: var(--color-light-ink);
}

.file-input-hidden {
  display: none;
}

/* Uploaded info */
.uploaded-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
}

.uploaded-thumb {
  width: 4rem;
  height: 4rem;
  object-fit: cover;
  border-radius: var(--radius);
  border: 1px solid var(--color-rain);
  flex-shrink: 0;
}

.uploaded-meta {
  flex: 1;
  min-width: 0;
}

.uploaded-name {
  font-size: 0.9375rem;
  color: var(--color-ink);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.uploaded-detail {
  font-size: 0.8125rem;
  color: var(--color-light-ink);
  margin-top: 0.125rem;
}

.change-btn {
  flex-shrink: 0;
  font-size: 0.8125rem;
  color: var(--color-duckweed);
  background: none;
  border: 1px solid var(--color-rain);
  border-radius: var(--radius);
  padding: 0.375rem 0.875rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.change-btn:hover {
  border-color: var(--color-duckweed);
}

/* ===== Tabs ===== */
.tabs-section {
  margin-bottom: var(--section-gap);
}

.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--color-rain);
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.tab {
  flex-shrink: 0;
  padding: 0.75rem 1.25rem;
  font-size: 0.9375rem;
  color: var(--color-light-ink);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  letter-spacing: 0.04em;
}

.tab:hover {
  color: var(--color-ink);
}

.tab.active {
  color: var(--color-duckweed);
  border-bottom-color: var(--color-duckweed);
  font-weight: 500;
}

/* ===== Tab panels ===== */
.tab-panel {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.panel-card {
  background: var(--color-white);
  border: 1px solid var(--color-rain);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.panel-heading {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 500;
  color: var(--color-ink);
  margin-bottom: 1.25rem;
  letter-spacing: 0.05em;
}

/* ===== Form fields ===== */
.field {
  margin-bottom: 1rem;
}

.field:last-child {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-size: 0.8125rem;
  color: var(--color-light-ink);
  margin-bottom: 0.375rem;
  letter-spacing: 0.03em;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

/* ===== Quality slider ===== */
.quality-slider {
  width: 100%;
  height: 6px;
  appearance: none;
  background: var(--color-rain);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  padding: 0;
  border: none;
}

.quality-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-duckweed);
  cursor: pointer;
  border: 2px solid var(--color-white);
}

/* ===== Compare row (format conversion) ===== */
.compare-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.compare-item {
  flex: 1;
  min-width: 0;
}

.compare-label {
  font-size: 0.8125rem;
  color: var(--color-light-ink);
  margin-bottom: 0.375rem;
  font-weight: 500;
}

.compare-img {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: var(--radius);
  border: 1px solid var(--color-rain);
  background: var(--color-surface);
}

.compare-placeholder {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  color: var(--color-rain);
  background: var(--color-surface);
  border-radius: var(--radius);
  border: 1px solid var(--color-rain);
}

.compare-size {
  font-size: 0.75rem;
  color: var(--color-light-ink);
  margin-top: 0.25rem;
}

.compare-size.changed {
  font-weight: 500;
  color: var(--color-ink);
}

.size-down {
  color: var(--color-duckweed);
  margin-left: 0.25rem;
}

.size-up {
  color: #c44;
  margin-left: 0.25rem;
}

.compare-arrow {
  flex-shrink: 0;
  font-size: 1.5rem;
  color: var(--color-light-ink);
  padding-top: 3rem;
}

/* ===== Lock row (resize) ===== */
.lock-row {
  margin-bottom: 1rem;
}

.lock-btn {
  font-size: 0.8125rem;
  color: var(--color-light-ink);
  background: var(--color-surface);
  border: 1px solid var(--color-rain);
  border-radius: var(--radius);
  padding: 0.375rem 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.lock-btn.locked {
  color: var(--color-duckweed);
  border-color: var(--color-duckweed);
}

/* ===== Preset buttons ===== */
.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preset-btn {
  font-size: 0.8125rem;
  color: var(--color-light-ink);
  background: var(--color-surface);
  border: 1px solid var(--color-rain);
  border-radius: var(--radius);
  padding: 0.375rem 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.preset-btn:hover {
  border-color: var(--color-duckweed);
  color: var(--color-duckweed);
}

.preset-btn.active {
  background: var(--color-duckweed);
  color: var(--color-white);
  border-color: var(--color-duckweed);
}

.reset-btn {
  color: #c44;
}

.reset-btn:hover {
  border-color: #c44;
  color: #c44;
}

/* ===== Preview box ===== */
.preview-box {
  background: var(--color-surface);
  border: 1px solid var(--color-rain);
  border-radius: var(--radius);
  padding: 0.75rem;
  text-align: center;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

/* ===== Result box ===== */
.result-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-rain);
  border-radius: var(--radius);
  padding: 0.625rem 0.875rem;
}

.result-text {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--color-ink);
}

.result-placeholder {
  font-size: 0.8125rem;
  color: var(--color-rain);
}

/* ===== Action button ===== */
.action-btn {
  display: block;
  width: 100%;
  margin-top: 1.25rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  color: var(--color-white);
  background: var(--color-duckweed);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: opacity 0.2s;
  letter-spacing: 0.05em;
}

.action-btn:hover {
  opacity: 0.85;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===== Crop container ===== */
.crop-container {
  position: relative;
  display: inline-block;
  max-width: 100%;
  cursor: crosshair;
  user-select: none;
  -webkit-user-select: none;
  line-height: 0;
}

.crop-source-img {
  max-width: 100%;
  height: auto;
  display: block;
  pointer-events: none;
}

.crop-mask {
  position: absolute;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.crop-box {
  position: absolute;
  border: 2px dashed #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  cursor: move;
}

.crop-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--color-white);
  border: 2px solid var(--color-duckweed);
  border-radius: 2px;
}

.crop-handle-nw { top: -6px; left: -6px; cursor: nw-resize; }
.crop-handle-ne { top: -6px; right: -6px; cursor: ne-resize; }
.crop-handle-sw { bottom: -6px; left: -6px; cursor: sw-resize; }
.crop-handle-se { bottom: -6px; right: -6px; cursor: se-resize; }

/* ===== Color input ===== */
.color-input {
  width: 3rem;
  height: 2.25rem;
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  cursor: pointer;
  background: var(--color-white);
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 3px;
}

/* ===== Position grid (watermark) ===== */
.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.375rem;
  max-width: 240px;
}

.position-btn {
  font-size: 0.75rem;
  color: var(--color-light-ink);
  background: var(--color-surface);
  border: 1px solid var(--color-rain);
  border-radius: var(--radius);
  padding: 0.375rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.position-btn:hover {
  border-color: var(--color-duckweed);
  color: var(--color-duckweed);
}

.position-btn.active {
  background: var(--color-duckweed);
  color: var(--color-white);
  border-color: var(--color-duckweed);
}

/* ===== Image Info ===== */
.info-section {
  margin-bottom: 1.5rem;
}

.info-subheading {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-ink);
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-rain);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.375rem 0;
  border-bottom: 1px dotted var(--color-rain);
}

.info-label {
  font-size: 0.8125rem;
  color: var(--color-light-ink);
  flex-shrink: 0;
}

.info-value {
  font-size: 0.875rem;
  color: var(--color-ink);
  text-align: right;
  font-family: var(--font-mono);
  word-break: break-all;
}

.no-exif {
  font-size: 0.875rem;
  color: var(--color-light-ink);
  text-align: center;
  padding: 1rem;
}

/* ===== Responsive ===== */
@media (max-width: 640px) {
  .tool-page {
    padding: 0 1.25rem;
  }

  .breadcrumb {
    padding-top: 1rem;
  }

  .page-header {
    padding: 1.25rem 0 1rem;
  }

  .drop-zone {
    padding: 2rem 1.25rem;
  }

  .drop-zone.has-image {
    padding: 1rem 1.125rem;
  }

  .uploaded-info {
    gap: 0.75rem;
  }

  .uploaded-thumb {
    width: 3rem;
    height: 3rem;
  }

  .tabs {
    gap: 0;
  }

  .tab {
    padding: 0.625rem 0.875rem;
    font-size: 0.8125rem;
  }

  .panel-card {
    padding: 1.125rem;
  }

  .field-row {
    grid-template-columns: 1fr;
  }

  .compare-row {
    flex-direction: column;
    gap: 0.75rem;
  }

  .compare-arrow {
    transform: rotate(90deg);
    padding-top: 0;
    text-align: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
