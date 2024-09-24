<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-18 19:25:11
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-24 23:54:16
 * @Description: File description
-->

<template>
  <main v-gradient class="home-view" :style="{ 'padding-top': `${navBarHeight + 10}px` }">
    <NavBar class="nav-bar" />
    <!-- 右上角相册简介-->
    <!-- 总览相册 -->
    <p
      class="album-introduction"
      v-if="imageStore.isOverviewAlbum && imageStore.allPhotos.length"
      v-html="$t('photoAlbum.introduction1', { count: imageStore.allPhotosTotal })"
    ></p>
    <!-- 具体相册 【某年】 或 【某月】 或 无时间记录的 【其它】 -->
    <p
      class="album-introduction"
      v-else-if="isCertainAlbum && certainAlbumPhotos.length"
      v-html="
        isAlbumWithTimeRecord
          ? $t('photoAlbum.introduction2', { dateFormat: datePartOfAlbumIntro, count: certainAlbumTotal })
          : $t('photoAlbum.introduction3', { count: certainAlbumPhotos.length })
      "
    ></p>
    <!-- 返回箭头（从具体相册返回其上层） -->
    <i class="back-arrow" v-show="isCertainAlbum" @click="imageStore.backToCatalog"></i>
    <KeepAlive>
      <component
        :is="dataMatch.component"
        :key="dataMatch.uuid"
        v-bind="dataMatch.componentProps"
        @loadData="dataMatch.loadData"
        @openCertainAlbum="openCertainAlbum"
      />
    </KeepAlive>
  </main>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import NavBar from '../components/NavBar.vue'
import OverviewAlbum from '../components/PhotoAlbum.vue'
import CertainYearAlbum from '../components/PhotoAlbum.vue'
import CertainMonthAlbum from '../components/PhotoAlbum.vue'
import YearGroup from '../components/PhotoGroup.vue'
import MonthGroup from '../components/PhotoGroup.vue'
import { getAllImagesByPage, getCertainTimeRangePicsByPage, getImagesGroupedByYearByPage, getImagesGroupedByMonthByPage } from '@/http/api.js'
import { useImageStore } from '@/stores/imageStore'
import { v4 as uuidv4 } from 'uuid'
import { MONTH_CATALOG } from '@/constants/constant'
import { DateTime } from 'luxon'

//获取store的实例
const imageStore = useImageStore()

const COMPONENT_OVERVIEW_UUID = uuidv4()
const COMPONENT_CERTAIN_YEAR_UUID = uuidv4()
const COMPONENT_CERTAIN_MONTH_UUID = uuidv4()
const COMPONENT_YEAR_CATALOG_UUID = uuidv4()
const COMPONENT_MONTH_CATALOG_UUID = uuidv4()

let isOverviewLoading = ref(true)
let isCertainYearAlbumLoading = ref(true)
let isCertainMonthAlbumLoading = ref(true)
let isYearCatalogLoading = ref(true)
let isMonthCatalogLoading = ref(true)

const loadingText = '请稍候，正在努力加载中......'
const noMoreText = '没有更多照片咯～'

onMounted(() => {
  setPhotoAlbumPaddingTop()
})

// 设置相册padding-top
let navBarHeight = ref(0)
function setPhotoAlbumPaddingTop() {
  setTimeout(() => {
    navBarHeight.value = document.querySelector('.nav-bar').offsetHeight
  }, 200)
}

