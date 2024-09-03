/*
 * @Author: zhangshouchang
 * @Date: 2024-08-11 15:07:46
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-08-31 15:27:29
 * @Description: File description
 */
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
// 用于将vue单文件组建编译成js代码
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true, //表示vite会自动检测并使用所有可用的网络接口，包括局域网IP。 或者指定一个具体的IP地址，比如：0.0.0.0(这是一个特殊的IP地址，表示绑定到所有可用的网络接口)
    proxy: {
      '/images': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
