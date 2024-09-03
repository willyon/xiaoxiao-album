/*
 * @Author: zhangshouchang
 * @Date: 2024-08-30 17:33:53
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-03 01:42:19
 * @Description: File description
 */
import axios from 'axios'
import { REQUEST_SUCCESS } from '@/constants/constant'

// 创建axios实例
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    //在请求发出前做些什么 比如在请求头添加token
    return config
  },
  (error) => {
    return Promise.reject('接口请求出错：', error)
  }
)

//响应拦截器
http.interceptors.response.use(
  (response) => {
    console.log('接口返回结果：', response)
    // 这里可以进行登陆是否过期的判断

    // 对错误进行统一处理
    if (response.status !== REQUEST_SUCCESS) {
      //可以进行一些错误弹出提示
      return Promise.reject(response)
    } else if (response.status === REQUEST_SUCCESS) {
      // 可以进行一些请求成功弹出提示
    }

    return Promise.resolve({
      // code: response.data.code,
      // msg: response.data.msg,
      data: response.data
    })
  },
  (error) => {
    if (error.message.indexOf('timeout') > -1) {
      //可弹出弹框提示请求超时
      console.log('请求超时了')
    }
    return Promise.reject(error)
  }
)

const httpCurry = function (method, url, isFormData = false) {
  return (data = {}) => {
    const config = {
      method,
      url
    }
    if (method.toUpperCase() === 'GET') {
      // get
      config.params = data
    } else {
      // post
      config.data = data
    }
    // x-www-form-urlencoded || formdata
    if (isFormData) {
      const fs = new FormData()
      for (const key in data) {
        fs.append(key, data[key])
      }
      config.data = fs
    }
    return http(config)
  }
}

export default httpCurry