const actionMap = [
  {
    condition: () => imageStore.isOverviewAlbum,
    loadData: loadAllPhotosByPage,
    uuid: COMPONENT_OVERVIEW_UUID,
    component: OverviewAlbum,
    componentProps: { images: imageStore.allPhotos, isLoading: isOverviewLoading, loadingText, noMoreText }
  },
  {
    condition: () => imageStore.isCertainYearAlbum,
    loadData: loadCertainYearRangeImagesByPage,
    uuid: COMPONENT_CERTAIN_YEAR_UUID,
    component: CertainYearAlbum,
    componentProps: { images: imageStore.certainYearAlbumPhotos, isLoading: isCertainYearAlbumLoading, loadingText, noMoreText }
  },
  {
    condition: () => imageStore.isCertainMonthAlbum,
    loadData: loadCertainMonthRangeImagesByPage,
    uuid: COMPONENT_CERTAIN_MONTH_UUID,
    component: CertainMonthAlbum,
    componentProps: { images: imageStore.certainMonthAlbumPhotos, isLoading: isCertainMonthAlbumLoading, loadingText, noMoreText }
  },
  {
    condition: () => imageStore.isYearCatalog,
    loadData: loadImagesGroupByYearPage,
    uuid: COMPONENT_YEAR_CATALOG_UUID,
    component: YearGroup,
    componentProps: { groupedCatalog: imageStore.groupByYearCatalog, isLoading: isYearCatalogLoading, loadingText, noMoreText }
  },
  {
    condition: () => imageStore.isMonthCatalog,
    loadData: loadImagesGroupByMonthPage,
    uuid: COMPONENT_MONTH_CATALOG_UUID,
    component: MonthGroup,
    componentProps: { groupedCatalog: imageStore.groupByMonthCatalog, isLoading: isMonthCatalogLoading, loadingText, noMoreText }
  }
]

//分页获取全部图片
let allImagesQueryData = ref({ pageSize: 20, pageNo: 0 })
function loadAllPhotosByPage() {
  if (!isOverviewLoading.value) return
  if (allImagesQueryData.value.pageNo === 0 || imageStore.allPhotos.length < imageStore.allPhotosTotal) {
    allImagesQueryData.value.pageNo++
    getAllImagesByPage(allImagesQueryData.value)
      .then(({ data }) => {
        // console.log('获取到的总览图片分页数据', data)
        imageStore.updateAllPhotos(data)
        if (imageStore.allPhotos.length >= imageStore.allPhotosTotal) {
          isOverviewLoading.value = false
        }
      })
      .catch((err) => {
        console.log('获取数据出错')
        isOverviewLoading.value = false
      })
  } else {
    isOverviewLoading.value = false
  }
}

//分页获取具体某年全部图片
let certainYearImagesQueryData = { pageSize: 20, pageNo: 0, creationDate: null, dataRange: '' }
function loadCertainYearRangeImagesByPage() {
  if (!isCertainYearAlbumLoading.value) return
  if (certainYearImagesQueryData.pageNo === 0 || imageStore.certainYearAlbumPhotos.length < imageStore.certainYearAlbumTotal) {
    certainYearImagesQueryData.pageNo++
    getCertainTimeRangePicsByPage(certainYearImagesQueryData)
      .then(({ data }) => {
        // console.log('获取到的某年范围图片数据', data)
        imageStore.updateCertainYearAlbumPhotos(data)
        if (imageStore.certainYearAlbumPhotos.length >= imageStore.certainYearAlbumTotal) {
          isCertainYearAlbumLoading.value = false
        }
      })
      .catch((err) => {
        console.log('获取数据出错')
        isCertainYearAlbumLoading.value = false
      })
  } else {
    isCertainYearAlbumLoading.value = false
  }
}

//分页获取具体某月全部图片
let certainMonthImagesQueryData = { pageSize: 20, pageNo: 0, creationDate: null, dataRange: '' }
function loadCertainMonthRangeImagesByPage() {
  if (!isCertainMonthAlbumLoading.value) return
  if (certainMonthImagesQueryData.pageNo === 0 || imageStore.certainMonthAlbumPhotos.length < imageStore.certainMonthAlbumTotal) {
    certainMonthImagesQueryData.pageNo++
    getCertainTimeRangePicsByPage(certainMonthImagesQueryData)
      .then(({ data }) => {
        // console.log('获取到的某个具体时间范围图片数据', data)
        imageStore.updateCertainMonthAlbumPhotos(data)
        if (imageStore.certainMonthAlbumPhotos.length >= imageStore.certainMonthAlbumTotal) {
          isCertainMonthAlbumLoading.value = false
        }
      })
      .catch((err) => {
        console.log('获取数据出错')
        isCertainMonthAlbumLoading.value = false
      })
  } else {
    isCertainMonthAlbumLoading.value = false
  }
}

