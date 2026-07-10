<template>
  <div class="tool-page">
    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="面包屑导航">
      <NuxtLink to="/" class="breadcrumb-link">首页</NuxtLink>
      <span class="breadcrumb-sep" aria-hidden="true">/</span>
      <span class="breadcrumb-current">PDF 处理</span>
    </nav>

    <!-- Page header -->
    <section class="page-header">
      <h1 class="page-title">PDF 处理工具</h1>
      <p class="page-desc">PDF 转图片、图片转 PDF、合并拆分、信息查看——纯浏览器本地处理</p>
    </section>

    <!-- Tabs -->
    <section class="tabs-section">
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

      <!-- Tab 1: PDF → Image -->
      <div v-if="activeTab === 'pdf2img'" class="tab-panel" role="tabpanel">
        <div class="panel-card">
          <h3 class="panel-heading">PDF 转图片</h3>

          <!-- Upload -->
          <div v-if="!pdf2imgDoc" class="drop-zone" @dragover.prevent @drop.prevent="handlePdf2ImgDrop" @click="triggerPdf2ImgUpload">
            <input ref="pdf2imgInput" type="file" accept=".pdf,application/pdf" class="file-input-hidden" @change="handlePdf2ImgFile" />
            <div class="drop-icon">📄</div>
            <div class="drop-text">拖拽或点击上传 PDF 文件</div>
          </div>

          <template v-else>
            <div class="uploaded-bar">
              <span class="uploaded-name">{{ pdf2imgFileName }}</span>
              <span class="uploaded-detail">{{ pdf2imgPageCount }} 页</span>
              <button class="change-btn" @click="resetPdf2Img">换文件</button>
            </div>

            <!-- Controls -->
            <div class="field">
              <label class="field-label" for="pdf2img-format">输出格式</label>
              <select id="pdf2img-format" v-model="pdf2imgFormat">
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
              </select>
            </div>

            <div class="field">
              <label class="field-label" for="pdf2img-maxsize">每张图片最大大小</label>
              <select id="pdf2img-maxsize" v-model="pdf2imgMaxSize">
                <option value="unlimited">无限制</option>
                <option value="512">500 KB</option>
                <option value="1024">1 MB</option>
                <option value="2048">2 MB</option>
                <option value="5120">5 MB</option>
              </select>
            </div>

            <button v-if="pdf2imgSettingsChanged" class="action-btn" @click="renderAllPages" :disabled="pdf2imgLoading">
              {{ pdf2imgLoading ? '渲染中...' : '重新渲染' }}
            </button>

            <!-- Page thumbnails -->
            <div class="field">
              <div class="thumb-actions">
                <button class="preset-btn" @click="downloadAllPages">下载全部 {{ pdf2imgPageCount }} 页</button>
              </div>
            </div>

            <div v-if="pdf2imgLoading" class="loading-text">正在渲染页面...</div>

            <div class="page-grid">
              <div v-for="(page, i) in pdf2imgPages" :key="i" class="page-item">
                <div class="page-number">第 {{ i + 1 }} 页 <span v-if="page.blobSize" class="page-size">({{ formatFileSize(page.blobSize) }})</span></div>
                <div class="page-thumb" v-if="page.dataUrl" @click="openPreview(i)">
                  <img :src="page.dataUrl" :alt="'第' + (i + 1) + '页'" />
                </div>
                <div v-else class="page-thumb page-thumb-loading">渲染中...</div>
                <button class="preset-btn page-dl-btn" @click="downloadPage(i)" :disabled="!page.dataUrl">
                  下载
                </button>
              </div>
            </div>

            <!-- Preview modal -->
            <Teleport to="body">
              <div v-if="previewPageIndex !== null" class="preview-overlay" @click.self="closePreview">
                <div class="preview-modal">
                  <div class="preview-header">
                    <span>第 {{ previewPageIndex + 1 }} 页 / 共 {{ pdf2imgPageCount }} 页</span>
                    <button class="preview-close" @click="closePreview">✕</button>
                  </div>
                  <div class="preview-nav">
                    <button class="preview-arrow" :disabled="previewPageIndex === 0" @click.stop="openPreview(previewPageIndex - 1)">‹</button>
                    <img :src="pdf2imgPages[previewPageIndex]?.dataUrl" class="preview-img" :alt="'第' + (previewPageIndex + 1) + '页'" />
                    <button class="preview-arrow" :disabled="previewPageIndex >= pdf2imgPageCount - 1" @click.stop="openPreview(previewPageIndex + 1)">›</button>
                  </div>
                  <button class="action-btn" @click="downloadPage(previewPageIndex)">下载此页</button>
                </div>
              </div>
            </Teleport>
          </template>
        </div>
      </div>

      <!-- Tab 2: Images → PDF -->
      <div v-if="activeTab === 'img2pdf'" class="tab-panel" role="tabpanel">
        <div class="panel-card">
          <h3 class="panel-heading">图片转 PDF</h3>

          <!-- Upload -->
          <div
            class="drop-zone"
            :class="{ dragging: img2pdfDragging }"
            @dragover.prevent="img2pdfDragging = true"
            @dragleave.prevent="img2pdfDragging = false"
            @drop.prevent="handleImg2PdfDrop"
            @click="triggerImg2PdfUpload"
          >
            <input ref="img2pdfInput" type="file" accept="image/*" multiple class="file-input-hidden" @change="handleImg2PdfFiles" />
            <div class="drop-icon">🖼️</div>
            <div class="drop-text">拖拽或点击上传图片（可多选）</div>
          </div>

          <template v-if="img2pdfImages.length > 0">
            <!-- Image list -->
            <div class="field">
              <label class="field-label">图片列表（拖拽排序）</label>
              <div class="img-list">
                <div
                  v-for="(item, i) in img2pdfImages"
                  :key="i"
                  class="img-list-item"
                  draggable="true"
                  @dragstart="onImgDragStart(i)"
                  @dragover.prevent
                  @drop="onImgDrop(i)"
                >
                  <span class="img-list-num">{{ i + 1 }}</span>
                  <img :src="item.dataUrl" class="img-list-thumb" :alt="item.file.name" />
                  <span class="img-list-name">{{ item.file.name }}</span>
                  <button class="img-list-del" @click="removeImage(i)">✕</button>
                </div>
              </div>
            </div>

            <!-- Page settings -->
            <div class="field-row">
              <div class="field">
                <label class="field-label" for="img2pdf-size">页面尺寸</label>
                <select id="img2pdf-size" v-model="img2pdfPageSize">
                  <option value="original">原图尺寸</option>
                  <option value="a4">A4 (210×297mm)</option>
                  <option value="letter">Letter (216×279mm)</option>
                  <option value="a3">A3 (297×420mm)</option>
                </select>
              </div>
              <div class="field">
                <label class="field-label" for="img2pdf-orient">方向</label>
                <select id="img2pdf-orient" v-model="img2pdfOrientation">
                  <option value="portrait">纵向</option>
                  <option value="landscape">横向</option>
                </select>
              </div>
            </div>

            <button class="action-btn" @click="generateImg2Pdf" :disabled="img2pdfGenerating">
              {{ img2pdfGenerating ? '生成中...' : `生成并下载 PDF（${img2pdfImages.length} 页）` }}
            </button>
          </template>
        </div>
      </div>

      <!-- Tab 3: Merge & Split -->
      <div v-if="activeTab === 'merge'" class="tab-panel" role="tabpanel">
        <div class="panel-card">
          <h3 class="panel-heading">PDF 合并拆分</h3>

          <!-- Mode selector -->
          <div class="field">
            <div class="preset-row">
              <button class="preset-btn" :class="{ active: mergeMode === 'merge' }" @click="mergeMode = 'merge'">
                合并 PDF
              </button>
              <button class="preset-btn" :class="{ active: mergeMode === 'split' }" @click="mergeMode = 'split'">
                拆分 PDF
              </button>
            </div>
          </div>

          <!-- Merge mode -->
          <template v-if="mergeMode === 'merge'">
            <div
              class="drop-zone"
              :class="{ dragging: mergeDragging }"
              @dragover.prevent="mergeDragging = true"
              @dragleave.prevent="mergeDragging = false"
              @drop.prevent="handleMergeDrop"
              @click="triggerMergeUpload"
            >
              <input ref="mergeInput" type="file" accept=".pdf,application/pdf" multiple class="file-input-hidden" @change="handleMergeFiles" />
              <div class="drop-icon">📄📄</div>
              <div class="drop-text">拖拽或点击上传 PDF 文件（可多选）</div>
            </div>

            <div v-if="mergeFiles.length > 0" class="field">
              <label class="field-label">文件列表（拖拽调整合并顺序）</label>
              <div class="img-list">
                <div
                  v-for="(item, i) in mergeFiles"
                  :key="i"
                  class="img-list-item"
                  draggable="true"
                  @dragstart="onMergeDragStart(i)"
                  @dragover.prevent
                  @drop="onMergeDrop(i)"
                >
                  <span class="img-list-num">{{ i + 1 }}</span>
                  <span class="img-list-name">{{ item.file.name }}</span>
                  <span class="img-list-detail">{{ item.pageCount }} 页</span>
                  <button class="img-list-del" @click="removeMergeFile(i)">✕</button>
                </div>
              </div>
              <div class="merge-summary">共 {{ totalMergePages }} 页，合并后将生成 1 个 PDF</div>
              <button class="action-btn" @click="doMerge" :disabled="mergeWorking">
                {{ mergeWorking ? '处理中...' : '合并并下载' }}
              </button>
            </div>
          </template>

          <!-- Split mode -->
          <template v-if="mergeMode === 'split'">
            <div v-if="!splitDoc" class="drop-zone" @dragover.prevent @drop.prevent="handleSplitDrop" @click="triggerSplitUpload">
              <input ref="splitInput" type="file" accept=".pdf,application/pdf" class="file-input-hidden" @change="handleSplitFile" />
              <div class="drop-icon">📄✂️</div>
              <div class="drop-text">拖拽或点击上传 PDF 文件</div>
            </div>

            <template v-else>
              <div class="uploaded-bar">
                <span class="uploaded-name">{{ splitFileName }}</span>
                <span class="uploaded-detail">{{ splitPageCount }} 页</span>
                <button class="change-btn" @click="resetSplit">换文件</button>
              </div>

              <div class="field">
                <label class="field-label" for="split-ranges">页码范围</label>
                <input
                  id="split-ranges"
                  v-model="splitRanges"
                  type="text"
                  placeholder="例如：1-3,5,7-9"
                  @input="previewSplit"
                />
                <div class="field-hint">用逗号分隔不同段，用减号表示连续范围。例如 "1-3,5,7-9" 将生成 3 个文件。</div>
              </div>

              <div v-if="splitPreview.length > 0" class="field">
                <div class="result-box">
                  <span class="result-text">将拆分为 {{ splitPreview.length }} 个文件</span>
                </div>
              </div>

              <button class="action-btn" @click="doSplit" :disabled="splitPreview.length === 0 || mergeWorking">
                {{ mergeWorking ? '处理中...' : '拆分并下载' }}
              </button>
            </template>
          </template>
        </div>
      </div>

      <!-- Tab 4: PDF Info -->
      <div v-if="activeTab === 'info'" class="tab-panel" role="tabpanel">
        <div class="panel-card">
          <h3 class="panel-heading">PDF 信息</h3>

          <div v-if="!infoDoc" class="drop-zone" @dragover.prevent @drop.prevent="handleInfoDrop" @click="triggerInfoUpload">
            <input ref="infoInput" type="file" accept=".pdf,application/pdf" class="file-input-hidden" @change="handleInfoFile" />
            <div class="drop-icon">ℹ️</div>
            <div class="drop-text">拖拽或点击上传 PDF 文件</div>
          </div>

          <template v-else>
            <div class="uploaded-bar">
              <span class="uploaded-name">{{ infoFileName }}</span>
              <button class="change-btn" @click="resetInfo">换文件</button>
            </div>

            <div class="info-section">
              <h4 class="info-subheading">基本信息</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">文件名</span>
                  <span class="info-value">{{ infoFileName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">文件大小</span>
                  <span class="info-value">{{ infoFileSize }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">页数</span>
                  <span class="info-value">{{ infoPageCount }} 页</span>
                </div>
                <div class="info-item">
                  <span class="info-label">PDF 版本</span>
                  <span class="info-value">{{ infoVersion }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">是否加密</span>
                  <span class="info-value">{{ infoEncrypted ? '是' : '否' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">首页尺寸</span>
                  <span class="info-value">{{ infoPageSize }}</span>
                </div>
              </div>
            </div>

            <div v-if="infoMeta.length > 0" class="info-section">
              <h4 class="info-subheading">元数据</h4>
              <div class="info-grid">
                <div v-for="item in infoMeta" :key="item.label" class="info-item">
                  <span class="info-label">{{ item.label }}</span>
                  <span class="info-value">{{ item.value || '—' }}</span>
                </div>
              </div>
            </div>

            <div v-else class="info-section">
              <p class="no-exif">该 PDF 不含元数据</p>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, nextTick } from 'vue'
import { PDFDocument } from 'pdf-lib'

// SEO
useHead({
  title: 'PDF 处理工具 - 青萍之末',
  meta: [
    { name: 'description', content: '在线 PDF 处理工具——PDF 转图片、图片转 PDF、PDF 合并拆分、PDF 信息查看。纯浏览器本地处理，文件不上传。' },
    { property: 'og:title', content: 'PDF 处理工具 - 青萍之末' },
    { property: 'og:description', content: '在线 PDF 处理工具——PDF 转图片、图片转 PDF、PDF 合并拆分、PDF 信息查看。' },
    { property: 'og:url', content: 'https://tools.qingpingmo.com/tools/pdf' },
  ],
  link: [
    { rel: 'canonical', href: 'https://tools.qingpingmo.com/tools/pdf' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'PDF 处理工具',
          url: 'https://tools.qingpingmo.com/tools/pdf',
          description: 'PDF 转图片、图片转 PDF、PDF 合并拆分、PDF 信息查看。纯浏览器本地处理。',
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'All',
          offers: { '@type': 'Offer', price: '0' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首页', item: 'https://tools.qingpingmo.com' },
            { '@type': 'ListItem', position: 2, name: 'PDF 处理', item: 'https://tools.qingpingmo.com/tools/pdf' },
          ],
        },
      ]),
    },
  ],
})

// ===== Shared utilities =====
let pdfjsLib: any = null

async function getPdfJs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs')
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs'
  }
  return pdfjsLib
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
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

// ===== Tabs =====
const tabs = [
  { id: 'pdf2img' as const, label: 'PDF 转图片' },
  { id: 'img2pdf' as const, label: '图片转 PDF' },
  { id: 'merge' as const, label: '合并拆分' },
  { id: 'info' as const, label: 'PDF 信息' },
]
const activeTab = ref<typeof tabs[number]['id']>('pdf2img')

// ===== Tab 1: PDF → Image =====
const pdf2imgInput = ref<HTMLInputElement>()
const pdf2imgDoc = shallowRef<any>(null)
const pdf2imgFileName = ref('')
const pdf2imgPageCount = ref(0)
const pdf2imgFormat = ref('png')
const pdf2imgMaxSize = ref('unlimited')
const pdf2imgPages = ref<{ dataUrl: string; blobSize: number }[]>([])
const pdf2imgLoading = ref(false)
const previewPageIndex = ref<number | null>(null)
const pdf2imgRenderedFormat = ref('')
const pdf2imgRenderedMaxSize = ref('')

const pdf2imgSettingsChanged = computed(() => {
  if (!pdf2imgDoc.value) return false
  return pdf2imgFormat.value !== pdf2imgRenderedFormat.value
    || pdf2imgMaxSize.value !== pdf2imgRenderedMaxSize.value
})

function triggerPdf2ImgUpload() { pdf2imgInput.value?.click() }
function openPreview(i: number) { previewPageIndex.value = i }
function closePreview() { previewPageIndex.value = null }

async function handlePdf2ImgFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) await loadPdf2Img(file)
}

