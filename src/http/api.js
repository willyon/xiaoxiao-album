/*
 * @Author: zhangshouchang
 * @Date: 2024-08-30 21:53:19
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-22 03:12:16
 * @Description: File description
 */
import httpCurry from './httpInstance'

// 获取全部图片
const getImages = () => {
  return httpCurry('get', '/images/queryAll')()
}

// 分页查询所有图片
const getAllImagesByPage = (data) => {
  return httpCurry('post', '/images/queryAllByPage')(data)
}

// 分页查询具体某月的图片
const getCertainTimeRangePicsByPage = (data) => {
  console.log('data:', data)
  return httpCurry('post', '/images/queryCertainTimeRangeByPage')(data)
}

// 分页查询图片年份分组
const getImagesGroupedByYearByPage = (data) => {
  return httpCurry('post', '/images/queryGroupByYearAndPage')(data)
}

// 分页查询图片年份分组
const getImagesGroupedByMonthByPage = (data) => {
  return httpCurry('post', '/images/queryGroupByMonthAndPage')(data)
}

export { getImages, getAllImagesByPage, getCertainTimeRangePicsByPage, getImagesGroupedByYearByPage, getImagesGroupedByMonthByPage }