//分页获取按年份分组的目录数据
let imagesGroupedByYearQueryData = { pageSize: 20, pageNo: 0 }
function loadImagesGroupByYearPage() {
  if (!isYearCatalogLoading.value) return
  if (imagesGroupedByYearQueryData.pageNo === 0 || imageStore.groupByYearCatalog.length < imageStore.groupByYearCatalogTotal) {
    imagesGroupedByYearQueryData.pageNo++
    getImagesGroupedByYearByPage(imagesGroupedByYearQueryData)
      .then(({ data }) => {
        // console.log('获取到图片按年份分组数据', data)
        imageStore.updateGroupByYearCatalog(data)
        if (imageStore.groupByYearCatalog.length >= imageStore.groupByYearCatalogTotal) {
          isYearCatalogLoading.value = false
        }
      })
      .catch((err) => {
        console.log('获取数据出错')
        isYearCatalogLoading.value = false
      })
  } else {
    isYearCatalogLoading.value = false
  }
}

//分页获取按月份分组的目录数据
let imagesGroupedByMonthQueryData = { pageSize: 20, pageNo: 0 }
function loadImagesGroupByMonthPage() {
  if (!isMonthCatalogLoading.value) return
  if (imagesGroupedByMonthQueryData.pageNo === 0 || imageStore.groupByMonthCatalog.length < imageStore.groupByMonthCatalogTotal) {
    imagesGroupedByMonthQueryData.pageNo++
    getImagesGroupedByMonthByPage(imagesGroupedByMonthQueryData)
      .then(({ data }) => {
        // console.log('获取到图片按年份分组数据', data)
        imageStore.updateGroupByMonthCatalog(data)
        if (imageStore.groupByMonthCatalog.length >= imageStore.groupByMonthCatalogTotal) {
          isMonthCatalogLoading.value = false
        }
      })
      .catch((err) => {
        console.log('获取数据出错')
        isMonthCatalogLoading.value = false
      })
  } else {
    isMonthCatalogLoading.value = false
  }
}

const isOpenCertainMonthAlbum = computed(() => {
  return imageStore.isOverviewAlbum || imageStore.isCertainYearAlbum || imageStore.isMonthCatalog
})

const isOpenCertainYearAlbum = computed(() => {
  return imageStore.isYearCatalog
})

const isActiveTabNotMonthCatalog = computed(() => {
  return imageStore.isOverviewAlbum || imageStore.isCertainYearAlbum
})

// 打开具体相册
const openCertainAlbum = (paramObject, albumType = '') => {
  if (isOpenCertainYearAlbum.value) {
    // 从年份目录页点击 打开具体年份或unknown相册
    openCertainYearAlbum(paramObject, albumType)
  } else if (isOpenCertainMonthAlbum.value) {
    // 从总览相册页/具体某年相册页/月份目录页点击打开具体月份或unknown相册
    openCertainMonthAlbum(paramObject, albumType)
  }
}

// 打开具体某年或者unknown相册
let isYearAlbumWithTimeRecord = ref(false)
const openCertainYearAlbum = (paramObject, albumType) => {
  resetDataBeforeQuery(certainYearImagesQueryData, isYearAlbumWithTimeRecord, isCertainYearAlbumLoading, paramObject, albumType)
  imageStore.saveScrollPosition()
  imageStore.openNewCertainYearAlbum()
}

