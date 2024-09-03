/*
 * @Author: zhangshouchang
 * @Date: 2024-08-11 15:07:46
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-03 04:38:18
 * @Description: File description
 */
// import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { DEAFULT_TIME_TAB, BY_YEAR, BY_MONTH, BY_OTHER } from '@/constants/constant'
import { setZhFormat } from '@/utils/dateStringHandler'
import { groupedByYear, groupedByMonth } from '@/utils/photosGroupedByTime'

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
    albumDate: ''
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
    groupedPhotos: (state) => {
      if (state.activeTab === BY_YEAR) {
        return state.photoOfYear
      } else if (state.activeTab === BY_MONTH) {
        return state.photoOfMonth
      }
    },
    isOverviewAlbum: (state) => {
      return [DEAFULT_TIME_TAB].includes(state.activeTab)
    },
    isGroupedAlbum: (state) => {
      return [BY_YEAR, BY_MONTH].includes(state.activeTab) && !state.isOpenCertainAlbum
    },
    isCertainAlbumWithTimeRecords: (state) => {
      return state.isCertainAlbum && state.isAlbumWithTimeRecords
    },
    isCertainAlbumNoTimeRecords: (state) => {
      return state.isCertainAlbum && !state.isAlbumWithTimeRecords
    },
    isCertainAlbum: (state) => {
      return state.isOpenCertainAlbum
    },
    isAlbumWithTimeRecords: (state) => {
      return state.albumDate && ![BY_OTHER].includes(state.albumDate)
    },
    // 年/月相册 时间描述 格式化
    dateFormatText: (state) => {
      return window.$currentLocale === 'en' ? state.albumDate : setZhFormat(state.albumDate)
    }
  },

  actions: {
    tabSwitch(curType) {
      this.activeTab = curType
      this.closeCertainAlbum()
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
    closeCertainAlbum() {
      this.isOpenCertainAlbum = false
    },
    openCertainAlbum({ photos, albumDate }) {
      if (photos) {
        this.updateAlbumData(photos)
      }
      if (albumDate) {
        this.updateAlbumDesc(albumDate)
      }
      this.isOpenCertainAlbum = true
    },
    updateAlbumDesc(albumDate) {
      this.albumDate = albumDate
    }
  }
})
