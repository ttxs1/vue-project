/// <reference types="vitest" />

import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import type { PageMetaDatum } from '@uni-helper/vite-plugin-uni-pages'
import UniPages from '@uni-helper/vite-plugin-uni-pages'
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'

// @ts-expect-error failed to resolve types
import ReactivityTransform from '@vue-macros/reactivity-transform/vite'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~/': `${resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    /**
     * vite-plugin-uni-pages
     * @see https://github.com/uni-helper/vite-plugin-uni-pages
     */
    UniPages({
      dir: 'src/pages',
      routeBlockLang: 'yaml',
      exclude: ['**/components/*.vue'],
      subPackages: [
        'src/pages-sub',
      ],
      onBeforeWriteFile(ctx) {
        type PageMeta = (PageMetaDatum & { name: string; tabBar?: { text?: string; iconPath: string; selectedIconPath: string } })

        const pageMetaData = ctx.pageMetaData as PageMeta[]

        ctx.pagesGlobConfig!.tabBar!.list = pageMetaData.flatMap(e => 'tabBar' in e
          ? {
              pagePath: e.path,
              text: e.tabBar?.text ? e.tabBar.text : e.style?.navigationBarTitleText,
              iconPath: e.tabBar!.iconPath,
              selectedIconPath: e.tabBar!.selectedIconPath,
            }
          : [])
      },
    }),

    /**
     * vite-plugin-uni-layouts
     * @see https://github.com/uni-helper/vite-plugin-uni-layouts
     */
    UniLayouts(),

    /**
     * unocss
     * @see https://github.com/antfu/unocss
     * see unocss.config.ts for config
    */
    Unocss(),

    /**
     * unplugin-auto-import 按需 import
     * @see https://github.com/antfu/unplugin-auto-import
     */
    AutoImport({
      imports: [
        'vue',
        'uni-app',
      ],
      dts: true,
      dirs: [
        './src/composables',
      ],
      vueTemplate: true,
    }),

    /**
     * unplugin-vue-components 按需引入组件
     * 注意：需注册至 uni 之前，否则不会生效
     * @see https://github.com/antfu/vite-plugin-components
     */
    Components({
      dts: 'src/components.d.ts',
    }),

    uni(),

    /**
     * Reactivity Transform
     * @see https://vue-macros.sxzz.moe/zh-CN/features/reactivity-transform.html
     */
    ReactivityTransform(),
  ],

  /**
   * Vitest
   * @see https://github.com/vitest-dev/vitest
   */
  test: {
    environment: 'jsdom',
  },
})