async function handlePdf2ImgDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file?.type === 'application/pdf') await loadPdf2Img(file)
}

async function loadPdf2Img(file: File) {
  pdf2imgFileName.value = file.name
  const buf = await file.arrayBuffer()
  const pdfjs = await getPdfJs()
  const doc = await pdfjs.getDocument({ data: buf }).promise
  pdf2imgDoc.value = doc
  pdf2imgPageCount.value = doc.numPages
  pdf2imgPages.value = Array.from({ length: doc.numPages }, () => ({ dataUrl: '', blobSize: 0 }))
  await nextTick()
  await renderAllPages()
}

async function renderAllPages() {
  if (!pdf2imgDoc.value) return
  pdf2imgLoading.value = true
  // 立即将所有页面重置为待渲染状态
  const doc = pdf2imgDoc.value
  pdf2imgPages.value = Array.from({ length: doc.numPages }, () => ({ dataUrl: '', blobSize: 0 }))
  for (let i = 0; i < doc.numPages; i++) {
    await renderSinglePage(i + 1, i)
  }
  pdf2imgRenderedFormat.value = pdf2imgFormat.value
  pdf2imgRenderedMaxSize.value = pdf2imgMaxSize.value
  pdf2imgLoading.value = false
}

function getMime(): string {
  return pdf2imgFormat.value === 'jpeg' ? 'image/jpeg' : pdf2imgFormat.value === 'webp' ? 'image/webp' : 'image/png'
}

