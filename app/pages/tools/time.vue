<template>
  <div class="tool-page">
    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="面包屑导航">
      <NuxtLink to="/" class="breadcrumb-link">首页</NuxtLink>
      <span class="breadcrumb-sep" aria-hidden="true">/</span>
      <span class="breadcrumb-current">时间转换</span>
    </nav>

    <!-- Page header -->
    <section class="page-header">
      <h1 class="page-title">时间转换工具</h1>
      <p class="page-desc">Unix 时间戳转换、时区转换、时间差计算、日期格式化</p>
    </section>

    <!-- Current timestamp -->
    <section class="now-section">
      <div class="now-label">当前时间（上海时区）</div>
      <div class="now-time">{{ nowFormatted }}</div>
      <div class="now-stamp">
        <span>Unix 时间戳（秒）：</span>
        <code class="stamp-value">{{ nowSeconds }}</code>
        <button class="copy-btn" @click="copyText(String(nowSeconds))" :aria-label="'复制时间戳 ' + nowSeconds">
          {{ copyStampLabel }}
        </button>
      </div>
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

      <!-- Tab: Timestamp Conversion -->
      <div v-if="activeTab === 'timestamp'" class="tab-panel" role="tabpanel">
        <div class="panel-grid">
          <!-- Timestamp → Datetime -->
          <div class="panel-card">
            <h3 class="panel-heading">时间戳 → 日期时间</h3>
            <div class="field">
              <label class="field-label" for="ts-input">Unix 时间戳</label>
              <div class="input-row">
                <input
                  id="ts-input"
                  v-model="tsInput"
                  type="text"
                  placeholder="例如：1719993600"
                  @input="convertTimestamp"
                />
                <select v-model="tsUnit" @change="convertTimestamp" class="unit-select">
                  <option value="s">秒</option>
                  <option value="ms">毫秒</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label class="field-label">转换结果（上海时区）</label>
              <div class="result-box">
                <span v-if="tsResult" class="result-text">{{ tsResult }}</span>
                <span v-else class="result-placeholder">输入时间戳后自动转换</span>
                <button v-if="tsResult" class="copy-btn" @click="copyText(tsResult)" aria-label="复制结果">复制</button>
              </div>
            </div>
          </div>

          <!-- Datetime → Timestamp -->
          <div class="panel-card">
            <h3 class="panel-heading">日期时间 → 时间戳</h3>
            <div class="field">
              <label class="field-label" for="dt-input">日期时间</label>
              <input
                id="dt-input"
                v-model="dtInput"
                type="datetime-local"
                @change="convertDatetime"
              />
            </div>
            <div class="field">
              <label class="field-label">Unix 时间戳（秒）</label>
              <div class="result-box">
                <span v-if="dtResultSec !== null" class="result-text">{{ dtResultSec }}</span>
                <span v-else class="result-placeholder">选择日期时间后自动转换</span>
                <button v-if="dtResultSec !== null" class="copy-btn" @click="copyText(String(dtResultSec))" aria-label="复制结果">复制</button>
              </div>
            </div>
            <div class="field">
              <label class="field-label">Unix 时间戳（毫秒）</label>
              <div class="result-box">
                <span v-if="dtResultMs !== null" class="result-text">{{ dtResultMs }}</span>
                <span v-else class="result-placeholder">选择日期时间后自动转换</span>
                <button v-if="dtResultMs !== null" class="copy-btn" @click="copyText(String(dtResultMs))" aria-label="复制结果">复制</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Timezone Conversion -->
      <div v-if="activeTab === 'timezone'" class="tab-panel" role="tabpanel">
        <div class="panel-card">
          <h3 class="panel-heading">时区转换</h3>
          <div class="field">
            <label class="field-label">源日期时间</label>
            <input
              v-model="tzInput"
              type="datetime-local"
              @change="convertTimezone"
            />
          </div>
          <div class="field-row">
            <div class="field">
              <label class="field-label" for="tz-from">源时区</label>
              <select id="tz-from" v-model="tzFrom" @change="convertTimezone">
                <option v-for="tz in commonTimezones" :key="tz.value" :value="tz.value">
                  {{ tz.label }}
                </option>
              </select>
            </div>
            <div class="field">
              <label class="field-label" for="tz-to">目标时区</label>
              <select id="tz-to" v-model="tzTo" @change="convertTimezone">
                <option v-for="tz in commonTimezones" :key="tz.value" :value="tz.value">
                  {{ tz.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="field">
            <label class="field-label">转换结果</label>
            <div class="result-box">
              <span v-if="tzResult" class="result-text">{{ tzResult }}</span>
              <span v-else class="result-placeholder">输入日期并选择时区后自动转换</span>
              <button v-if="tzResult" class="copy-btn" @click="copyText(tzResult)" aria-label="复制结果">复制</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Time Difference -->
      <div v-if="activeTab === 'diff'" class="tab-panel" role="tabpanel">
        <div class="panel-card">
          <h3 class="panel-heading">时间差计算</h3>
          <div class="field-row">
            <div class="field">
              <label class="field-label" for="diff-start">开始时间</label>
              <input
                id="diff-start"
                v-model="diffStart"
                type="datetime-local"
                @change="calcDiff"
              />
            </div>
            <div class="field">
              <label class="field-label" for="diff-end">结束时间</label>
              <input
                id="diff-end"
                v-model="diffEnd"
                type="datetime-local"
                @change="calcDiff"
              />
            </div>
          </div>
          <div class="field">
            <label class="field-label">相差时间</label>
            <div class="result-box diff-result">
              <template v-if="diffResult">
                <div class="diff-item" v-for="item in diffResult" :key="item.label">
                  <span class="diff-label">{{ item.label }}</span>
                  <span class="diff-value">{{ item.value }}</span>
                </div>
              </template>
              <span v-else class="result-placeholder">选择两个日期时间后自动计算</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Date Format -->
      <div v-if="activeTab === 'format'" class="tab-panel" role="tabpanel">
        <div class="panel-card">
          <h3 class="panel-heading">日期格式化</h3>
          <div class="field">
            <label class="field-label" for="fmt-input">日期时间</label>
            <input
              id="fmt-input"
              v-model="fmtInput"
              type="datetime-local"
              @change="formatDate"
            />
          </div>
          <div class="field">
            <label class="field-label" for="fmt-template">格式模板</label>
            <select id="fmt-template" v-model="fmtTemplate" @change="formatDate">
              <option v-for="f in formatTemplates" :key="f.value" :value="f.value">
                {{ f.label }}
              </option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">格式化结果</label>
            <div class="result-box">
              <span v-if="fmtResult" class="result-text">{{ fmtResult }}</span>
              <span v-else class="result-placeholder">选择日期和格式后自动输出</span>
              <button v-if="fmtResult" class="copy-btn" @click="copyText(fmtResult)" aria-label="复制结果">复制</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// SEO
useHead({
  title: '时间转换工具 - 青萍之末',
  meta: [
    { name: 'description', content: '在线时间转换工具——Unix 时间戳转换、时区转换、时间差计算、日期格式化。支持秒/毫秒时间戳互转，多时区转换。' },
    { property: 'og:title', content: '时间转换工具 - 青萍之末' },
    { property: 'og:description', content: '在线时间转换工具——Unix 时间戳转换、时区转换、时间差计算、日期格式化。' },
    { property: 'og:url', content: 'https://tools.qingpingmo.com/tools/time' },
  ],
  link: [
    { rel: 'canonical', href: 'https://tools.qingpingmo.com/tools/time' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: '时间转换工具',
          url: 'https://tools.qingpingmo.com/tools/time',
          description: 'Unix 时间戳转换、时区转换、时间差计算、日期格式化。',
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'All',
          offers: { '@type': 'Offer', price: '0' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首页', item: 'https://tools.qingpingmo.com' },
            { '@type': 'ListItem', position: 2, name: '时间转换', item: 'https://tools.qingpingmo.com/tools/time' },
          ],
        },
      ]),
    },
  ],
})

