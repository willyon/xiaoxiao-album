/*
 * @Author: zhangshouchang
 * @Date: 2024-08-22 09:21:15
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-08-27 15:43:48
 * @Description: 逐列播放动画，如此循环
 */
import { onUnmounted } from 'vue'
import getColumnCount from '@/utils/getColumnCount.js'
import getColumnChildNodesGroup from '@/utils/getColumnChildNodesGroup.js'
import elementEventListenerManager from '@/utils/elementEventListenerManager.js'

export default (gridContainer, gridItemClassName, gridItemAnimationClassName) => {
  // grid布局列数
  let columnCount = 0
  // 列子元素分组
  let columnChildNodesGroup = null
  // 当前动画列序号
  let curAnimateColumn = 1
  // 当前动画列子元素动画结束数量
  let animationEndCount = 0

  // 获取grid布局列数
  columnCount = getColumnCount(gridContainer)
  // 将所有grid子元素按列分组
  columnChildNodesGroup = getColumnChildNodesGroup(gridItemClassName)
  //开始循环动画
  startAnimation()

  function startAnimation() {
    animationEndCount = 0
    // 当前列添加动画类
    if (
      columnChildNodesGroup &&
      columnChildNodesGroup[curAnimateColumn] &&
      columnChildNodesGroup[curAnimateColumn].length
    ) {
      columnChildNodesGroup[curAnimateColumn].forEach((gridItem) => {
        gridItem.classList.add(gridItemAnimationClassName)
        elementEventListenerManager.addEventListener(gridItem, 'animationend', removeAnimation)
      })
    }
  }

  function removeAnimation(ev) {
    ev.target.classList.remove(gridItemAnimationClassName)
    if (++animationEndCount === columnChildNodesGroup[curAnimateColumn].length) {
      // 列数+1
      ++curAnimateColumn > columnCount ? (curAnimateColumn = 1) : ''
      startAnimation()
    }
  }

  onUnmounted(() => {
    // 移除所有元素的所有监听事件
    elementEventListenerManager.clearAllEventListeners()
  })
}