function getMaxBytes(): number {
  if (pdf2imgMaxSize.value === 'unlimited') return 0
  return Number(pdf2imgMaxSize.value) * 1024
}

async function renderToCanvas(pdfPage: any, baseViewport: any, scale: number, mime: string, quality: number): Promise<string> {
  const viewport = pdfPage.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = baseViewport.width * scale
  canvas.height = baseViewport.height * scale
  const ctx = canvas.getContext('2d')!
  await pdfPage.render({ canvasContext: ctx, viewport }).promise
  return canvas.toDataURL(mime, quality)
}

function getDataUrlSize(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1]
  if (!base64) return 0
  const padding = (base64.match(/=+$/) || [''])[0].length
  return Math.floor(base64.length * 3 / 4) - padding
}

async function renderSinglePage(pageNum: number, idx: number) {
  const doc = pdf2imgDoc.value
  const page = await doc.getPage(pageNum)
  const baseViewport = page.getViewport({ scale: 1 })
  const mime = getMime()
  const maxBytes = getMaxBytes()

  let scale = 1
  let quality = 0.92
  let dataUrl = await renderToCanvas(page, baseViewport, scale, mime, quality)
  let size = getDataUrlSize(dataUrl)

  if (maxBytes > 0 && size > maxBytes) {
    if (mime !== 'image/png') {
      const qualities = [0.8, 0.7, 0.6, 0.5, 0.4, 0.3]
      for (const q of qualities) {
        quality = q
        dataUrl = await renderToCanvas(page, baseViewport, scale, mime, quality)
        size = getDataUrlSize(dataUrl)
        if (size <= maxBytes) break
      }
    }
    if (size > maxBytes) {
      const scales = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]
      for (const s of scales) {
        scale = s
        dataUrl = await renderToCanvas(page, baseViewport, scale, mime, quality)
        size = getDataUrlSize(dataUrl)
        if (size <= maxBytes) break
      }
    }
  }

  pdf2imgPages.value[idx].dataUrl = dataUrl
  pdf2imgPages.value[idx].blobSize = size
}