// ===== Tabs =====
const tabs = [
  { id: 'timestamp' as const, label: '时间戳转换' },
  { id: 'timezone' as const, label: '时区转换' },
  { id: 'diff' as const, label: '时间差计算' },
  { id: 'format' as const, label: '日期格式化' },
]
const activeTab = ref<typeof tabs[number]['id']>('timestamp')

// ===== Current timestamp =====
const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const nowFormatted = computed(() => {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now.value)
  } catch {
    return '—'
  }
})

const nowSeconds = computed(() => Math.floor(now.value.getTime() / 1000))

// ===== Copy =====
const copyStampLabel = ref('复制')

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    copyStampLabel.value = '已复制'
    setTimeout(() => {
      copyStampLabel.value = '复制'
    }, 1500)
  }).catch(() => {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  })
}

// ===== Tab 1: Timestamp Conversion =====
const tsInput = ref('')
const tsUnit = ref<'s' | 'ms'>('s')
const tsResult = ref('')

function convertTimestamp() {
  const raw = tsInput.value.trim()
  if (!raw || isNaN(Number(raw))) {
    tsResult.value = ''
    return
  }
  try {
    const num = Number(raw)
    const ms = tsUnit.value === 's' ? num * 1000 : num
    const d = new Date(ms)
    if (isNaN(d.getTime())) {
      tsResult.value = ''
      return
    }
    tsResult.value = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'shortOffset',
    }).format(d)
  } catch {
    tsResult.value = ''
  }
}

