<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-18 19:25:11
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-22 16:20:04
 * @Description: File description
-->

<template>
  <main v-gradient class="home-view" :style="{ 'padding-top': `${navBarHeight + 10}px` }">
    <NavBar class="nav-bar" />
    <!-- 右上角相册简介 三种 -->
    <!-- 打开总览相册 -->
    <p
      class="album-introduction"
      v-if="imageStore.isOverviewAlbum && imageStore.allPhotos.length"
      v-html="$t('photoAlbum.introduction1', { count: imageStore.allPhotosTotal })"
    ></p>
    <!-- 打开年/月相册 -->
    <p
      class="album-introduction"
      v-else-if="isCertainAlbum && isAlbumWithTimeRecord && certainAlbumPhotos.length"
      v-html="$t('photoAlbum.introduction2', { dateFormat: datePartOfAlbumIntro, count: certainAlbumTotal })"
    ></p>
    <!-- 打开【其它】相册 -->
    <p
      class="album-introduction"
      v-else-if="isCertainAlbum && !isAlbumWithTimeRecord && certainAlbumPhotos.length"
      v-html="
        $t('photoAlbum.introduction3', {
          count: certainAlbumPhotos.length
        })
      "
    ></p>
    <!-- 返回箭头（从具体相册返回其上层） -->
    <i class="back-arrow" v-show="isCertainAlbum" @click="imageStore.backToCatalog"></i>
    <KeepAlive>
      <component :is="currentComponent" :key="componentId" v-bind="componentProps" @loadData="loadDataByPage" @openCertainAlbum="openCertainAlbum" />
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
import { BY_MONTH, BY_YEAR, BY_OTHER } from '@/constants/constant'
import { DateTime } from 'luxon'

const COMPONENT_OVERVIEW_UUID = uuidv4()
const COMPONENT_CERTAIN_YEAR_UUID = uuidv4()
const COMPONENT_CERTAIN_MONTH_UUID = uuidv4()
const COMPONENT_YEAR_CATALOG_UUID = uuidv4()
const COMPONENT_MONTH_CATALOG_UUID = uuidv4()

//获取store的实例
const imageStore = useImageStore()

//分页获取总览图片
let isOverviewLoading = ref(true)
let allImagesQueryData = ref({ pageSize: 20, pageNo: 0 })
const loadAllPhotosByPage = () => {
  console.log('总览回调了')
  if (allImagesQueryData.value.pageNo === 0 || imageStore.allPhotos.length < imageStore.allPhotosTotal) {
    allImagesQueryData.value.pageNo++
    getAllImagesByPage(allImagesQueryData.value).then(({ data }) => {
      console.log('获取到的总览图片分页数据', data)
      imageStore.updateAllPhotos(data)
      if (imageStore.allPhotos.length >= imageStore.allPhotosTotal) {
        isOverviewLoading.value = false
      }
    })
  } else {
    isOverviewLoading.value = false
  }
}

// 打开具体相册
const openCertainAlbum = (paramObject, albumType) => {
  if (imageStore.isOverviewAlbum || imageStore.isCertainYearAlbum || imageStore.isMonthCatalog) {
    openCertainMonthAlbum(paramObject, albumType)
  } else if (imageStore.isYearCatalog) {
    openCertainYearAlbum(paramObject, albumType)
  }
}

// 打开特定相册 某年/unkonown
let certainYearImagesQueryData = { pageSize: 20, pageNo: 0, creationDate: null, dataRange: '' }
let isYearAlbumWithTimeRecord = ref(false)
const openCertainYearAlbum = (paramObject, albumType) => {
  const { creationDate } = paramObject
  certainYearImagesQueryData.pageNo = 0
  certainYearImagesQueryData.pageSize = 20
  certainYearImagesQueryData.creationDate = creationDate
  if (albumType === BY_OTHER) {
    isYearAlbumWithTimeRecord.value = false
    certainYearImagesQueryData.dataRange = ''
  } else if (albumType === BY_YEAR) {
    isYearAlbumWithTimeRecord.value = true
    certainYearImagesQueryData.dataRange = 'year'
  }
  isCertainYearAlbumLoading.value = true
  imageStore.openCertainYearAlbum()
}

