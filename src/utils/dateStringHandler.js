/*
 * @Author: zhangshouchang
 * @Date: 2024-09-01 10:21:16
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-01 15:02:51
 * @Description: File description
 */

// import { DateTime } from 'luxon'
export const setZhFormat = (dateStr) => {
  if (dateStr.includes('-')) {
    const tmpArr = dateStr.split('-')
    const year = tmpArr[0]
    const month = +tmpArr[1]
    return `${year}年${month}月`
  }
  return `${dateStr}年`
}