// ===== Tab 1: Datetime → Timestamp =====
const dtInput = ref('')
const dtResultSec = ref<number | null>(null)
const dtResultMs = ref<number | null>(null)

function convertDatetime() {
  if (!dtInput.value) {
    dtResultSec.value = null
    dtResultMs.value = null
    return
  }
  try {
    const d = new Date(dtInput.value)
    if (isNaN(d.getTime())) {
      dtResultSec.value = null
      dtResultMs.value = null
      return
    }
    dtResultMs.value = d.getTime()
    dtResultSec.value = Math.floor(d.getTime() / 1000)
  } catch {
    dtResultSec.value = null
    dtResultMs.value = null
  }
}

// ===== Tab 2: Timezone Conversion =====
const commonTimezones = [
  { value: 'Asia/Shanghai', label: '上海 UTC+8' },
  { value: 'Asia/Tokyo', label: '东京 UTC+9' },
  { value: 'Asia/Seoul', label: '首尔 UTC+9' },
  { value: 'Asia/Singapore', label: '新加坡 UTC+8' },
  { value: 'Asia/Kolkata', label: '印度 UTC+5:30' },
  { value: 'Asia/Dubai', label: '迪拜 UTC+4' },
  { value: 'Europe/London', label: '伦敦 UTC+0/+1' },
  { value: 'Europe/Paris', label: '巴黎 UTC+1/+2' },
  { value: 'Europe/Moscow', label: '莫斯科 UTC+3' },
  { value: 'America/New_York', label: '纽约 UTC-5/-4' },
  { value: 'America/Chicago', label: '芝加哥 UTC-6/-5' },
  { value: 'America/Los_Angeles', label: '洛杉矶 UTC-8/-7' },
  { value: 'America/Sao_Paulo', label: '圣保罗 UTC-3' },
  { value: 'Pacific/Auckland', label: '奥克兰 UTC+12/+13' },
  { value: 'UTC', label: 'UTC' },
]

const tzInput = ref('')
const tzFrom = ref('Asia/Shanghai')
const tzTo = ref('America/New_York')
const tzResult = ref('')

function convertTimezone() {
  if (!tzInput.value) {
    tzResult.value = ''
    return
  }
  try {
    const localDate = new Date(tzInput.value)
    if (isNaN(localDate.getTime())) {
      tzResult.value = ''
      return
    }
    const utcMs = localDate.getTime()
    const targetFormatter = new Intl.DateTimeFormat('zh-CN', {
      timeZone: tzTo.value,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'shortOffset',
    })
    tzResult.value = targetFormatter.format(new Date(utcMs))
  } catch {
    tzResult.value = ''
  }
}

// ===== Tab 3: Time Difference =====
const diffStart = ref('')
const diffEnd = ref('')
const diffResult = ref<{ label: string; value: string }[] | null>(null)

function calcDiff() {
  if (!diffStart.value || !diffEnd.value) {
    diffResult.value = null
    return
  }
  try {
    const start = new Date(diffStart.value)
    const end = new Date(diffEnd.value)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      diffResult.value = null
      return
    }
    const diffMs = Math.abs(end.getTime() - start.getTime())
    const totalSeconds = Math.floor(diffMs / 1000)
    const totalMinutes = Math.floor(totalSeconds / 60)
    const totalHours = Math.floor(totalMinutes / 60)
    const totalDays = Math.floor(totalHours / 24)

    const days = totalDays
    const hours = totalHours % 24
    const minutes = totalMinutes % 60
    const seconds = totalSeconds % 60

    diffResult.value = [
      { label: '总天数', value: `${totalDays} 天` },
      { label: '总小时', value: `${totalHours} 小时` },
      { label: '总分钟', value: `${totalMinutes} 分钟` },
      { label: '总秒数', value: `${totalSeconds} 秒` },
      { label: '详细', value: `${days} 天 ${hours} 时 ${minutes} 分 ${seconds} 秒` },
    ]
  } catch {
    diffResult.value = null
  }
}

