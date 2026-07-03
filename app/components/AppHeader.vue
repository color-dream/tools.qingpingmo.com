<template>
  <header class="header">
    <div class="header-inner">
      <NuxtLink to="/" class="header-brand">
        <span class="brand-name">青萍之末</span>
        <span class="brand-divider" aria-hidden="true">·</span>
        <span class="brand-sub">在线工具</span>
      </NuxtLink>
      <nav class="header-nav" aria-label="主导航">
        <a
          href="https://qingpingmo.com"
          class="nav-link"
          rel="noopener"
        >← 返回主站</a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--color-rain);
  background: var(--color-celadon);
}

.header-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-brand {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
  text-decoration: none;
  color: inherit;
  opacity: 1;
}

.header-brand:hover {
  opacity: 1;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--color-ink);
  letter-spacing: 0.08em;
}

.brand-divider {
  color: var(--color-light-ink);
  font-size: 0.875rem;
}

.brand-sub {
  font-size: 0.9375rem;
  color: var(--color-light-ink);
  letter-spacing: 0.05em;
}

.nav-link {
  font-size: 0.875rem;
  color: var(--color-light-ink);
  text-decoration: none;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--color-duckweed);
  opacity: 1;
}

@media (max-width: 640px) {
  .header {
    padding: 0.875rem 1.25rem;
  }

  .brand-name {
    font-size: 1rem;
  }

  .brand-sub {
    font-size: 0.8125rem;
  }
}
</style>