function downloadPage(idx: number) {
  const page = pdf2imgPages.value[idx]
  if (!page.dataUrl) return
  const ext = pdf2imgFormat.value === 'jpeg' ? 'jpg' : pdf2imgFormat.value
  const name = pdf2imgFileName.value.replace(/\.pdf$/i, '')
  // Convert dataUrl to blob for download
  const parts = page.dataUrl.split(',')
  const mime = parts[0].match(/:(.*?);/)?.[1] ?? 'image/png'
  const bstr = atob(parts[1])
  const arr = new Uint8Array(bstr.length)
  for (let i = 0; i < bstr.length; i++) arr[i] = bstr.charCodeAt(i)
  triggerDownload(new Blob([arr], { type: mime }), `${name}_第${idx + 1}页.${ext}`)
}

function downloadAllPages() {
  pdf2imgPages.value.forEach((_, i) => {
    setTimeout(() => downloadPage(i), i * 300)
  })
}

function resetPdf2Img() {
  pdf2imgDoc.value = null
  pdf2imgFileName.value = ''
  pdf2imgPageCount.value = 0
  pdf2imgPages.value = []
}

// ===== Tab 2: Images → PDF =====
const img2pdfInput = ref<HTMLInputElement>()
const img2pdfImages = ref<{ file: File; dataUrl: string }[]>([])
const img2pdfDragging = ref(false)
const img2pdfPageSize = ref('original')
const img2pdfOrientation = ref('portrait')
const img2pdfGenerating = ref(false)
let img2pdfDragIdx = -1

