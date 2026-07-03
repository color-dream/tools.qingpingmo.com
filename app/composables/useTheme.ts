import { ref, onMounted } from 'vue'

export function useTheme() {
  const theme = ref<'light' | 'dark'>('light')

  function applyTheme(t: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem('theme', t)
    theme.value = t
  }

  function toggleTheme() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  onMounted(() => {
    const current =
      document.documentElement.getAttribute('data-theme') || 'light'
    theme.value = current as 'light' | 'dark'
    document.documentElement.classList.add('theme-ready')
  })

  return { theme, toggleTheme }
}
