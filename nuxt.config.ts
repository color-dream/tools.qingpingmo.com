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
        { name: 'description', content: '青萍之末在线工具集——图片处理、PDF 处理、时间转换等实用在线工具。纯浏览器本地处理，文件不上传。从细微之处，见未来之风。' },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#EEF2ED' },

        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: '青萍之末在线工具' },
        { property: 'og:locale', content: 'zh_CN' },
        { property: 'og:title', content: '在线工具 - 青萍之末' },
        { property: 'og:description', content: '青萍之末在线工具集——图片处理、PDF 处理、时间转换等实用在线工具。纯浏览器本地处理，文件不上传。' },
        { property: 'og:url', content: 'https://tools.qingpingmo.com' },
        { property: 'og:image', content: 'https://tools.qingpingmo.com/og-image.png' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: '在线工具 - 青萍之末' },
        { name: 'twitter:description', content: '青萍之末在线工具集——图片处理、PDF 处理、时间转换等实用在线工具。' },
        { name: 'twitter:image', content: 'https://tools.qingpingmo.com/og-image.png' },
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
          type: 'text/javascript',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://cdnjs.cloudflare.com' },
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/lxgw-wenkai-screen-webfont/1.7.0/lxgwwenkaiscreen.min.css',
          crossorigin: '',
          media: 'print',
          // @ts-ignore: onload is a valid attribute for link
          onload: "this.media='all'",
        },
      ],
    },
  },
})