// ===== Tab 4: Date Formatting =====
const fmtInput = ref('')
const fmtTemplate = ref('cn-date')
const fmtResult = ref('')

const formatTemplates = [
  { value: 'cn-date', label: '2026年7月3日' },
  { value: 'cn-datetime', label: '2026年7月3日 14:30:00' },
  { value: 'iso-date', label: '2026-07-03' },
  { value: 'iso-datetime', label: '2026-07-03T14:30:00+08:00' },
  { value: 'us-date', label: 'July 3, 2026' },
  { value: 'us-datetime', label: 'July 3, 2026, 2:30:00 PM' },
  { value: 'slash', label: '2026/07/03 14:30:00' },
]

function formatDate() {
  if (!fmtInput.value) {
    fmtResult.value = ''
    return
  }
  try {
    const d = new Date(fmtInput.value)
    if (isNaN(d.getTime())) {
      fmtResult.value = ''
      return
    }

    const pad = (n: number) => String(n).padStart(2, '0')
    const y = d.getFullYear()
    const M = pad(d.getMonth() + 1)
    const D = pad(d.getDate())
    const h = pad(d.getHours())
    const m = pad(d.getMinutes())
    const s = pad(d.getSeconds())

    switch (fmtTemplate.value) {
      case 'cn-date':
        fmtResult.value = `${y}年${Number(M)}月${Number(D)}日`
        break
      case 'cn-datetime':
        fmtResult.value = `${y}年${Number(M)}月${Number(D)}日 ${h}:${m}:${s}`
        break
      case 'iso-date':
        fmtResult.value = `${y}-${M}-${D}`
        break
      case 'iso-datetime': {
        const tzOffset = -d.getTimezoneOffset()
        const tzSign = tzOffset >= 0 ? '+' : '-'
        const tzH = pad(Math.floor(Math.abs(tzOffset) / 60))
        const tzM = pad(Math.abs(tzOffset) % 60)
        fmtResult.value = `${y}-${M}-${D}T${h}:${m}:${s}${tzSign}${tzH}:${tzM}`
        break
      }
      case 'us-date':
        fmtResult.value = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Shanghai',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(d)
        break
      case 'us-datetime':
        fmtResult.value = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Shanghai',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(d)
        break
      case 'slash':
        fmtResult.value = `${y}/${M}/${D} ${h}:${m}:${s}`
        break
      default:
        fmtResult.value = ''
    }
  } catch {
    fmtResult.value = ''
  }
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

/* ===== Current timestamp ===== */
.now-section {
  background: var(--color-white);
  border: 1px solid var(--color-rain);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.now-label {
  font-size: 0.8125rem;
  color: var(--color-light-ink);
  margin-bottom: 0.25rem;
}

.now-time {
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-ink);
  margin-bottom: 0.5rem;
}

.now-stamp {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-light-ink);
  flex-wrap: wrap;
}

.stamp-value {
  font-family: var(--font-mono);
  font-size: 0.9375rem;
  color: var(--color-duckweed);
  background: var(--color-surface);
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius);
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

.panel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
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

.input-row {
  display: flex;
  gap: 0.5rem;
}

.input-row input {
  flex: 1;
}

.unit-select {
  width: auto;
  min-width: 5rem;
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
  min-height: 2.75rem;
}

.result-text {
  font-family: var(--font-mono);
  font-size: 0.9375rem;
  color: var(--color-ink);
  word-break: break-all;
}

.result-placeholder {
  font-size: 0.8125rem;
  color: var(--color-rain);
}

/* ===== Copy button ===== */
.copy-btn {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--color-light-ink);
  background: var(--color-white);
  border: 1px solid var(--color-rain);
  border-radius: var(--radius);
  padding: 0.25rem 0.625rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  font-family: var(--font-body);
}

.copy-btn:hover {
  border-color: var(--color-duckweed);
  color: var(--color-duckweed);
}

/* ===== Diff result ===== */
.diff-result {
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
}

.diff-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.diff-label {
  font-size: 0.8125rem;
  color: var(--color-light-ink);
}

.diff-value {
  font-family: var(--font-mono);
  font-size: 0.9375rem;
  color: var(--color-ink);
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

  .now-section {
    padding: 1rem 1.125rem;
  }

  .now-time {
    font-size: 1.125rem;
  }

  .tabs {
    gap: 0;
  }

  .tab {
    padding: 0.625rem 0.875rem;
    font-size: 0.8125rem;
  }

  .panel-grid {
    grid-template-columns: 1fr;
  }

  .panel-card {
    padding: 1.125rem;
  }

  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
