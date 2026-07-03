<template>
  <div>
    <!-- ============ Hero ============ -->
    <section class="hero">
      <div class="hero-inner">
        <WindLines />
        <h1 class="hero-title">在线工具</h1>
        <p class="hero-sub">从细微之处，见未来之风</p>
      </div>
      <div class="scroll-hint" aria-hidden="true">
        <span class="scroll-dot"></span>
      </div>
    </section>

    <!-- ============ Tools ============ -->
    <section class="section tools">
      <div class="section-inner">
        <h2 class="section-title">实用工具</h2>
        <div class="tools-grid">
          <ToolCard
            title="图片处理"
            description="格式转换、尺寸调整、图片裁剪、旋转翻转、文字水印、EXIF 信息查看——纯浏览器本地处理。"
            icon="🖼️"
            to="/tools/image"
          />
          <ToolCard
            title="PDF 处理"
            description="PDF 转图片、图片转 PDF、PDF 合并拆分、PDF 信息查看——纯浏览器本地处理。"
            icon="📑"
            to="/tools/pdf"
          />
          <ToolCard
            title="时间转换"
            description="Unix 时间戳转换、时区转换、时间差计算、日期格式化——一站式时间处理工具。"
            icon="⏰"
            to="/tools/time"
          />
          <!-- 未来更多工具卡片在此添加 -->
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '在线工具 - 青萍之末',
  meta: [
    { name: 'description', content: '青萍之末在线工具集——图片处理、PDF 处理、时间转换等实用在线工具。从细微之处，见未来之风。' },
    { property: 'og:title', content: '在线工具 - 青萍之末' },
    { property: 'og:description', content: '青萍之末在线工具集——图片处理、时间转换、时区转换、时间差计算等实用在线工具。' },
    { property: 'og:url', content: 'https://tools.qingpingmo.com' },
  ],
  link: [
    { rel: 'canonical', href: 'https://tools.qingpingmo.com' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '青萍之末在线工具',
        url: 'https://tools.qingpingmo.com',
        description: '青萍之末在线工具集——图片处理、PDF 处理、时间转换等实用在线工具。',
      }),
    },
  ],
})
</script>

<style scoped>
/* ----- Hero ----- */
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 65vh;
  padding: 2rem;
  text-align: center;
}

.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 7vw, 4.5rem);
  font-weight: 500;
  color: var(--color-ink);
  letter-spacing: 0.15em;
  line-height: 1.15;
}

.hero-sub {
  font-size: 1rem;
  color: var(--color-light-ink);
  letter-spacing: 0.08em;
  margin-top: 0.25rem;
}

/* Scroll hint */
.scroll-hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
}

.scroll-dot {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-light-ink);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  50% {
    opacity: 0.7;
    transform: translateY(6px);
  }
}

/* ----- Sections ----- */
.section {
  padding: var(--section-gap) 2rem;
}

.section-inner {
  max-width: var(--max-width);
  margin: 0 auto;
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 500;
  color: var(--color-ink);
  letter-spacing: 0.1em;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 1rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 2rem;
  height: 1px;
  background: var(--color-duckweed);
  opacity: 0.5;
}

/* ----- Tools Grid ----- */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero {
    min-height: 50vh;
    padding: 1.5rem;
  }

  .hero-title {
    font-size: clamp(1.75rem, 10vw, 3rem);
    letter-spacing: 0.1em;
  }

  .section {
    padding: 2.5rem 1.25rem;
  }

  .section-title {
    margin-bottom: 1.5rem;
  }
}
</style>