// 打开特定相册 某月/unkonown
let certainMonthImagesQueryData = { pageSize: 20, pageNo: 0, creationDate: null, dataRange: '' }
let isMonthAlbumWithTimeRecord = ref(false)
const openCertainMonthAlbum = (paramObject, albumType) => {
  const { creationDate } = paramObject
  certainMonthImagesQueryData.pageNo = 0
  certainMonthImagesQueryData.pageSize = 20
  certainMonthImagesQueryData.creationDate = creationDate
  if (albumType === BY_OTHER) {
    isMonthAlbumWithTimeRecord.value = false
    certainMonthImagesQueryData.dataRange = ''
  } else {
    if (albumType === BY_YEAR) {
      certainMonthImagesQueryData.dataRange = 'year'
    } else if (albumType === BY_MONTH) {
      certainMonthImagesQueryData.dataRange = 'month'
    }
    isMonthAlbumWithTimeRecord.value = true
  }
  isCertainMonthAlbumLoading.value = true
  // 更改switch按钮样式 聚焦至 月份 按钮 并进行相关逻辑操作
  if (imageStore.isOverviewAlbum || imageStore.isCertainYearAlbum) {
    imageStore.preconditionAndTabSwitch(BY_MONTH)
  }
  imageStore.openCertainMonthAlbum()
}

