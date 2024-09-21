/*
 * @Author: zhangshouchang
 * @Date: 2024-08-11 15:07:46
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-22 03:20:11
 * @Description: File description
 */
// import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { OVERVIEW, BY_YEAR, BY_MONTH, BY_OTHER } from '@/constants/constant'
import { groupedByYear, groupedByMonth } from '@/utils/photosGroupedByTime'
import { nextTick } from 'vue'

export const useImageStore = defineStore('imageStore', {
  state: () => ({
    //default value
    activeTab: OVERVIEW,
    // oepn certain album, not overview album
    isCertainAlbum: false,
    // all photos data
    allPhotos: [],
    // all images in table
    allPhotosTotal: 0,
    // certain month data
    certainAlbumPhotos: [],
    // certain album count
    certainAlbumTotal: 0,
    // group by year
    groupByYearCatalog: [],
    // group by year total
    groupByYearCatalogTotal: 0,
    // group by month
    groupByMonthCatalog: [],
    // group by month total
    groupByMonthCatalogTotal: 0,
    // current display group album cover title
    // groupAlbumCoverTitle: '',
    // albumPhotos: [],
    // certain album desc like 2024-02-03 or 2020
    // component scroll position
    scrollPositions: {},
    scrollContainer: document.documentElement
  }),
  getters: {
    //图片按年分类
    photoOfYear: (state) => {
      return groupedByYear(state.allPhotos, 'creationDate')
    },
    // 图片按月分类
    photoOfMonth: (state) => {
      return groupedByMonth(state.allPhotos, 'creationDate')
    },
    //当前展示图片
    // groupedCatalog: (state) => {
    //   if (state.activeTab === BY_YEAR) {
    //     return state.photoOfYear
    //   } else if (state.activeTab === BY_MONTH) {
    //     return state.photoOfMonth
    //   }
    // },
    // 按年份分组目录页面 未打开具体某一组相册
    isYearCatalog: (state) => {
      return BY_YEAR === state.activeTab && !state.isCertainAlbum
    },
    // 按年份分组页面 已打开具体某一组相册
    isYearCatalogCertainAlbum: (state) => {
      return BY_YEAR === state.activeTab && state.isCertainAlbum
    },
    // 按月份分组页面 未打开具体某一组相册
    isMonthCatalog: (state) => {
      return BY_MONTH === state.activeTab && !state.isCertainAlbum
    },
    // 按月份分组页面 已打开具体某一组相册
    isMonthCatalogCertainAlbum: (state) => {
      return BY_MONTH === state.activeTab && state.isCertainAlbum
    },
    // 总览相册
    isOverviewAlbum: (state) => {
      return OVERVIEW === state.activeTab
    }
  },

  actions: {
    // 标签切换
    tabSwitch(curType) {
      // 如果是点击了当前active标签
      if (curType === this.activeTab) {
        // 且该标签下展示的内容为具体(具体某年份/具体某月份)相册 则关闭掉具体相册 回到其上一层（按年/月份分组总览页）即active标签对应的分组总览页
        if (this.isCertainAlbum) {
          this.closeCertainAlbum()
        }
      } else if (curType !== this.activeTab) {
        // 如果是点击了当前非active标签 则按以下步骤来 curType是总览、按年份、按月份意思中的一种
        // 且该标签下展示的内容不为具体(具体某年份/具体某月份)相册 即 总览页 或者分组总览页
        if (this.isCertainAlbum) {
          this.closeCertainAlbum()
        } else {
          //记录当前页面滚动条的滚动位置
          this._saveScrollPosition()
        }
        this.activeTab = curType
        // 恢复目标组件的滚动位置
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
    updateCertainAlbumPhotos({ data: photos, total }) {
      this.certainAlbumTotal = total
      this.certainAlbumPhotos.push(...photos)
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
    // 关闭具体相册并重新加载滚动条位置
    closeCertainAlbum() {
      this.isCertainAlbum = false
      this._restoreScrollPositon()
    },
    // openCertainAlbum({ photos, albumDate }) {
    //   if (photos) {
    //     this.updateAlbumData(photos)
    //   }
    //   if (albumDate) {
    //     this.updateAlbumDesc(albumDate)
    //   }
    //   this._saveScrollPosition()
    //   this.isCertainAlbum = true
    //   nextTick(() => {
    //     this._resetScrollTop()
    //   })
    // },
    //  groupAlbumCoverTitle
    openCertainAlbum() {
      // 保存当前页面滚动条位置
      this._saveScrollPosition()
      // 更新分组相册封面标题 如 2024 或 2024-01 或 other
      // if (groupAlbumCoverTitle) {
      //   this.updateGroupAlbumCoverTitle(groupAlbumCoverTitle)
      // }
      //重置具体相册数据
      this.certainAlbumPhotos.splice(0)
      this.certainAlbumPhotosTotal = 0
      this.isCertainAlbum = true
      nextTick(() => {
        // 相册打开后，重置当前具体相册的滚动条位置至scrollTop为0
        this._resetScrollTop()
      })
    },
    // updateGroupAlbumCoverTitle(groupAlbumCoverTitle) {
    //   this.groupAlbumCoverTitle = groupAlbumCoverTitle
    // },
    // updateAlbumValue(creationDate) {
    //   this.albumDate = creationDate ? DateTime.fromMillis(creationDate).toFormat('yyyy-MM') : BY_OTHER
    // },
    _saveScrollPosition() {
      if (this.scrollContainer) {
        this.scrollPositions[this.activeTab] = this.scrollContainer.scrollTop || 0
      }
    },
    _resetScrollTop() {
      this.scrollContainer.scrollTop = 0
    },
    _restoreScrollPositon() {
      // 一定要加nextTick 否则如果页面还没渲染 窗口未被内容撑开出现滚动条 即使看似赋值了scrollTop 其实实际的值也只是0
      nextTick(() => {
        // 两种写法都行
        // this.scrollContainer.scrollTop = this.scrollPositions[this.activeTab]
        this.scrollContainer.scrollTo({ top: this.scrollPositions[this.activeTab], behavior: 'smooth' })
      })
    }
  }
})
