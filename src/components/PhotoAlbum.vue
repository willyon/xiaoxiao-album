<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-11 15:07:46
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-03 04:46:13
 * @Description: File description
-->

<template>
  <div class="photo-album">
    <!-- 打开总览相册 -->
    <template v-if="props.images.length">
      <p class="album-introduction" v-if="imageStore.isOverviewAlbum" v-html="$t('photoAlbum.introduction1', { count: props.images.length })"></p>
      <!-- 打开年/月相册 -->
      <p
        class="album-introduction"
        v-if="imageStore.isCertainAlbumWithTimeRecords"
        v-html="$t('photoAlbum.introduction2', { dateFormat: imageStore.dateFormatText, count: props.images.length })"
      ></p>
      <!-- 打开【其它】相册 -->
      <p
        class="album-introduction"
        v-if="imageStore.isCertainAlbumNoTimeRecords"
        v-html="$t('photoAlbum.introduction3', { count: props.images.length })"
      ></p>
    </template>
    <!-- 返回箭头 -->
    <i class="back-arrow" v-show="imageStore.isCertainAlbum" @click="imageStore.closeCertainAlbum"></i>
    <div
      class="grid-item"
      :class="{ 'grid-l': index % 3 === 0, 'grid-m': index % 3 === 1, 'grid-s': index % 3 === 2 }"
      v-for="(imageObject, index) in props.images"
      :key="index"
    >
      <div class="img-overlay" @click="imgClick(index, $event)">
        <div class="bottom-bar">
          <p class="createtion-date">{{ $t(`${dateFormat(+imageObject.creationDate)}`) }}</p>
          <el-tooltip effect="dark" :content="$t(`${popperTip(+imageObject.creationDate)}`)" placement="top" v-if="imageStore.activeTab !== BY_MONTH">
            <i class="album-more" @click.stop="openCertainAlbum(+imageObject.creationDate)"></i>
          </el-tooltip>
        </div>
      </div>
      <el-image class="single-img" :src="imageObject.smallPath" @load="onImageLoad" :fit="imgFit" loading="lazy">
        <!-- 占位符 保持页面布局 -->
        <template #placeholder>
          <div class="image-slot" :style="{ 'background-color': itemBackgroundColor() }"></div>
        </template>
      </el-image>
    </div>
    <PhotoPreview @previewClose="isShowPreview = false" v-if="isShowPreview" :previewPhotos="props.images" :initIndex="imgIndex" />
  </div>
</template>

<script setup>
import { DateTime } from 'luxon'
import { ref, watch, onMounted, computed, getCurrentInstance } from 'vue'
import colorPanel from '../constants/colorPanel.js'
import useColumnByColumnAnimation from '../composables/useColumnByColumnAnimation.js'
import isMobile from '@/utils/isMobile.js'
import { useImageStore } from '@/stores/imageStore'
import PhotoPreview from './PhotoPreview.vue'
import { BY_OTHER, BY_MONTH } from '@/constants/constant'
const { appContext } = getCurrentInstance()

const currentLocale = appContext.config.globalProperties.$currentLocale

//获取store的实例
const imageStore = useImageStore()

const imgFit = 'cover'
const isPlayAnimation = false // 是否渲染相册动画
// 图片加载完成数
let imageLoadedCount = ref(0)

const props = defineProps(['images'])

onMounted(() => {})

const popperTip = computed(() => {
  return (timestamp) => {
    if (timestamp && !isNaN(timestamp)) {
      return 'photoAlbum.tooltip1'
    }
    return 'photoAlbum.tooltip2'
  }
})

// 使用 computed 时间戳格式化
const dateFormat = computed(() => {
  return (timestamp) => {
    if (timestamp && !isNaN(timestamp)) {
      return DateTime.fromMillis(timestamp).toFormat('yyyy-MM-dd')
    }
    return 'photoAlbum.noTimeRecord'
  }
})

const openCertainAlbum = (creationDate) => {
  const albumDate = creationDate ? DateTime.fromMillis(creationDate).toFormat('yyyy-MM') : BY_OTHER
  const photos = imageStore.photoOfMonth.get(albumDate)
  imageStore.tabSwitch(BY_MONTH)
  imageStore.openCertainAlbum({ photos, albumDate })
}

function onImageLoad() {
  imageLoadedCount.value++
}

let imgIndex = ref(0)
let isShowPreview = ref(false)
function imgClick(index, event) {
  imgIndex.value = index
  isShowPreview.value = true
}

watch(imageLoadedCount, (nv, ov) => {
  // 非移动端设备且视口宽大于等于1200px 监听图片加载事件并添加动画
  if (nv === props.images.length) {
    if (isPlayAnimation && !isMobile && window.innerWidth >= 1200) {
      const gridContainer = document.querySelector('.photo-album')
      useColumnByColumnAnimation(gridContainer, 'grid-item', 'grid-animate')
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
  padding: 0 @container-padding-lr;
  display: grid;
  gap: @grid-gap;
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
      // pointer-events: none;
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
      // animation: moveAndFade 3s ease-in-out infinite;
      animation: moveAndFade 2s ease-in-out;
    }
    .single-img {
      width: 100%;
      height: 100%;
      border-radius: @border-radius;
      // hover效果 图片放大
      transition: transform 0.3s ease;
      // :deep(.el-image__inner) {
      // cursor: zoom-in;
      // }
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
