/*
 * @Author: zhangshouchang
 * @Date: 2024-08-22 22:58:38
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-08-26 19:04:40
 * @Description: File description
 */
export default (() => {
  const eventMap = new Map()
  return {
    // 监听指定事件
    addEventListener: (element, eventType, callback, options = {}) => {
      // 当前元素是在监听任意事件 没有的话 则新建一个键值对 以备后用
      if (!eventMap.has(element)) {
        eventMap.set(element, {})
      }
      const events = eventMap.get(element)
      // 当前元素未曾监听所传入事件 则监听 并记录在eventMap中
      if (!events[eventType]) {
        if (element) {
          element.addEventListener(eventType, callback, options)
          events[eventType] = callback
        } else {
          console.warn('事件绑定对象为空，请检查是否正确获取了事件绑定元素')
        }
      } else {
        // console.log(`绑定操作已被忽略，因为当前元素已绑定过'${eventType}'监听事件`)
      }
    },

    // 移除指定事件
    removeEventListener: (element, eventType) => {
      // map对象中是否存在当前元素键值对
      if (eventMap.has(element)) {
        const events = eventMap.get(element)
        // 如果有绑定所传入的监听事件
        if (events[eventType]) {
          element.removeEventListener(eventType, events[eventType])
          // 从map对象中删除该监听事件键值对
          delete events[eventType]
        }
      }
    },

    // 清除元素上的所有事件
    clearEventListeners: (element) => {
      if (eventMap.has(element)) {
        const events = eventMap.get(element)
        for (const eventType in events) {
          element.removeEventListener(eventType, events[eventType])
        }
        // 清除完事件后 在map上删除该键值对
        eventMap.delete(element)
      }
    },

    // 清除所有元素上的所有事件
    clearAllEventListeners: () => {
      eventMap.forEach((events, element) => {
        for (const eventType in events) {
          element.removeEventListener(eventType, events[eventType])
        }
        // 清除完事件后 在map上删除该键值对
        eventMap.delete(element)
      })
    }
  }
})()
