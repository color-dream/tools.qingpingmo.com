<template>
  <NuxtLink :to="to" class="tool-card">
    <span class="tool-icon" aria-hidden="true">{{ icon }}</span>
    <div class="tool-info">
      <h3 class="tool-name">{{ title }}</h3>
      <p class="tool-desc">{{ description }}</p>
    </div>
    <span class="tool-arrow" aria-hidden="true">→</span>
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
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: var(--color-white);
  border: 1px solid var(--color-rain);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
}

.tool-card:hover {
  border-color: var(--color-duckweed);
  box-shadow: 0 2px 12px rgba(107, 127, 107, 0.1);
  transform: translateY(-2px);
  opacity: 1;
}

[data-theme='dark'] .tool-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.tool-icon {
  flex-shrink: 0;
  font-size: 1.75rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border-radius: var(--radius);
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--color-ink);
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.tool-desc {
  font-size: 0.875rem;
  color: var(--color-light-ink);
  line-height: 1.6;
}

.tool-arrow {
  flex-shrink: 0;
  font-size: 1.25rem;
  color: var(--color-light-ink);
  transition: transform 0.2s, color 0.2s;
}

.tool-card:hover .tool-arrow {
  transform: translateX(3px);
  color: var(--color-duckweed);
}

@media (max-width: 640px) {
  .tool-card {
    padding: 1.125rem;
    gap: 1rem;
  }

  .tool-icon {
    font-size: 1.5rem;
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>
