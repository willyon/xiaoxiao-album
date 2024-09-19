/*
 * @Author: zhangshouchang
 * @Date: 2024-08-25 15:07:39
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-18 14:14:18
 * @Description: File description
 */
export default {
  mounted(el) {
    const eleChild = document.createElement('div')
    eleChild.style.background = 'linear-gradient(rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 90%)'
    eleChild.style.width = '100%'
    eleChild.style.height = '190px'
    eleChild.style.position = 'fixed'
    eleChild.style.zIndex = '10'
    eleChild.style.bottom = '0'
    eleChild.style.pointerEvents = 'none'
    el.appendChild(eleChild) // 添加底部蒙层子元素
  }
}
