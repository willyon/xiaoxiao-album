/*
 * @Author: zhangshouchang
 * @Date: 2024-08-11 15:07:46
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-24 23:57:21
 * @Description: File description
 */
import { defineStore } from 'pinia'
import { OVERVIEW_ALBUM, YEAR_CATALOG, MONTH_CATALOG } from '@/constants/constant'
import { nextTick } from 'vue'

export const useImageStore = defineStore('imageStore', {
  state: () => ({
    //default value
    activeTab: OVERVIEW_ALBUM,
    // oepn certain year album, not overview album
    isCertainYearAlbum: false,
    isCachedCertainYearAlbum: false,
    // oepn certain month album, not overview album
    isCertainMonthAlbum: false,
    isCachedCertainMonthAlbum: false,
    // all photos data
    allPhotos: [],
    // all images in table
    allPhotosTotal: 0,
    // certain year data
    certainYearAlbumPhotos: [],
    // certain year album count
    certainYearAlbumTotal: 0,
    // certain month data
    certainMonthAlbumPhotos: [],
    // certain album count
    certainMonthAlbumTotal: 0,
    // group by year
    groupByYearCatalog: [],
    // group by year total
    groupByYearCatalogTotal: 0,
    // group by month
    groupByMonthCatalog: [],
    // group by month total
    groupByMonthCatalogTotal: 0,
    // component scroll position
    scrollPositions: {},
    scrollContainer: document.documentElement
  }),
  getters: {
    // 按年份分组目录页面
    isYearCatalog: (state) => {
      return YEAR_CATALOG === state.activeTab && !state.isCertainYearAlbum
    },
    // 按月份分组目录页面
    isMonthCatalog: (state) => {
      return MONTH_CATALOG === state.activeTab && !state.isCertainMonthAlbum
    },
    // 总览相册
    isOverviewAlbum: (state) => {
      return OVERVIEW_ALBUM === state.activeTab
    }
  },

  actions: {
    // 返回分组(年份或月份)目录
    backToCatalog() {
      if (this.isCertainYearAlbum) {
        this.isCertainYearAlbum = false
        this.isCachedCertainYearAlbum = false
        // 关闭具体年份相册,重新加载滚动条位置并清除用于keep alive的缓存标识
        this.scrollPositions['certainYearAlbum'] = 0
      } else if (this.isCertainMonthAlbum) {
        this.isCertainMonthAlbum = false
        this.isCachedCertainMonthAlbum = false
        this.scrollPositions['certainMonthAlbum'] = 0
      }
      // 恢复新打开组件的上一次滚动位置
      this._restoreScrollPositon()
    },
    // 关闭具体年份或月份相册
    closeCertainAlbum() {
      if (this.isCertainYearAlbum) {
        this.isCertainYearAlbum = false
      } else if (this.isCertainMonthAlbum) {
        this.isCertainMonthAlbum = false
      }
    },
    // 打开在年份目录或月份目录下曾被打开并被缓存的具体年份或月份相册
    reopenCachedCertainAlbum() {
      if (this.isYearCatalog) {
        if (this.isCachedCertainYearAlbum) {
          this.isCertainYearAlbum = true
        }
      } else if (this.isMonthCatalog) {
        if (this.isCachedCertainMonthAlbum) {
          this.isCertainMonthAlbum = true
        }
      }
    },
    // 标签切换
    tabSwitch(curType, openCachedCertainAlbum = true) {
      if (curType !== this.activeTab) {
        // 保存当前组件滚动位置
        this.saveScrollPosition()
        // 关闭具体相册(如果有打开的话)
        this.closeCertainAlbum()
        // 标签切换
        this.activeTab = curType
        // 重新打开上次缓存的具体相册(如果有的话)
        if (openCachedCertainAlbum) {
          this.reopenCachedCertainAlbum()
        }
        // 恢复新打开组件的上一次滚动位置
        this._restoreScrollPositon()
      }
    },
    // 更新全部图片相册数据
    updateAllPhotos({ data: photos, total }) {
      this.allPhotosTotal = total
      this.allPhotos.push(...photos)
    },
    // 更新具体年份相册数据
    updateCertainYearAlbumPhotos({ data: photos, total }) {
      this.certainYearAlbumTotal = total
      this.certainYearAlbumPhotos.push(...photos)
    },
    // 更新具体月份相册数据
    updateCertainMonthAlbumPhotos({ data: photos, total }) {
      this.certainMonthAlbumTotal = total
      this.certainMonthAlbumPhotos.push(...photos)
    },
    // 更新年份目录数据
    updateGroupByYearCatalog({ data: groupsData, total }) {
      this.groupByYearCatalogTotal = total
      this.groupByYearCatalog.push(...groupsData)
    },
    // 更新月份目录数据
    updateGroupByMonthCatalog({ data: groupsData, total }) {
      this.groupByMonthCatalogTotal = total
      this.groupByMonthCatalog.push(...groupsData)
    },
    // 打开新的具体年份相册
    openNewCertainYearAlbum() {
      //重置具体相册数据
      this.scrollPositions['certainYearAlbum'] = 0
      this.certainYearAlbumPhotos.splice(0)
      this.certainYearAlbumPhotosTotal = 0
      this.isCertainYearAlbum = true
      this.isCachedCertainYearAlbum = true
    },
    // 打开新的具体月份相册
    openNewCertainMonthAlbum() {
      //重置具体相册数据
      this.scrollPositions['certainMonthAlbum'] = 0
      this.certainMonthAlbumPhotos.splice(0)
      this.certainMonthAlbumPhotosTotal = 0
      this.isCertainMonthAlbum = true
      this.isCachedCertainMonthAlbum = true
    },
    // 保存当前组件滚动条位置
    saveScrollPosition() {
      if (this.scrollContainer) {
        if (!this.isCertainYearAlbum && !this.isCertainMonthAlbum) {
          this.scrollPositions[this.activeTab] = this.scrollContainer.scrollTop || 0
        } else if (this.isCertainYearAlbum) {
          this.scrollPositions['certainYearAlbum'] = this.scrollContainer.scrollTop || 0
        } else if (this.isCertainMonthAlbum) {
          this.scrollPositions['certainMonthAlbum'] = this.scrollContainer.scrollTop || 0
        }
      }
    },
    // 恢复当前组件上一次的滚动条位置
    _restoreScrollPositon() {
      // 一定要加nextTick 否则如果页面还没渲染 窗口未被内容撑开出现滚动条 即使看似赋值了scrollTop 其实实际的值也只是0
      nextTick(() => {
        // 两种写法都行
        // this.scrollContainer.scrollTop = this.scrollPositions[this.activeTab]
        if (!this.isCertainYearAlbum && !this.isCertainMonthAlbum) {
          this.scrollContainer.scrollTo({ top: this.scrollPositions[this.activeTab] })
        } else if (this.isCertainYearAlbum) {
          this.scrollContainer.scrollTo({ top: this.scrollPositions['certainYearAlbum'] })
        } else if (this.isCertainMonthAlbum) {
          this.scrollContainer.scrollTo({ top: this.scrollPositions['certainMonthAlbum'] })
          // this.scrollContainer.scrollTo({ top: this.scrollPositions['certainMonthAlbum'], behavior: 'smooth' })
        }
      })
    }
  }
})