function triggerImg2PdfUpload() { img2pdfInput.value?.click() }

async function handleImg2PdfFiles(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  await addImg2PdfFiles(Array.from(files))
}

async function handleImg2PdfDrop(e: DragEvent) {
  img2pdfDragging.value = false
  const files = e.dataTransfer?.files
  if (!files) return
  const imgs = Array.from(files).filter(f => f.type.startsWith('image/'))
  await addImg2PdfFiles(imgs)
}

async function addImg2PdfFiles(files: File[]) {
  for (const file of files) {
    const dataUrl = await readFileAsDataUrl(file)
    img2pdfImages.value.push({ file, dataUrl })
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

function removeImage(i: number) { img2pdfImages.value.splice(i, 1) }

function onImgDragStart(i: number) { img2pdfDragIdx = i }
function onImgDrop(i: number) {
  if (img2pdfDragIdx < 0 || img2pdfDragIdx === i) return
  const item = img2pdfImages.value.splice(img2pdfDragIdx, 1)[0]
  img2pdfImages.value.splice(i, 0, item)
  img2pdfDragIdx = -1
}

async function generateImg2Pdf() {
  if (img2pdfImages.value.length === 0) return
  img2pdfGenerating.value = true

  const pdfDoc = await PDFDocument.create()
  const pageSizes: Record<string, [number, number]> = {
    a4: [595, 842],
    letter: [612, 792],
    a3: [842, 1191],
  }

  for (const item of img2pdfImages.value) {
    const imgBytes = await fetch(item.dataUrl).then(r => r.arrayBuffer())
    const ext = item.file.type.split('/')[1] ?? 'png'
    let image
    if (ext === 'jpeg' || ext === 'jpg') {
      image = await pdfDoc.embedJpg(imgBytes)
    } else {
      image = await pdfDoc.embedPng(imgBytes)
    }

    let pageW: number, pageH: number
    if (img2pdfPageSize.value === 'original') {
      pageW = image.width
      pageH = image.height
      if (img2pdfOrientation.value === 'landscape' && pageW < pageH) {
        ;[pageW, pageH] = [pageH, pageW]
      }
    } else {
      ;[pageW, pageH] = pageSizes[img2pdfPageSize.value]
      if (img2pdfOrientation.value === 'landscape') {
        ;[pageW, pageH] = [pageH, pageW]
      }
    }

    const page = pdfDoc.addPage([pageW, pageH])
    // Fit image to page while maintaining aspect ratio
    const imgRatio = image.width / image.height
    const pageRatio = pageW / pageH
    let drawW: number, drawH: number
    if (imgRatio > pageRatio) {
      drawW = pageW - 40
      drawH = drawW / imgRatio
    } else {
      drawH = pageH - 40
      drawW = drawH * imgRatio
    }
    const x = (pageW - drawW) / 2
    const y = (pageH - drawH) / 2
    page.drawImage(image, { x, y, width: drawW, height: drawH })
  }

  const pdfBytes = await pdfDoc.save()
  triggerDownload(new Blob([pdfBytes], { type: 'application/pdf' }), 'images_to_pdf.pdf')
  img2pdfGenerating.value = false
}

// ===== Tab 3: Merge & Split =====
const mergeMode = ref<'merge' | 'split'>('merge')
const mergeInput = ref<HTMLInputElement>()
const splitInput = ref<HTMLInputElement>()

// Merge state
const mergeFiles = ref<{ file: File; pageCount: number }[]>([])
const mergeDragging = ref(false)
const mergeWorking = ref(false)
let mergeDragIdx = -1

// Split state
const splitDoc = shallowRef<PDFDocument | null>(null)
const splitFileName = ref('')
const splitPageCount = ref(0)
const splitRanges = ref('')
const splitPreview = ref<number[][]>([])
let splitFileBytes: ArrayBuffer | null = null

const totalMergePages = computed(() =>
  mergeFiles.value.reduce((sum, f) => sum + f.pageCount, 0),
)

function triggerMergeUpload() { mergeInput.value?.click() }
function triggerSplitUpload() { splitInput.value?.click() }

async function handleMergeFiles(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  await addMergeFiles(Array.from(files))
}

async function handleMergeDrop(e: DragEvent) {
  mergeDragging.value = false
  const files = e.dataTransfer?.files
  if (!files) return
  await addMergeFiles(Array.from(files))
}

async function addMergeFiles(files: File[]) {
  for (const file of files) {
    if (file.type !== 'application/pdf') continue
    const buf = await file.arrayBuffer()
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true })
    mergeFiles.value.push({ file, pageCount: doc.getPageCount() })
  }
}

