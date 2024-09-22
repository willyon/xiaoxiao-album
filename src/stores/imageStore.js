/*
 * @Author: zhangshouchang
 * @Date: 2024-08-11 15:07:46
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-22 20:49:40
 * @Description: File description
 */
// import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { OVERVIEW, BY_YEAR, BY_MONTH, BY_OTHER } from '@/constants/constant'
// import { groupedByYear, groupedByMonth } from '@/utils/photosGroupedByTime'
import { nextTick } from 'vue'

export const useImageStore = defineStore('imageStore', {
  state: () => ({
    //default value
    activeTab: OVERVIEW,
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
    //图片按年分类
    // photoOfYear: (state) => {
    //   return groupedByYear(state.allPhotos, 'creationDate')
    // },
    // 图片按月分类
    // photoOfMonth: (state) => {
    //   return groupedByMonth(state.allPhotos, 'creationDate')
    // },
    // 按年份分组目录页面
    isYearCatalog: (state) => {
      return BY_YEAR === state.activeTab && !state.isCertainYearAlbum
    },
    // 按月份分组目录页面
    isMonthCatalog: (state) => {
      return BY_MONTH === state.activeTab && !state.isCertainMonthAlbum
    },
    // 总览相册
    isOverviewAlbum: (state) => {
      return OVERVIEW === state.activeTab
    }
  },

  actions: {
    // 返回分组(年份或月份)目录
    backToCatalog() {
      if (this.isCertainYearAlbum) {
        this.closeAndResetCertainYearAlbum()
      } else if (this.isCertainMonthAlbum) {
        this.closeAndResetCertainMonthAlbum()
      }
      // 恢复新打开组件的上一次滚动位置
      this._restoreScrollPositon()
    },
    closeCertainAlbum() {
      if (this.isCertainYearAlbum) {
        this.isCertainYearAlbum = false
      } else if (this.isCertainMonthAlbum) {
        this.isCertainMonthAlbum = false
      }
    },
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
    preconditionAndTabSwitch(curType) {
      this.closeAndResetCertainMonthAlbum()
      this.tabSwitch(curType)
    },
    // 标签切换
    tabSwitch(curType) {
      // 如果是点击了当前active标签
      if (curType === this.activeTab) {
        // 且该标签下展示的内容为具体(具体某年份/具体某月份)相册 则关闭掉具体相册 回到其上一层（按年/月份分组总览页）即active标签对应的分组总览页
        // 先不放开这个版本 统一通过返回箭头去返回上一层
        // this.backToCatalog()
      } else if (curType !== this.activeTab) {
        // 保存当前组件滚动位置
        this._saveScrollPosition()
        // 关闭具体相册(如果有打开的话)
        this.closeCertainAlbum()
        // 标签切换
        this.activeTab = curType
        // 重新打开上次缓存的具体相册(如果有的话)
        this.reopenCachedCertainAlbum()
        // 恢复新打开组件的上一次滚动位置
        this._restoreScrollPositon()
      }
    },
    // updatePhotos({ data: photos, total }) {
    // this.allPhotosTotal = total
    // this.updateAllPhotos(photos)
    // this.updateAlbumData(photos)
    // },
    updateAllPhotos({ data: photos, total }) {
      this.allPhotosTotal = total
      this.allPhotos.push(...photos)
    },
    updateCertainYearAlbumPhotos({ data: photos, total }) {
      this.certainYearAlbumTotal = total
      this.certainYearAlbumPhotos.push(...photos)
    },
    updateCertainMonthAlbumPhotos({ data: photos, total }) {
      this.certainMonthAlbumTotal = total
      this.certainMonthAlbumPhotos.push(...photos)
    },
    updateGroupByYearCatalog({ data: groupsData, total }) {
      this.groupByYearCatalogTotal = total
      this.groupByYearCatalog.push(...groupsData)
    },
    updateGroupByMonthCatalog({ data: groupsData, total }) {
      this.groupByMonthCatalogTotal = total
      this.groupByMonthCatalog.push(...groupsData)
    },
    // updateAlbumData(photos) {
    //   this.albumPhotos.splice(0)
    //   this.albumPhotos.push(...photos)
    // },
    // 关闭具体年份相册,重新加载滚动条位置并清除用于keep alive的缓存标识
    closeAndResetCertainYearAlbum() {
      this.scrollPositions['certainYearAlbum'] = 0
      this.isCertainYearAlbum = false
      this.isCachedCertainYearAlbum = false
    },

    // 关闭具体月份相册并重新加载滚动条位置
    closeAndResetCertainMonthAlbum() {
      this.scrollPositions['certainMonthAlbum'] = 0
      this.isCertainMonthAlbum = false
      this.isCachedCertainMonthAlbum = false
    },

    openCertainYearAlbum() {
      // 保存图片分组目录页滚动条位置
      this._saveScrollPosition()
      //重置具体相册数据
      this.certainYearAlbumPhotos.splice(0)
      this.certainYearAlbumPhotosTotal = 0
      this.isCertainYearAlbum = true
      this.isCachedCertainYearAlbum = true
    },
    openCertainMonthAlbum() {
      // 保存当前页面滚动条位置
      this._saveScrollPosition()
      //重置具体相册数据
      this.certainMonthAlbumPhotos.splice(0)
      this.certainMonthAlbumPhotosTotal = 0
      this.isCertainMonthAlbum = true
      this.isCachedCertainMonthAlbum = true
    },
    // updateGroupAlbumCoverTitle(groupAlbumCoverTitle) {
    //   this.groupAlbumCoverTitle = groupAlbumCoverTitle
    // },
    // updateAlbumValue(creationDate) {
    //   this.albumDate = creationDate ? DateTime.fromMillis(creationDate).toFormat('yyyy-MM') : BY_OTHER
    // },
    _saveScrollPosition() {
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