// 打开具体某月或者unknown相册
let isMonthAlbumWithTimeRecord = ref(false)
const openCertainMonthAlbum = (paramObject, albumType) => {
  resetDataBeforeQuery(certainMonthImagesQueryData, isMonthAlbumWithTimeRecord, isCertainMonthAlbumLoading, paramObject, albumType)
  // 更改switch按钮样式 聚焦至 【月份】 tab 并进行相关逻辑操作
  if (isActiveTabNotMonthCatalog.value) {
    // 从总览相册页或具体某年(或unknown)相册页点击打开具体月份或unknown相册 将activetab设置为月份目录页
    imageStore.tabSwitch(MONTH_CATALOG, false)
  } else {
    // 从月份目录页点击打开具体月份或unknown相册 保存当前页滚动条位置
    imageStore.saveScrollPosition()
  }
  imageStore.openNewCertainMonthAlbum()
}

function resetDataBeforeQuery(queryData, isAlbumTimeRecord, isAlbumLoading, paramObject, albumType) {
  const { creationDate } = paramObject
  queryData.pageNo = 0
  queryData.pageSize = 20
  queryData.creationDate = creationDate
  queryData.dataRange = albumType
  isAlbumTimeRecord.value = !!creationDate
  isAlbumLoading.value = true
}

//获取映射数据
const dataMatch = computed(() => {
  const match = actionMap.find((item) => item.condition())
  if (match) {
    return match
  }
})

let isAlbumWithTimeRecord = computed(() => {
  if (imageStore.isCertainYearAlbum) {
    return isYearAlbumWithTimeRecord.value
  } else if (imageStore.isCertainMonthAlbum) {
    return isMonthAlbumWithTimeRecord.value
  }
})

const isCertainAlbum = computed(() => {
  return imageStore.isCertainYearAlbum || imageStore.isCertainMonthAlbum
})

let certainAlbumPhotos = computed(() => {
  if (imageStore.isCertainYearAlbum) {
    return imageStore.certainYearAlbumPhotos
  } else if (imageStore.isCertainMonthAlbum) {
    return imageStore.certainMonthAlbumPhotos
  }
})

let certainAlbumTotal = computed(() => {
  if (imageStore.isCertainYearAlbum) {
    return imageStore.certainYearAlbumTotal
  } else if (imageStore.isCertainMonthAlbum) {
    return imageStore.certainMonthAlbumTotal
  }
})

const datePartOfAlbumIntro = computed(() => {
  let dateFormatEn = ''
  let dateFormatZh = ''
  if (imageStore.isCertainYearAlbum) {
    const date = DateTime.fromMillis(+certainAlbumPhotos.value[0].creationDate)
    // 已打开按年分组的具体某一相册
    dateFormatEn = date.year // YYYY
    dateFormatZh = `${date.year}年`
  } else if (imageStore.isCertainMonthAlbum) {
    const date = DateTime.fromMillis(+certainAlbumPhotos.value[0].creationDate)
    // 按月
    dateFormatEn = `${date.year}-${date.toFormat('MM')}` //YYYY-MM
    dateFormatZh = `${date.year}年${date.toFormat('M')}月`
  }
  return window.$currentLocale === 'en' ? dateFormatEn : dateFormatZh
})
</script>

<style lang="less">
@import '../assets/css/global.less';
.home-view {
  width: 100%;
  height: 100%;
  .album-introduction {
    position: fixed;
    right: 20px;
    top: 22px;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .back-arrow {
    display: inline-block;
    position: fixed;
    top: 97px;
    left: 11px;
    z-index: 1;
    cursor: pointer;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: url('@/assets/icons/back-arrow.png') center / 28px no-repeat; /* 默认图标路径 */
    &:hover {
      background-image: url('@/assets/icons/back-arrow-hover.png'); /* 悬停时的图标路径 */
      background-color: rgba(211, 211, 211, 0.5); /* 浅灰背景色 */
    }
  }
}
</style>
