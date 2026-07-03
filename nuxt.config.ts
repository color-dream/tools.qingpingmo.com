// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '在线工具 - 青萍之末',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '青萍之末在线工具集——时间转换、时区转换、时间差计算等实用在线工具。从细微之处，见未来之风。' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: '在线工具 - 青萍之末' },
        { property: 'og:description', content: '青萍之末在线工具集——时间转换、时区转换、时间差计算等实用在线工具。' },
        { property: 'og:url', content: 'https://tools.qingpingmo.com' },
        { name: 'twitter:card', content: 'summary' },
      ],
      script: [
        {
          innerHTML: `
            (function(){
              var t=localStorage.getItem('theme');
              if(!t){t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';}
              document.documentElement.setAttribute('data-theme',t);
            })()
          `.replace(/\n\s*/g, ''),
          type: 'text/javascript'
        }
      ],
      link: [
        { rel: 'canonical', href: 'https://tools.qingpingmo.com' },
        {
          rel: 'preconnect',
          href: 'https://cdnjs.cloudflare.com'
        },
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/lxgw-wenkai-screen-webfont/1.7.0/lxgwwenkaiscreen.min.css',
          crossorigin: ''
        }
      ]
    }
  }
})
