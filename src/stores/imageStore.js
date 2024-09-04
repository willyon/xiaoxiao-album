/*
 * @Author: zhangshouchang
 * @Date: 2024-08-11 15:07:46
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-05 01:42:11
 * @Description: File description
 */
// import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { DEAFULT_TIME_TAB, BY_YEAR, BY_MONTH, BY_OTHER } from '@/constants/constant'
import { setZhFormat } from '@/utils/dateStringHandler'
import { groupedByYear, groupedByMonth } from '@/utils/photosGroupedByTime'
import { nextTick } from 'vue'

export const useImageStore = defineStore('imageStore', {
  state: () => ({
    //default value
    activeTab: DEAFULT_TIME_TAB,
    // oepn certain album, not overview album
    isOpenCertainAlbum: false,
    // all photos data
    allPhotos: [],
    // current display album photos data
    albumPhotos: [],
    // certain album desc like 2024-02-03 or 2020
    albumDate: '',
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
    // groupedPhotos: (state) => {
    //   if (state.activeTab === BY_YEAR) {
    //     return state.photoOfYear
    //   } else if (state.activeTab === BY_MONTH) {
    //     return state.photoOfMonth
    //   }
    // },
    isYearGroupedAlbum: (state) => {
      return BY_YEAR === state.activeTab && !state.isOpenCertainAlbum
    },
    isMonthGroupedAlbum: (state) => {
      return BY_MONTH === state.activeTab && !state.isOpenCertainAlbum
    },
    isOverviewAlbum: (state) => {
      return DEAFULT_TIME_TAB === state.activeTab
    },
    isCertainAlbum: (state) => {
      return state.isOpenCertainAlbum
    },
    isCertainAlbumWithTimeRecords: (state) => {
      // return state.isCertainAlbum && state.isAlbumWithTimeRecords
      return state.isCertainAlbum && BY_OTHER !== state.albumDate
    },
    isCertainAlbumNoTimeRecords: (state) => {
      // return state.isCertainAlbum && !state.isAlbumWithTimeRecords
      return state.isCertainAlbum && BY_OTHER === state.albumDate
    },
    // isAlbumWithTimeRecords: (state) => {
    //   return state.albumDate && ![BY_OTHER].includes(state.albumDate)
    // },
    // 年/月相册 时间描述 格式化
    dateFormatText: (state) => {
      return window.$currentLocale === 'en' ? state.albumDate : setZhFormat(state.albumDate)
    }
  },

  actions: {
    // 标签切换
    tabSwitch(curType) {
      // 点击当前活跃标签且该标签下展示的内容为具体相册
      if (this.isOpenCertainAlbum) {
        this.closeCertainAlbum()
      }
      if (curType !== this.activeTab) {
        //记录当前组件的滚动位置
        this._saveScrollPosition()
        this.activeTab = curType
        // 回复目标组件的滚动位置
        this._restoreScrollPositon()
      }
    },
    initPhotos(photos) {
      this.updateAllPhotos(photos)
      this.updateAlbumData(photos)
    },
    updateAllPhotos(photos) {
      this.allPhotos.splice(0)
      this.allPhotos.push(...photos)
    },
    updateAlbumData(photos) {
      this.albumPhotos.splice(0)
      this.albumPhotos.push(...photos)
    },
    // 关闭具体相册并重新加载滚动条位置
    closeCertainAlbum() {
      this.isOpenCertainAlbum = false
      this._restoreScrollPositon()
    },
    openCertainAlbum({ photos, albumDate }) {
      if (photos) {
        this.updateAlbumData(photos)
      }
      if (albumDate) {
        this.updateAlbumDesc(albumDate)
      }
      this._saveScrollPosition()
      this.isOpenCertainAlbum = true
      this._initScrollTop()
    },
    updateAlbumDesc(albumDate) {
      this.albumDate = albumDate
    },
    _saveScrollPosition() {
      if (this.scrollContainer) {
        this.scrollPositions[this.activeTab] = this.scrollContainer.scrollTop || 0
      }
    },
    _initScrollTop() {
      this.scrollContainer.scrollTop = 0
    },
    _restoreScrollPositon() {
      nextTick(() => {
        // 两种写法都行
        // this.scrollContainer.scrollTop = this.scrollPositions[this.activeTab]
        this.scrollContainer.scrollTo({ top: this.scrollPositions[this.activeTab], behavior: 'smooth' })
      })
    }
  }
})
