/*
 * @Author: zhangshouchang
 * @Date: 2024-08-31 21:03:19
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-02 22:45:17
 * @Description: File description
 */
import { DateTime } from 'luxon'
import { UNKNOWN_ALBUM } from '@/constants/constant'

const YEAR = 'byYear'
const MONTH = 'byMonth'

//按年份分类
export const groupedByYear = (arr, timestampName) => {
  return groupHandler(arr, timestampName, YEAR)
}

//按月份分类
export const groupedByMonth = (arr, timestampName) => {
  return groupHandler(arr, timestampName, MONTH)
}

const groupHandler = (arr, timestampName, keyType) => {
  // 按年份归类 如{'2020':[],'2024':[],'2023':[]} 或 按月份归类 如{'2020-1':[],'2024-2':[],'2023-9':[]}
  const groupObject = arr.reduce((acc, item) => {
    const timestamp = +item[timestampName]
    let key = ''
    if (timestamp && !isNaN(timestamp)) {
      const date = DateTime.fromMillis(timestamp)
      if (keyType === YEAR) {
        key = `${date.year}` //YYYY
      } else if (keyType === MONTH) {
        key = `${date.year}-${date.toFormat('MM')}` //YYYY-MM
      }
    } else {
      key = UNKNOWN_ALBUM
    }

    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {})

  //若有BY_OTHER键值对 则先暂时缓存起来然后删掉 后面所有排序完毕后再加回去
  let tmpOther = null
  if (groupObject[UNKNOWN_ALBUM]) {
    tmpOther = groupObject[UNKNOWN_ALBUM]
    delete groupObject[UNKNOWN_ALBUM]
  }

  // 按年份降序排序 如[2024,2023,2020] 或 按月份降序排序 如[2024-2,2023-9,2020-1]
  let sortedKeys = []
  if (keyType === YEAR) {
    sortedKeys = Object.keys(groupObject).sort((a, b) => {
      return b - a
    })
  } else if (keyType === MONTH) {
    sortedKeys = Object.keys(groupObject).sort((a, b) => {
      const dateA = DateTime.fromFormat(a, 'yyyy-M')
      const dateB = DateTime.fromFormat(b, 'yyyy-M')
      return dateB.toMillis() - dateA.toMillis()
    })
  }

  // 根据排序后的键重新构建对象 {'2024':[],'2023':[],'2020':[]}
  const sortedMap = sortedKeys.reduce((acc, key) => {
    acc.set(key, groupObject[key])
    return acc
  }, new Map())

  // 对每个年份或月份数组内容根据时间戳进行降序排序 如年份的{'2024':[{date:timestamp,...},...],'2023':[{date:timestamp,...},...],'2020':[{date:timestamp,...},...]}
  const resultMap = [...sortedMap.keys()].reduce((acc, key) => {
    acc.set(key, sortGroupsByRecent(sortedMap.get(key), timestampName))
    return acc
  }, new Map())

  //把BY_OTHER内容加回来(若有)
  if (tmpOther) {
    resultMap.set(UNKNOWN_ALBUM, tmpOther)
  }

  return resultMap
}

const sortGroupsByRecent = (arr, timestampName) => {
  return arr.sort((a, b) => {
    const dateA = DateTime.fromMillis(+a[timestampName])
    const dateB = DateTime.fromMillis(+b[timestampName])
    return dateB.toMillis() - dateA.toMillis()
    // return timeB.diff(now).as('milliseconds') - timeA.diff(now).as('milliseconds')
  })
}
