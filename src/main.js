/*
 * @Author: zhangshouchang
 * @Date: 2024-08-11 15:07:46
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-03 03:45:27
 * @Description: File description
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/css/main.css'
import './assets/css/global.less'
import i18n from './i18'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(i18n)
app.use(router)
app.use(ElementPlus)

// 绑定当前语言类型到全局变量
// app.config.globalProperties.$currentLocale = i18n.global.locale.value
window.$currentLocale = i18n.global.locale.value

// 设置切换字体样式 后面完善起来 动态调用设定
function setLocale(newLocale) {
  //   i18n.global.locale.value = newLocale;
  document.body.className = newLocale // 根据当前语言切换字体样式
}
setLocale(window.$currentLocale)

let root = app.mount('#app')
