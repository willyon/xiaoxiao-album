<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-18 19:25:11
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-03 01:51:31
 * @Description: File description
-->
<script setup>
import { onMounted, ref } from 'vue'
import vGradient from '@/directives/vBottomGradientLayer.js'
import NavBar from '../components/NavBar.vue'
import OverviewAlbum from '../components/PhotoAlbum.vue'
import CertainAlbum from '../components/PhotoAlbum.vue'
import PhotoGroup from '../components/PhotoGroup.vue'
import { getImages } from '@/http/api.js'
import { useImageStore } from '@/stores/imageStore'

//获取store的实例
const imageStore = useImageStore()

getImages().then(({ data }) => {
  console.log('获取到的图片数据', data)
  imageStore.initPhotos(data)
})

onMounted(() => {
  setPhotoAlbumPaddingTop()
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
    <OverviewAlbum :images="imageStore.allPhotos" v-show="imageStore.isOverviewAlbum" />
    <PhotoGroup v-show="imageStore.isGroupedAlbum" />
    <CertainAlbum :images="imageStore.albumPhotos" v-show="imageStore.isCertainAlbum" />
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
