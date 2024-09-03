/*
 * @Author: zhangshouchang
 * @Date: 2024-08-23 09:24:07
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-08-23 10:19:24
 * @Description: File description
 */
export default (() => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) &&
    ('ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches)
  )
})()
