<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-18 19:25:11
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-22 03:10:49
 * @Description: File description
-->

<template>
  <main v-gradient class="home-view" :style="{ 'padding-top': `${navBarHeight + 10}px` }">
    <NavBar class="nav-bar" />
    <!-- @loadData="loadDataByPage"  -->
    <!-- 右上角相册简介 三种 -->
    <!-- 打开总览相册 -->
    <p
      class="album-introduction"
      v-if="imageStore.isOverviewAlbum && curAlbumData.length"
      v-html="$t('photoAlbum.introduction1', { count: imageStore.allPhotosTotal })"
    ></p>
    <!-- 打开年/月相册 -->
    <p
      class="album-introduction"
      v-else-if="imageStore.isCertainAlbum && isAlbumWithTimeRecord && curAlbumData.length"
      v-html="$t('photoAlbum.introduction2', { dateFormat: datePartOfAlbumIntro, count: imageStore.certainAlbumTotal })"
    ></p>
    <!-- 打开【其它】相册 -->
    <p
      class="album-introduction"
      v-else-if="imageStore.isCertainAlbum && !isAlbumWithTimeRecord && curAlbumData.length"
      v-html="$t('photoAlbum.introduction3', { count: imageStore.certainAlbumPhotos.length })"
    ></p>
    <!-- 返回箭头（从具体相册返回其上层） -->
    <i class="back-arrow" v-show="imageStore.isCertainAlbum" @click="imageStore.closeCertainAlbum"></i>
    <KeepAlive>
      <component :is="currentComponent" :key="componentId" v-bind="componentProps" @loadData="loadDataByPage" @openCertainAlbum="openCertainAlbum" />
    </KeepAlive>
    <!-- <CertainAlbum
      v-show="imageStore.isCertainAlbum"
      :images="imageStore.certainAlbumPhotos"
      :isLoading="isCertainAlbumLoading"
      @loadData="loadDataByPage"
      @openCertainAlbum="openCertainMonthAlbum"
    /> -->
  </main>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import NavBar from '../components/NavBar.vue'
import OverviewAlbum from '../components/PhotoAlbum.vue'
import CertainAlbum from '../components/PhotoAlbum.vue'
import YearGroup from '../components/PhotoGroup.vue'
import MonthGroup from '../components/PhotoGroup.vue'
import { getAllImagesByPage, getCertainTimeRangePicsByPage, getImagesGroupedByYearByPage, getImagesGroupedByMonthByPage } from '@/http/api.js'
import { useImageStore } from '@/stores/imageStore'
import { v4 as uuidv4 } from 'uuid'
import { BY_MONTH, BY_YEAR, BY_OTHER } from '@/constants/constant'
import { DateTime } from 'luxon'

const COMPONENT_OVERVIEW_UUID = uuidv4()
const COMPONENT_CERTAIN_UUID = uuidv4()
const COMPONENT_YEAR_UUID = uuidv4()
const COMPONENT_MONTH_UUID = uuidv4()

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

const curAlbumData = computed(() => {
  if (imageStore.isOverviewAlbum) {
    return imageStore.allPhotos
  } else if (imageStore.isCertainAlbum) {
    return imageStore.certainAlbumPhotos
  }
})

// 打开特定相册 某年/某月/unkonown
let certainImagesQueryData = { pageSize: 20, pageNo: 0, creationDate: null, dataRange: '' }
let isAlbumWithTimeRecord = ref(false)
const openCertainAlbum = (paramObject, albumType) => {
  const { creationDate } = paramObject
  certainImagesQueryData.pageNo = 0
  certainImagesQueryData.pageSize = 20
  certainImagesQueryData.creationDate = creationDate
  if (albumType === BY_OTHER) {
    isAlbumWithTimeRecord.value = false
    certainImagesQueryData.dataRange = ''
  } else {
    if (albumType === BY_YEAR) {
      certainImagesQueryData.dataRange = 'year'
    } else if (albumType === BY_MONTH) {
      certainImagesQueryData.dataRange = 'month'
    }
    isAlbumWithTimeRecord.value = true
  }
  isCertainAlbumLoading.value = true
  //记录当前点击图片的时间戳（也可能为空值）
  // 更改switch按钮样式 聚焦至 月份 按钮 并进行相关逻辑操作
  if (imageStore.isOverviewAlbum || (imageStore.isYearCatalogCertainAlbum && BY_MONTH)) {
    imageStore.tabSwitch(BY_MONTH)
  }
  imageStore.openCertainAlbum()
}