function removeMergeFile(i: number) { mergeFiles.value.splice(i, 1) }
function onMergeDragStart(i: number) { mergeDragIdx = i }
function onMergeDrop(i: number) {
  if (mergeDragIdx < 0 || mergeDragIdx === i) return
  const item = mergeFiles.value.splice(mergeDragIdx, 1)[0]
  mergeFiles.value.splice(i, 0, item)
  mergeDragIdx = -1
}

async function doMerge() {
  if (mergeFiles.value.length < 2) return
  mergeWorking.value = true
  const merged = await PDFDocument.create()

  for (const item of mergeFiles.value) {
    const buf = await item.file.arrayBuffer()
    const src = await PDFDocument.load(buf, { ignoreEncryption: true })
    const pages = await merged.copyPages(src, src.getPageIndices())
    for (const page of pages) merged.addPage(page)
  }

  const pdfBytes = await merged.save()
  triggerDownload(new Blob([pdfBytes], { type: 'application/pdf' }), 'merged.pdf')
  mergeWorking.value = false
}

async function handleSplitFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) await loadSplitFile(file)
}

async function handleSplitDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file?.type === 'application/pdf') await loadSplitFile(file)
}

async function loadSplitFile(file: File) {
  splitFileName.value = file.name
  splitFileBytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(splitFileBytes, { ignoreEncryption: true })
  splitDoc.value = doc
  splitPageCount.value = doc.getPageCount()
  splitRanges.value = ''
  splitPreview.value = []
}

function parseRanges(input: string, maxPage: number): number[][] {
  const ranges: number[][] = []
  const parts = input.split(',').map(s => s.trim()).filter(Boolean)
  for (const part of parts) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number)
      if (isNaN(a) || isNaN(b) || a < 1 || b > maxPage || a > b) continue
      ranges.push(Array.from({ length: b - a + 1 }, (_, i) => a + i))
    } else {
      const n = Number(part)
      if (isNaN(n) || n < 1 || n > maxPage) continue
      ranges.push([n])
    }
  }
  return ranges
}

function previewSplit() {
  if (!splitDoc.value) return
  splitPreview.value = parseRanges(splitRanges.value, splitPageCount.value)
}

