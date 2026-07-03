<template>
  <div class="wind" aria-hidden="true">
    <svg
      class="wind-svg"
      viewBox="0 0 1200 180"
      preserveAspectRatio="none"
    >
      <path
        class="wline wline-1"
        d="M0,50 Q300,25 600,50 T1200,50"
      />
      <path
        class="wline wline-2"
        d="M0,90 Q300,115 600,90 T1200,90"
      />
      <path
        class="wline wline-3"
        d="M0,130 Q300,105 600,130 T1200,130"
      />
    </svg>
  </div>
</template>

<style scoped>
.wind {
  width: min(480px, 70vw);
  height: 80px;
  margin-bottom: 1.5rem;
  overflow: visible;
}

.wind-svg {
  width: 100%;
  height: 100%;
}

.wline {
  fill: none;
  stroke: var(--color-duckweed);
  animation: drift 8s ease-in-out infinite;
}

.wline-1 {
  stroke-width: 0.6;
  opacity: 0.35;
  animation-delay: 0s;
}

.wline-2 {
  stroke-width: 0.8;
  opacity: 0.45;
  animation-delay: 2.5s;
}

.wline-3 {
  stroke-width: 0.5;
  opacity: 0.3;
  animation-delay: 5s;
}

@keyframes drift {
  0%,
  100% {
    transform: translateX(0) scaleX(1);
  }
  25% {
    transform: translateX(6px) scaleX(0.985);
  }
  50% {
    transform: translateX(0) scaleX(1.01);
  }
  75% {
    transform: translateX(-4px) scaleX(0.992);
  }
}

@media (max-width: 640px) {
  .wind {
    width: min(320px, 80vw);
    height: 60px;
  }
}
</style>