//分页获取具体某个月的图片
let isCertainAlbumLoading = ref(true)
const loadCertainTimeRangeImagesByPage = () => {
  console.log('具体某个月回调了')
  if (certainImagesQueryData.pageNo === 0 || imageStore.certainAlbumPhotos.length < imageStore.certainAlbumTotal) {
    certainImagesQueryData.pageNo++
    getCertainTimeRangePicsByPage(certainImagesQueryData).then(({ data }) => {
      console.log('获取到的某个具体月份图片数据', data)
      imageStore.updateCertainAlbumPhotos(data)
      if (imageStore.certainAlbumPhotos.length >= imageStore.certainAlbumTotal) {
        isCertainAlbumLoading.value = false
      }
    })
  } else {
    isCertainAlbumLoading.value = false
  }
}

const datePartOfAlbumIntro = computed(() => {
  let dateFormatEn = ''
  let dateFormatZh = ''
  if (imageStore.isYearCatalogCertainAlbum) {
    const date = DateTime.fromMillis(+imageStore.certainAlbumPhotos[0].creationDate)
    // 已打开按年分组的具体某一相册
    dateFormatEn = date.year // YYYY
    dateFormatZh = `${date.year}年`
  } else if (imageStore.isMonthCatalogCertainAlbum) {
    const date = DateTime.fromMillis(+imageStore.certainAlbumPhotos[0].creationDate)
    // 按月
    dateFormatEn = `${date.year}-${date.toFormat('MM')}` //YYYY-MM
    dateFormatZh = `${date.year}年${date.toFormat('M')}月`
  }
  return window.$currentLocale === 'en' ? dateFormatEn : dateFormatZh
})

//分页获取按年分组的组数据
let isImagesGroupedByYearLoading = ref(true)
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
          isImagesGroupedByYearLoading.value = false
        }
      })
      .catch((err) => {
        console.log('获取数据出错')
        isImagesGroupedByYearLoading.value = false
      })
  } else {
    isImagesGroupedByYearLoading.value = false
  }
}

//分页获取按月分组的组数据
let isImagesGroupedByMonthLoading = ref(true)
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
          isImagesGroupedByMonthLoading.value = false
        }
      })
      .catch((err) => {
        console.log('获取数据出错')
        isImagesGroupedByMonthLoading.value = false
      })
  } else {
    isImagesGroupedByMonthLoading.value = false
  }
}

//获取数据
const loadDataByPage = () => {
  if (imageStore.isOverviewAlbum) {
    loadAllPhotosByPage()
  } else if (imageStore.isCertainAlbum) {
    loadCertainTimeRangeImagesByPage()
  } else if (imageStore.isYearCatalog) {
    loadImagesGroupByYearPage()
  } else if (imageStore.isMonthCatalog) {
    loadImagesGroupByMonthPage()
  }
}

onMounted(() => {
  setPhotoAlbumPaddingTop()
})

// 要处理一下
// const coverTitleFormatText = computed(() => {
// return window.$currentLocale === 'en' ? imageStore.groupAlbumCoverTitle : setZhFormat(imageStore.groupAlbumCoverTitle)
// })

const loadingText = '请稍候，正在努力加载中......'
const noMoreText = '没有更多照片咯～'
const componentProps = computed(() => {
  if (imageStore.isOverviewAlbum) {
    return { images: imageStore.allPhotos, isLoading: isOverviewLoading.value, loadingText, noMoreText }
  } else if (imageStore.isCertainAlbum) {
    return { images: imageStore.certainAlbumPhotos, isLoading: isCertainAlbumLoading.value, loadingText, noMoreText }
  } else if (imageStore.isYearCatalog) {
    return { groupedCatalog: imageStore.groupByYearCatalog, isLoading: isImagesGroupedByYearLoading.value, loadingText, noMoreText }
  } else if (imageStore.isMonthCatalog) {
    return { groupedCatalog: imageStore.groupByMonthCatalog, isLoading: isImagesGroupedByMonthLoading.value, loadingText, noMoreText }
  }
})

const componentId = computed(() => {
  if (imageStore.isOverviewAlbum) {
    return COMPONENT_OVERVIEW_UUID
  } else if (imageStore.isCertainAlbum) {
    return COMPONENT_CERTAIN_UUID
  } else if (imageStore.isYearCatalog) {
    return COMPONENT_YEAR_UUID
  } else if (imageStore.isMonthCatalog) {
    return COMPONENT_MONTH_UUID
  }
})

const currentComponent = computed(() => {
  if (imageStore.isOverviewAlbum) {
    return OverviewAlbum
  } else if (imageStore.isCertainAlbum) {
    return CertainAlbum
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
