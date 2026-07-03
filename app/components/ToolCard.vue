<template>
  <NuxtLink :to="to" class="tool-card">
    <span class="tool-icon" aria-hidden="true">{{ icon }}</span>
    <div class="tool-info">
      <h3 class="tool-name">{{ title }}</h3>
      <p class="tool-desc">{{ description }}</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  icon: string
  to: string
}>()
</script>

<style scoped>
.tool-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.875rem;
  padding: 1.75rem 1.25rem;
  background: var(--color-white);
  border: 1px solid var(--color-rain);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
}

.tool-card:hover {
  border-color: var(--color-duckweed);
  box-shadow: 0 2px 16px rgba(107, 127, 107, 0.12);
  transform: translateY(-3px);
  opacity: 1;
}

[data-theme='dark'] .tool-card:hover {
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.35);
}

.tool-icon {
  flex-shrink: 0;
  font-size: 2.25rem;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border-radius: var(--radius);
}

.tool-info {
  min-width: 0;
}

.tool-name {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 500;
  color: var(--color-ink);
  letter-spacing: 0.05em;
  margin-bottom: 0.375rem;
}

.tool-desc {
  font-size: 0.8125rem;
  color: var(--color-light-ink);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 640px) {
  .tool-card {
    padding: 1.25rem 1rem;
    gap: 0.625rem;
  }

  .tool-icon {
    font-size: 1.75rem;
    width: 3rem;
    height: 3rem;
  }

  .tool-desc {
    -webkit-line-clamp: 2;
  }
}
</style>
