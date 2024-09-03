/*
 * @Author: zhangshouchang
 * @Date: 2024-08-30 21:53:19
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-03 01:44:18
 * @Description: File description
 */
import httpCurry from './httpInstance'

const getImages = () => {
  return httpCurry('get', '/images/query')()
}
export { getImages }
