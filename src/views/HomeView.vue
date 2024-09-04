<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-18 19:25:11
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-05 01:21:25
 * @Description: File description
-->
<script setup>
import { onMounted, ref, computed } from 'vue'
import vGradient from '@/directives/vBottomGradientLayer.js'
import NavBar from '../components/NavBar.vue'
import OverviewAlbum from '../components/PhotoAlbum.vue'
import CertainAlbum from '../components/PhotoAlbum.vue'
import YearGroup from '../components/PhotoGroup.vue'
import MonthGroup from '../components/PhotoGroup.vue'
import { getImages } from '@/http/api.js'
import { useImageStore } from '@/stores/imageStore'
import { v4 as uuidv4 } from 'uuid'

const COMPONENT_OVERVIEW_UUID = uuidv4()
const COMPONENT_CERTAIN_UUID = uuidv4()
const COMPONENT_YEAR_UUID = uuidv4()
const COMPONENT_MONTH_UUID = uuidv4()

//获取store的实例
const imageStore = useImageStore()

getImages().then(({ data }) => {
  console.log('获取到的图片数据', data)
  imageStore.initPhotos(data)
})

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

const componentProps = computed(() => {
  if (imageStore.isOverviewAlbum) {
    return { images: imageStore.allPhotos }
  } else if (imageStore.isCertainAlbum) {
    return { images: imageStore.albumPhotos }
  } else if (imageStore.isYearGroupedAlbum) {
    return { groupedPhotos: imageStore.photoOfYear }
  } else if (imageStore.isMonthGroupedAlbum) {
    return { groupedPhotos: imageStore.photoOfMonth }
  }
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

<template>
  <main class="home-view" :style="{ 'padding-top': `${navBarHeight + 10}px` }">
    <NavBar class="nav-bar" />
    <KeepAlive>
      <component :is="currentComponent" :key="componentId" v-bind="componentProps" />
    </KeepAlive>
    <div v-gradient></div>
  </main>
</template>

<style lang="less">
@import '../assets/css/global.less';
.home-view {
  width: 100%;
  height: 100%;
  .photo-classification {
    padding-top: 110px;
  }
}
</style>
