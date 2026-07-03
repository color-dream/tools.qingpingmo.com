<template>
  <footer class="footer">
    <div class="footer-inner">
      <p class="footer-name">青萍之末</p>
      <p class="footer-tagline">风起青萍，浪成微澜</p>
      <p class="footer-meta" style="margin-bottom: 0.75rem">成都青萍之末文化传媒有限公司</p>
      <div class="footer-row">
        <p class="footer-meta">&copy; 2026 青萍之末</p>
        <p class="footer-meta">
          <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer">蜀ICP备2026031599号-1</a>
        </p>
        <button
          class="theme-toggle"
          @click="toggleTheme"
          :aria-label="theme === 'dark' ? '切换亮色模式' : '切换暗色模式'"
        >
          {{ theme === 'dark' ? '明' : '暗' }}
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { theme, toggleTheme } = useTheme()
</script>

<style scoped>
.footer {
  padding: 2.5rem 2rem 3rem;
  text-align: center;
}

.footer-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding-top: 2rem;
  border-top: 1px solid var(--color-rain);
}

.footer-name {
  font-family: var(--font-display);
  font-size: 1.125rem;
  color: var(--color-ink);
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.footer-tagline {
  font-size: 0.875rem;
  color: var(--color-light-ink);
  letter-spacing: 0.08em;
  margin-bottom: 0.25rem;
}

.footer-meta {
  font-size: 0.75rem;
  color: var(--color-light-ink);
}

.footer-meta a {
  font-size: inherit;
  color: inherit;
  text-decoration: none;
}

.footer-meta a:hover {
  color: var(--color-duckweed);
}

.footer-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
}

/* Theme toggle */
.theme-toggle {
  font-family: var(--font-display);
  font-size: 0.8125rem;
  color: var(--color-light-ink);
  background: none;
  border: 1px solid var(--color-rain);
  border-radius: 50%;
  width: 1.75rem;
  height: 1.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  transition: border-color 0.2s, color 0.2s;
}

.theme-toggle:hover {
  border-color: var(--color-duckweed);
  color: var(--color-duckweed);
}
</style>
