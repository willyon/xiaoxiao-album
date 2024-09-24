<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-11 15:07:46
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-24 23:52:08
 * @Description: File description
-->

<template>
  <div
    class="photo-album"
    v-infinite-scroll="hitBottom"
    v-loading-more="{ isLoading: isLoading.value, isNoMore: !isLoading.value && isAtBottom }"
    :data-loading-text="loadingText"
    :data-no-more-text="noMoreText"
  >
    <div
      class="grid-item"
      :class="{ 'grid-l': index % 3 === 0, 'grid-m': index % 3 === 1, 'grid-s': index % 3 === 2 }"
      v-for="(imageObject, index) in images"
      :key="index"
    >
      <div class="img-overlay" @click="imgClick(index, $event)">
        <div class="bottom-bar">
          <p class="createtion-date">{{ $t(`${dateFormat(+imageObject.creationDate)}`) }}</p>
          <el-tooltip
            effect="dark"
            :content="$t(`${popperTip(+imageObject.creationDate)}`)"
            placement="top"
            v-if="imageStore.activeTab === OVERVIEW_ALBUM || (imageStore.isCertainYearAlbum && !!imageObject.creationDate)"
          >
            <i class="album-more" @click.stop="openAlbum(imageObject)"></i>
          </el-tooltip>
        </div>
      </div>
      <el-image class="single-img" :src="imageObject.smallImageUrl" :fit="imgFit" loading="lazy">
        <!-- 占位符 保持页面布局 -->
        <template #placeholder>
          <div class="image-slot" :style="{ 'background-color': itemBackgroundColor() }"></div>
        </template>
      </el-image>
    </div>
    <!-- 图片放大预览 -->
    <PhotoPreview @previewClose="isShowPreview = false" v-if="isShowPreview" :previewPhotos="images" :initIndex="imgIndex" />
  </div>
</template>

<script setup>
import { DateTime } from 'luxon'
import { ref, computed, onMounted } from 'vue'
import colorPanel from '../constants/colorPanel'
import useScrollHitBottom from '../composables/useScrollHitBottom'
import { useImageStore } from '@/stores/imageStore'
import PhotoPreview from './PhotoPreview.vue'
import { OVERVIEW_ALBUM } from '@/constants/constant'

//获取store的实例
const imageStore = useImageStore()

const imgFit = 'cover'

const props = defineProps({
  images: { type: Array, default: () => [] },
  isLoading: { type: Object },
  loadingText: { type: String, default: 'Loading...' },
  noMoreText: { type: String, default: 'No more...' }
})

const emit = defineEmits(['load-data', 'open-certain-album'])

const { hitBottom, isAtBottom } = useScrollHitBottom(emit)

const popperTip = computed(() => {
  return (timestamp) => {
    if (timestamp && !isNaN(timestamp)) {
      return 'photoAlbum.tooltip1'
    }
    return 'photoAlbum.tooltip2'
  }
})

onMounted(() => {})

// 使用 computed 时间戳格式化
const dateFormat = computed(() => {
  return (timestamp) => {
    if (timestamp && !isNaN(timestamp)) {
      return DateTime.fromMillis(timestamp).toFormat('yyyy-MM-dd')
    }
    return 'photoAlbum.noTimeRecord'
  }
})

const openAlbum = (imageObject) => {
  const { creationDate } = imageObject
  if (creationDate) {
    // 月份目录 '2024-02'
    emit('open-certain-album', imageObject, 'month')
  } else {
    // 无时间记录目录 'unkonown'
    emit('open-certain-album', imageObject)
  }
}

let imgIndex = ref(0)
let isShowPreview = ref(false)
function imgClick(index, event) {
  imgIndex.value = index
  isShowPreview.value = true
}

// watch(imageLoadedCount, (nv, ov) => {
//   // 非移动端设备且视口宽大于等于1200px 监听图片加载事件并添加动画
//   if (nv === props.images.length) {
//     if (isPlayAnimation && !isMobile && window.innerWidth >= 1200) {
//       const gridContainer = document.querySelector('.photo-album')
//       useColumnByColumnAnimation(gridContainer, 'grid-item', 'grid-animate')
//     }
//   }
// })

// 给grid-item随机背景色
function itemBackgroundColor() {
  if (colorPanel && colorPanel.length) {
    return colorPanel[Math.floor(Math.random() * colorPanel.length)]
  }
  return '#F8B195'
}
</script>

<style>
.album-bold-text {
  font-size: 24px;
}
</style>

<style scoped lang="less">
@import '../assets/css/global.less';
.photo-album {
  width: 100%;
  height: 100%;
  padding: 0 @container-padding-lr 50px;
  display: grid;
  gap: @grid-gap;
  grid-template-columns: repeat(auto-fill, minmax(236px, 1fr));
  grid-auto-rows: 50px;
  .grid-item {
    border-radius: @border-radius;
    overflow: hidden;
    max-height: 450px;
    position: relative;
    &.grid-s {
      grid-row: span 5;
    }
    &.grid-m {
      grid-row: span 6;
    }
    &.grid-l {
      grid-row: span 7;
    }
    .img-overlay {
      width: 100%;
      height: 100%;
      position: absolute;
      color: white;
      background-color: rgba(0, 0, 0, 0.3);
      transition: opacity 0.3s;
      z-index: 1;
      text-align: center;
      padding: 0 14px 10px;
      display: flex;
      align-items: end;
      cursor: zoom-in;
      opacity: 0; // 初始隐藏
      &:hover {
        opacity: 1; // hover显示
      }
      .bottom-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        .createtion-date {
          // text-align: left;
        }
        .album-more {
          pointer-events: all;
          display: inline-block;
          cursor: pointer;
          width: 28px;
          height: 28px;
          background-color: #fff;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          &::after {
            content: '';
            display: block;
            width: 16px;
            height: 16px;
            background: url('@/assets/icons/album.png') center / 100% no-repeat; /* 默认图标路径 */
          }
          &:hover {
            background-color: rgba(211, 211, 211, 1); /* 浅灰背景色 */
          }
        }
      }
    }
    // 单网格动画
    &.grid-animate {
      // name duration timing-function delay iteration-count direction fill-mode play-state;
      animation: moveAndFade 2s ease-in-out;
    }
    .single-img {
      width: 100%;
      height: 100%;
      border-radius: @border-radius;
      // hover效果 图片放大
      transition: transform 0.3s ease;
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
