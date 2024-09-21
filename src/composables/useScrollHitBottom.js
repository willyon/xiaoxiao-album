/*
 * @Author: zhangshouchang
 * @Date: 2024-09-21 09:40:10
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-21 09:59:52
 * @Description: File description
 */
import { ref } from 'vue'
export default (props, emit) => {
  let isAtBottom = ref(false)
  const hitBottom = () => {
    console.log('scroll 到底了')
    if (props.isLoading) {
      emit('load-data')
    }
    isAtBottom.value = true
    setTimeout(() => {
      isAtBottom.value = false
    }, 3000)
  }
  return { hitBottom, isAtBottom }
}
