<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-18 19:25:11
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-20 02:20:46
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
      v-else-if="imageStore.isCertainAlbumWithTimeRecords && imageStore.certainMonthPhotos.length"
      v-html="$t('photoAlbum.introduction2', { dateFormat: imageStore.dateFormatText, count: imageStore.certainMonthTotal })"
    ></p>
    <!-- 打开【其它】相册 -->
    <p
      class="album-introduction"
      v-else-if="imageStore.isCertainAlbumNoTimeRecords && imageStore.certainMonthPhotos.length"
      v-html="$t('photoAlbum.introduction3', { count: imageStore.certainMonthPhotos.length })"
    ></p>
    <!-- 返回箭头（从具体相册返回其上层） -->
    <i class="back-arrow" v-show="imageStore.isCertainAlbum" @click="imageStore.closeCertainAlbum"></i>
    <KeepAlive>
      <component
        :is="currentComponent"
        :key="componentId"
        v-bind="componentProps"
        @loadData="loadDataByPage"
        @openCertainAlbum="openCertainMonthAlbum"
      />
    </KeepAlive>
    <!-- <CertainAlbum
      v-show="imageStore.isCertainAlbum"
      :images="imageStore.certainMonthPhotos"
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
import { getAllImagesByPage, getCertainMonthImagesByPage } from '@/http/api.js'
import { useImageStore } from '@/stores/imageStore'
import { v4 as uuidv4 } from 'uuid'
import { BY_MONTH } from '@/constants/constant'

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

//分页获取具体某个月的图片
const monthTimestamp = computed(() => {
  return imageStore.curCertainMonthTimestamp
})
let isCertainAlbumLoading = ref(true)
let certainMonthImagesQueryData = ref({ pageSize: 20, pageNo: 0, month: monthTimestamp })
const loadMonthPhotosByPage = () => {
  console.log('具体某个月回调了')
  if (certainMonthImagesQueryData.value.pageNo === 0 || imageStore.certainMonthPhotos.length < imageStore.certainMonthTotal) {
    certainMonthImagesQueryData.value.pageNo++
    // certainMonthImagesQueryData.value.month = imageStore.curCertainMonthTimestamp
    getCertainMonthImagesByPage(certainMonthImagesQueryData.value).then(({ data }) => {
      console.log('获取到的某个具体月份图片数据', data)
      imageStore.updateCertainMonthPhotos(data)
      if (imageStore.certainMonthPhotos.length >= imageStore.certainMonthTotal) {
        isCertainAlbumLoading.value = false
      }
    })
  } else {
    isCertainAlbumLoading.value = false
  }
}

// 打开单个月份相册
const openCertainMonthAlbum = (imageObject) => {
  isCertainAlbumLoading.value = true
  certainMonthImagesQueryData.value.pageNo = 0
  //记录当前点击图片的时间戳（也可能为空值）
  imageStore.updateCertainMonthTimestamp(+imageObject.creationDate)
  // 更改switch按钮样式 聚焦至 月份 按钮 并进行相关逻辑操作
  imageStore.tabSwitch(BY_MONTH)
  imageStore.openCertainAlbum(+imageObject.creationDate)
}

//获取数据
const loadDataByPage = () => {
  if (imageStore.isOverviewAlbum) {
    loadAllPhotosByPage()
  } else if (imageStore.isCertainAlbum) {
    loadMonthPhotosByPage()
  } else if (imageStore.isYearGroupedAlbum) {
    return YearGroup
  } else if (imageStore.isMonthGroupedAlbum) {
    return MonthGroup
  }
}

onMounted(() => {
  setPhotoAlbumPaddingTop()
})

const currentComponent = computed(() => {
  if (imageStore.isOverviewAlbum) {
    return OverviewAlbum
  } else if (imageStore.isCertainAlbum) {
    return CertainAlbum
  } else if (imageStore.isYearGroupedAlbum) {
    return YearGroup
  } else if (imageStore.isMonthGroupedAlbum) {
    return MonthGroup
  }
})

const loadingText = '请稍候，正在努力加载中......'
const noMoreText = '没有更多照片咯～'
const componentProps = computed(() => {
  if (imageStore.isOverviewAlbum) {
    return { images: imageStore.allPhotos, isLoading: isOverviewLoading.value, loadingText, noMoreText }
  } else if (imageStore.isCertainAlbum) {
    return { images: imageStore.certainMonthPhotos, isLoading: isCertainAlbumLoading.value, loadingText, noMoreText }
  } else if (imageStore.isYearGroupedAlbum) {
    return { groupedPhotos: imageStore.photoOfYear }
  } else if (imageStore.isMonthGroupedAlbum) {
    return { groupedPhotos: imageStore.photoOfMonth }
  }
})

const isShowAlbumIntro = computed(() => {
  return imageStore.isOverviewAlbum || imageStore.isCertainAlbum
})

const componentId = computed(() => {
  if (imageStore.isOverviewAlbum) {
    return COMPONENT_OVERVIEW_UUID
  } else if (imageStore.isCertainAlbum) {
    return COMPONENT_CERTAIN_UUID
  } else if (imageStore.isYearGroupedAlbum) {
    return COMPONENT_YEAR_UUID
  } else if (imageStore.isMonthGroupedAlbum) {
    return COMPONENT_MONTH_UUID
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
