/*
 * @Author: zhangshouchang
 * @Date: 2024-09-18 20:15:42
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-24 22:23:41
 * @Description: File description
 */

const updateLoadingState = (el, binding) => {
  const isLoading = binding.value.isLoading
  const isNoMore = binding.value.isNoMore
  const loadMoreText = el.querySelector('.load-more-tip')
  const noMoreText = el.querySelector('.no-more-tip')
  if (isLoading) {
    loadMoreText.style.display = 'block'
    noMoreText.style.display = 'none'
  } else if (isNoMore) {
    loadMoreText.style.display = 'none'
    noMoreText.style.display = 'block'
    noMoreText.style.opacity = 1
    setTimeout(() => {
      noMoreText.style.opacity = 0
      noMoreText.style.transition = 'opacity 1s ease-out'
    }, 2000)
  }
}

export default {
  mounted(el, binding) {
    let tipStyle = 'height: 30px; width: 100%; font-size: 18px; text-align: center; align-content: center; position: absolute; z-index: 100;bottom: 0'

    const eleLoadMore = document.createElement('p')
    eleLoadMore.style = tipStyle
    eleLoadMore.classList.add('load-more-tip')
    const vLoadingText = el.getAttribute('data-loading-text') || 'Loading...'
    eleLoadMore.textContent = vLoadingText

    const eleNoMore = document.createElement('p')
    eleNoMore.classList.add('no-more-tip')
    eleNoMore.style = tipStyle
    const vNoMoreText = el.getAttribute('data-no-more-text') || 'No more...'
    eleNoMore.textContent = vNoMoreText

    const fragment = document.createDocumentFragment()
    fragment.appendChild(eleLoadMore)
    fragment.appendChild(eleNoMore)

    // 设置position
    const style = window.getComputedStyle(el)
    if (style.position === 'static') {
      el.style.position = 'relative'
    }
    // 将目标元素放入监听容器中
    el.appendChild(fragment)

    // 初始状态
    updateLoadingState(el, binding)
  },

  // 监听值的变化
  updated(el, binding) {
    // 当绑定值发生变化时更新状态
    updateLoadingState(el, binding)
  }
}
