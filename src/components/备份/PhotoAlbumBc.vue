<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-11 15:07:46
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-03 04:13:32
 * @Description: File description
-->

<template>
  <div class="photo-container">
    <div
      class="grid-item"
      :class="{ 'grid-l': index % 3 === 0, 'grid-m': index % 3 === 1, 'grid-s': index % 3 === 2 }"
      v-for="(image, index) in images"
      :key="index"
    >
      <!-- :preview-src-list="images"
        :close-on-press-escape="true"
        :preview-teleported="true"
        :min-scale="0.5"
        :max-scale="3" -->
      <el-image class="single-img" :src="image" @load="onImageLoad" :fit="imgFit" loading="lazy" @click="imgClick(image, $event)">
        <!-- 占位符 保持页面布局 -->
        <template #placeholder>
          <div class="image-slot" :style="{ 'background-color': itemBackgroundColor() }"></div>
        </template>
      </el-image>
    </div>
    <PhotoPreview @previewClose="isShowPreview = false" :isVisible="isShowPreview" :previewPhotos="previewPhotos" :modelStyle="modelStyle" />
  </div>
</template>

<script setup>
import { nextTick, ref, watch, onMounted } from 'vue'
import colorPanel from '../assets/js/colorPanel.js'
import useColumnByColumnAnimation from '../composables/useColumnByColumnAnimation.js'
import isMobile from '@/utils/isMobile.js'

import PhotoPreview from './PhotoPreviewBc.vue'

const props = defineProps(['images'])
const imgFit = 'cover'
const isPlayAnimation = false // 是否渲染相册动画
// 图片加载完成数
let imageLoadedCount = ref(0)

function onImageLoad() {
  imageLoadedCount.value++
}
let isShowPreview = ref(false)
let previewPhotos = ref([])
let modelStyle = ref({})
function imgClick(img, event) {
  const rect = event.target.getBoundingClientRect()
  modelStyle.value = { width: rect.width, height: rect.height, left: rect.left, top: rect.top }
  previewPhotos.value.splice(0)
  previewPhotos.value.push(img)
  // previewPhotos.value.push(...props.images)
  isShowPreview.value = true
}

watch(imageLoadedCount, (nv, ov) => {
  // 非移动端设备且视口宽大于等于1200px 监听图片加载事件并添加动画
  if (nv === props.images.length) {
    if (isPlayAnimation && !isMobile && window.innerWidth >= 1200) {
      useColumnByColumnAnimation('photo-container', 'grid-item', 'grid-animate')
    }
  }
})

// 给grid-item随机背景色
function itemBackgroundColor() {
  if (colorPanel && colorPanel.length) {
    return colorPanel[Math.floor(Math.random() * colorPanel.length)]
  }
  return '#F8B195'
}
</script>

<style scoped lang="less">
@import '../assets/css/global.less';
.photo-container {
  width: 100%;
  height: 100%;
  padding: @container-padding-lr;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(236px, 1fr));
  grid-auto-rows: 50px;
  // grid-auto-rows: minmax(auto, 1fr);
  // 水平方向居中
  // justify-content: center;
  // 垂直方向居中
  // align-content: center;
  // 单元格内元素水平、垂直居中
  // place-items: center;
  // place-items: end center;
  .grid-item {
    border-radius: @border-radius;
    overflow: hidden;
    max-height: 450px;
    &.grid-s {
      grid-row: span 5;
    }
    &.grid-m {
      grid-row: span 6;
    }
    &.grid-l {
      grid-row: span 7;
    }
    // 单网格动画
    &.grid-animate {
      // name duration timing-function delay iteration-count direction fill-mode play-state;
      // animation: moveAndFade 3s ease-in-out infinite;
      animation: moveAndFade 2s ease-in-out;
    }
    .single-img {
      width: 100%;
      height: 100%;
      border-radius: @border-radius;
      // hover效果 图片放大
      transition: transform 0.3s ease;
      :deep(.el-image__inner) {
        // cursor: zoom-in;
        cursor: pointer;
      }
      &:hover {
        // transform: scale(1.2);
      }
      .image-slot {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
      }
    }
  }
  @keyframes moveAndFade {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    60% {
      transform: translateY(-20px);
      opacity: 0;
    }
    80% {
      transform: translateY(100%);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
}
</style>
