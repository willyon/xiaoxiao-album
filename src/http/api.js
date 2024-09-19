/*
 * @Author: zhangshouchang
 * @Date: 2024-08-30 21:53:19
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-18 23:57:49
 * @Description: File description
 */
import httpCurry from './httpInstance'

const getImages = () => {
  return httpCurry('get', '/images/queryAll')()
}

const getAllImagesByPage = (data) => {
  return httpCurry('post', '/images/queryAllByPage')(data)
}

const getCertainMonthImagesByPage = (data) => {
  return httpCurry('post', '/images/queryCertainMonthByPage')(data)
}

export { getImages, getAllImagesByPage, getCertainMonthImagesByPage }
