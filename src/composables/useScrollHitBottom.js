/*
 * @Author: zhangshouchang
 * @Date: 2024-09-21 09:40:10
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-24 23:31:18
 * @Description: File description
 */
import { ref } from 'vue'
export default (emit) => {
  let isAtBottom = ref(false)
  const hitBottom = () => {
    // console.log('底下div进入视口')
    emit('load-data')
    isAtBottom.value = true
    setTimeout(() => {
      isAtBottom.value = false
    }, 3000)
  }
  return { hitBottom, isAtBottom }
}
