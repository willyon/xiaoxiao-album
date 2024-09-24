/*
 * @Author: zhangshouchang
 * @Date: 2024-09-18 13:00:29
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-24 23:31:11
 * @Description: File description
 */

export default {
  mounted(el, binding) {
    const options = {
      root: null, // 默认为视口
      threshold: 1.0 // 触底时触发
    }
    // (这个逻辑注释掉 这个问题放在数据获取的回调函数解决了 pageNo)初次渲染时 内容物还没渲染完毕撑开(或不撑开)el元素 会导致target肯定会处于当前视口 然后触发一次回调 但这不是我们想要的 所以禁掉第一次的触发
    // let isInitialRender = true
    const observer = new IntersectionObserver((entries) => {
      // if (isInitialRender) {
      //   isInitialRender = false
      //   return
      // }
      const entry = entries[0]
      if (entry.isIntersecting) {
        // 当元素可见时，执行传入的回调函数
        // console.log('进入视口了')
        binding.value()
      } else {
        // console.log('离开视口了')
      }
    }, options)

    // 设置position
    const style = window.getComputedStyle(el)
    if (style.position === 'static') {
      el.style.position = 'relative'
    }

    // console.log('开始渲染指令')
    const target = document.createElement('div')
    target.style = 'height:1px;position:absolute;bottom:0'
    el.appendChild(target) // 将目标元素放入监听容器中
    observer.observe(target)
    el.__observer__ = observer
  },
  unmounted(el) {
    // console.log('进入scroll unmounted了')
    // 获取之前保存的 observer 实例，并断开所有观察
    if (el.__observer__) {
      // console.log('进入销毁scroll了')
      el.__observer__.disconnect()
      delete el.__observer__
    }
  }
}
