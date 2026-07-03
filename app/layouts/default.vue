<template>
  <div class="page">
    <a href="#main" class="skip-link">跳到主要内容</a>
    <AppHeader />
    <main id="main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