async function doSplit() {
  if (splitPreview.value.length === 0 || !splitFileBytes) return
  mergeWorking.value = true
  const baseName = splitFileName.value.replace(/\.pdf$/i, '')

  for (let i = 0; i < splitPreview.value.length; i++) {
    const pages = splitPreview.value[i]
    const src = await PDFDocument.load(splitFileBytes, { ignoreEncryption: true })
    const out = await PDFDocument.create()
    const pageIndices = pages.map(p => p - 1)
    const copied = await out.copyPages(src, pageIndices)
    for (const page of copied) out.addPage(page)

    const pdfBytes = await out.save()
    const label = pages.length === 1 ? `第${pages[0]}页` : `第${pages[0]}-${pages[pages.length - 1]}页`
    setTimeout(() => {
      triggerDownload(new Blob([pdfBytes], { type: 'application/pdf' }), `${baseName}_${label}.pdf`)
    }, i * 200)
  }
  mergeWorking.value = false
}

function resetSplit() {
  splitDoc.value = null
  splitFileName.value = ''
  splitPageCount.value = 0
  splitRanges.value = ''
  splitPreview.value = []
  splitFileBytes = null
}

// ===== Tab 4: PDF Info =====
const infoInput = ref<HTMLInputElement>()
const infoDoc = shallowRef<PDFDocument | null>(null)
const infoFileName = ref('')
const infoFileSize = ref('')
const infoPageCount = ref(0)
const infoVersion = ref('')
const infoEncrypted = ref(false)
const infoPageSize = ref('')
const infoMeta = ref<{ label: string; value: string }[]>([])

function triggerInfoUpload() { infoInput.value?.click() }

async function handleInfoFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) await loadInfoFile(file)
}

async function handleInfoDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file?.type === 'application/pdf') await loadInfoFile(file)
}

async function loadInfoFile(file: File) {
  infoFileName.value = file.name
  infoFileSize.value = formatFileSize(file.size)
  const buf = await file.arrayBuffer()
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true })
  infoDoc.value = doc
  infoPageCount.value = doc.getPageCount()

  // PDF version
  const v = doc.getPDFVersion?.() ?? '1.4'
  infoVersion.value = typeof v === 'string' ? v : `PDF ${v}`

  // Encrypted
  infoEncrypted.value = doc.isEncrypted

  // Page size (first page)
  try {
    const page = doc.getPage(0)
    const size = page.getSize()
    infoPageSize.value = `${Math.round(size.width)} × ${Math.round(size.height)} pt`
  } catch {
    infoPageSize.value = '—'
  }

  // Metadata
  const metaItems: { label: string; value: string }[] = []
  const title = doc.getTitle()
  if (title) metaItems.push({ label: '标题', value: title })
  const author = doc.getAuthor()
  if (author) metaItems.push({ label: '作者', value: author })
  const subject = doc.getSubject()
  if (subject) metaItems.push({ label: '主题', value: subject })
  const keywords = doc.getKeywords()
  if (keywords) metaItems.push({ label: '关键词', value: keywords })
  const creator = doc.getCreator()
  if (creator) metaItems.push({ label: '创建程序', value: creator })
  const producer = doc.getProducer()
  if (producer) metaItems.push({ label: '生成程序', value: producer })

  // Dates
  const creationDate = doc.getCreationDate()
  if (creationDate) metaItems.push({ label: '创建时间', value: creationDate.toLocaleString('zh-CN') })
  const modDate = doc.getModificationDate()
  if (modDate) metaItems.push({ label: '修改时间', value: modDate.toLocaleString('zh-CN') })

  infoMeta.value = metaItems
}

function resetInfo() {
  infoDoc.value = null
  infoFileName.value = ''
  infoFileSize.value = ''
  infoPageCount.value = 0
  infoVersion.value = ''
  infoEncrypted.value = false
  infoPageSize.value = ''
  infoMeta.value = []
}
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
.breadcrumb-link { color: var(--color-light-ink); text-decoration: none; }
.breadcrumb-link:hover { color: var(--color-duckweed); }
.breadcrumb-sep { color: var(--color-rain); }
.breadcrumb-current { color: var(--color-ink); }

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

/* ===== Upload ===== */
.drop-zone {
  border: 2px dashed var(--color-rain);
  border-radius: var(--radius-lg);
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.25s, background-color 0.25s;
  background: var(--color-white);
  margin-bottom: 1.25rem;
}
.drop-zone:hover,
.drop-zone.dragging {
  border-color: var(--color-duckweed);
  background: var(--color-surface);
}
.drop-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
.drop-text { font-size: 1rem; color: var(--color-ink); }
.file-input-hidden { display: none; }