let isAlbumWithTimeRecord = computed(() => {
  if (imageStore.isCertainYearAlbum) {
    return isYearAlbumWithTimeRecord.value
  } else if (imageStore.isCertainMonthAlbum) {
    return isMonthAlbumWithTimeRecord.value
  }
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

//分页获取具体某年时间范围的图片
let isCertainYearAlbumLoading = ref(true)
const loadCertainYearRangeImagesByPage = () => {
  if (certainYearImagesQueryData.pageNo === 0 || imageStore.certainYearAlbumPhotos.length < imageStore.certainYearAlbumTotal) {
    certainYearImagesQueryData.pageNo++
    getCertainTimeRangePicsByPage(certainYearImagesQueryData).then(({ data }) => {
      console.log('获取到的某年范围图片数据', data)
      imageStore.updateCertainYearAlbumPhotos(data)
      if (imageStore.certainYearAlbumPhotos.length >= imageStore.certainYearAlbumTotal) {
        isCertainYearAlbumLoading.value = false
      }
    })
  } else {
    isCertainYearAlbumLoading.value = false
  }
}

//分页获取具体某个月时间范围的图片
let isCertainMonthAlbumLoading = ref(true)
const loadCertainMonthRangeImagesByPage = () => {
  if (certainMonthImagesQueryData.pageNo === 0 || imageStore.certainMonthAlbumPhotos.length < imageStore.certainMonthAlbumTotal) {
    certainMonthImagesQueryData.pageNo++
    getCertainTimeRangePicsByPage(certainMonthImagesQueryData).then(({ data }) => {
      console.log('获取到的某个具体时间范围图片数据', data)
      imageStore.updateCertainMonthAlbumPhotos(data)
      if (imageStore.certainMonthAlbumPhotos.length >= imageStore.certainMonthAlbumTotal) {
        isCertainMonthAlbumLoading.value = false
      }
    })
  } else {
    isCertainMonthAlbumLoading.value = false
  }
}

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

//分页获取按年分组的组数据
let isYearCatalogLoading = ref(true)
let imagesGroupedByYearQueryData = { pageSize: 20, pageNo: 0 }
const loadImagesGroupByYearPage = () => {
  console.log('按年份分组回调了')
  if (imagesGroupedByYearQueryData.pageNo === 0 || imageStore.groupByYearCatalog.length < imageStore.groupByYearCatalogTotal) {
    imagesGroupedByYearQueryData.pageNo++
    getImagesGroupedByYearByPage(imagesGroupedByYearQueryData)
      .then(({ data }) => {
        console.log('获取到图片按年份分组数据', data)
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

//分页获取按月分组的组数据
let isMonthCatalogLoading = ref(true)
let imagesGroupedByMonthQueryData = { pageSize: 20, pageNo: 0 }
const loadImagesGroupByMonthPage = () => {
  console.log('按月份分组回调了')
  if (imagesGroupedByMonthQueryData.pageNo === 0 || imageStore.groupByMonthCatalog.length < imageStore.groupByMonthCatalogTotal) {
    imagesGroupedByMonthQueryData.pageNo++
    getImagesGroupedByMonthByPage(imagesGroupedByMonthQueryData)
      .then(({ data }) => {
        console.log('获取到图片按年份分组数据', data)
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

//获取数据
const loadDataByPage = () => {
  if (imageStore.isOverviewAlbum) {
    loadAllPhotosByPage()
  } else if (imageStore.isCertainYearAlbum) {
    loadCertainYearRangeImagesByPage()
  } else if (imageStore.isCertainMonthAlbum) {
    loadCertainMonthRangeImagesByPage()
  } else if (imageStore.isYearCatalog) {
    loadImagesGroupByYearPage()
  } else if (imageStore.isMonthCatalog) {
    loadImagesGroupByMonthPage()
  }
}

onMounted(() => {
  setPhotoAlbumPaddingTop()
})

const loadingText = '请稍候，正在努力加载中......'
const noMoreText = '没有更多照片咯～'
const componentProps = computed(() => {
  if (imageStore.isOverviewAlbum) {
    return { images: imageStore.allPhotos, isLoading: isOverviewLoading.value, loadingText, noMoreText }
  } else if (imageStore.isCertainYearAlbum) {
    return { images: imageStore.certainYearAlbumPhotos, isLoading: isCertainYearAlbumLoading.value, loadingText, noMoreText }
  } else if (imageStore.isCertainMonthAlbum) {
    return { images: imageStore.certainMonthAlbumPhotos, isLoading: isCertainMonthAlbumLoading.value, loadingText, noMoreText }
  } else if (imageStore.isYearCatalog) {
    return { groupedCatalog: imageStore.groupByYearCatalog, isLoading: isYearCatalogLoading.value, loadingText, noMoreText }
  } else if (imageStore.isMonthCatalog) {
    return { groupedCatalog: imageStore.groupByMonthCatalog, isLoading: isMonthCatalogLoading.value, loadingText, noMoreText }
  }
})

const isCertainAlbum = computed(() => {
  return imageStore.isCertainYearAlbum || imageStore.isCertainMonthAlbum
})

const componentId = computed(() => {
  if (imageStore.isOverviewAlbum) {
    return COMPONENT_OVERVIEW_UUID
  } else if (imageStore.isCertainYearAlbum) {
    return COMPONENT_CERTAIN_YEAR_UUID
  } else if (imageStore.isCertainMonthAlbum) {
    return COMPONENT_CERTAIN_MONTH_UUID
  } else if (imageStore.isYearCatalog) {
    return COMPONENT_YEAR_CATALOG_UUID
  } else if (imageStore.isMonthCatalog) {
    return COMPONENT_MONTH_CATALOG_UUID
  }
})

const currentComponent = computed(() => {
  if (imageStore.isOverviewAlbum) {
    return OverviewAlbum
  } else if (imageStore.isCertainYearAlbum) {
    return CertainYearAlbum
  } else if (imageStore.isCertainMonthAlbum) {
    return CertainMonthAlbum
  } else if (imageStore.isYearCatalog) {
    return YearGroup
  } else if (imageStore.isMonthCatalog) {
    return MonthGroup
  }
})

let navBarHeight = ref(0)
function setPhotoAlbumPaddingTop() {
  setTimeout(() => {
    navBarHeight.value = document.querySelector('.nav-bar').offsetHeight
  }, 200)
}
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
