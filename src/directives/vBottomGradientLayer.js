/*
 * @Author: zhangshouchang
 * @Date: 2024-08-25 15:07:39
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-08-25 17:14:46
 * @Description: File description
 */
export default {
  mounted(el) {
    el.style.background = 'linear-gradient(rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 90%)'
    el.style.width = '100%'
    el.style.height = '190px'
    el.style.position = 'fixed'
    el.style.zIndex = '10'
    el.style.bottom = '0'
    el.style.pointerEvents = 'none'
  }
}