/* Uploaded bar */
.uploaded-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.125rem;
  background: var(--color-surface);
  border: 1px solid var(--color-rain);
  border-radius: var(--radius);
  margin-bottom: 1.25rem;
}
.uploaded-name {
  flex: 1;
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
  flex-shrink: 0;
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
.change-btn:hover { border-color: var(--color-duckweed); }

/* ===== Tabs ===== */
.tabs-section { margin-bottom: var(--section-gap); }
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
.tab:hover { color: var(--color-ink); }
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

/* ===== Form ===== */
.field { margin-bottom: 1rem; }
.field:last-child { margin-bottom: 0; }
.field-label {
  display: block;
  font-size: 0.8125rem;
  color: var(--color-light-ink);
  margin-bottom: 0.375rem;
  letter-spacing: 0.03em;
}
.field-hint {
  font-size: 0.75rem;
  color: var(--color-rain);
  margin-top: 0.375rem;
}
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}
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
.preset-btn:hover { border-color: var(--color-duckweed); color: var(--color-duckweed); }
.preset-btn.active {
  background: var(--color-duckweed);
  color: var(--color-white);
  border-color: var(--color-duckweed);
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
.action-btn:hover { opacity: 0.85; }
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ===== Page grid (PDF→Image) ===== */
.page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.page-item {
  background: var(--color-surface);
  border: 1px solid var(--color-rain);
  border-radius: var(--radius);
  padding: 0.625rem;
  text-align: center;
}
.page-number {
  font-size: 0.75rem;
  color: var(--color-light-ink);
  margin-bottom: 0.375rem;
}
.page-thumb {
  aspect-ratio: 3 / 4;
  background: var(--color-white);
  border: 1px solid var(--color-rain);
  border-radius: 3px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}
.page-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.page-thumb-loading {
  font-size: 0.75rem;
  color: var(--color-rain);
}
.page-dl-btn {
  width: 100%;
}

/* ===== Preview modal ===== */
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.preview-modal {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--color-rain);
  font-size: 0.875rem;
  color: var(--color-ink);
  flex-shrink: 0;
}
.preview-close {
  font-size: 1.25rem;
  color: var(--color-light-ink);
  background: none;
  border: none;
  cursor: pointer;
  line-height: 1;
  padding: 0.25rem;
}
.preview-close:hover { color: var(--color-ink); }
.preview-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  flex: 1;
  min-height: 0;
}
.preview-img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: var(--radius);
}
.preview-arrow {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  font-size: 1.5rem;
  color: var(--color-ink);
  background: var(--color-surface);
  border: 1px solid var(--color-rain);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.preview-arrow:hover:not(:disabled) {
  background: var(--color-duckweed);
  color: var(--color-white);
  border-color: var(--color-duckweed);
}
.preview-arrow:disabled {
  opacity: 0.3;
  cursor: default;
}
.preview-overlay .action-btn {
  margin: 0 1rem 1rem;
  width: auto;
}

.thumb-actions {
  display: flex;
  gap: 0.5rem;
}
.loading-text {
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-light-ink);
  padding: 1rem;
}
.page-size {
  font-size: 0.6875rem;
  color: var(--color-rain);
  margin-left: 0.25rem;
}

/* ===== Image list (Img→PDF, Merge) ===== */
.img-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.img-list-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-rain);
  border-radius: var(--radius);
  cursor: grab;
  transition: border-color 0.2s;
}
.img-list-item:hover { border-color: var(--color-duckweed); }
.img-list-num {
  font-size: 0.75rem;
  color: var(--color-light-ink);
  width: 1.25rem;
  text-align: center;
  flex-shrink: 0;
}
.img-list-thumb {
  width: 2.5rem;
  height: 2.5rem;
  object-fit: cover;
  border-radius: 3px;
  border: 1px solid var(--color-rain);
  flex-shrink: 0;
}
.img-list-name {
  flex: 1;
  font-size: 0.8125rem;
  color: var(--color-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.img-list-detail {
  font-size: 0.75rem;
  color: var(--color-light-ink);
  flex-shrink: 0;
}
.img-list-del {
  flex-shrink: 0;
  font-size: 0.875rem;
  color: var(--color-light-ink);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}
.img-list-del:hover { color: #c44; }

.merge-summary {
  font-size: 0.875rem;
  color: var(--color-ink);
  text-align: center;
  padding: 0.75rem;
  margin-top: 0.75rem;
  background: var(--color-surface);
  border-radius: var(--radius);
}

/* ===== Result box ===== */
.result-box {
  display: flex;
  align-items: center;
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

/* ===== Info ===== */
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
  .tool-page { padding: 0 1.25rem; }
  .breadcrumb { padding-top: 1rem; }
  .page-header { padding: 1.25rem 0 1rem; }
  .drop-zone { padding: 2rem 1.25rem; }
  .tabs { gap: 0; }
  .tab { padding: 0.625rem 0.875rem; font-size: 0.8125rem; }
  .panel-card { padding: 1.125rem; }
  .field-row { grid-template-columns: 1fr; }
  .page-grid { grid-template-columns: repeat(2, 1fr); }
  .info-grid { grid-template-columns: 1fr; }
}
</style>
