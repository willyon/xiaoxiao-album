<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-31 14:03:43
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-05 01:23:36
 * @Description: File description
-->
<template>
  <div class="photo-classification">
    <div class="grid-item" v-for="[albumName, photoArray] in props.groupedPhotos" :key="albumName" @click="openCertainAlbum(photoArray, albumName)">
      <div class="img-container">
        <p class="img-text">
          <span class="img-description">{{ $t(`universal.${albumName}`) }}</span>
          <span class="img-count">（ 1 / {{ photoArray.length }} ）</span>
        </p>
        <img :src="photoArray[0].smallPath" class="img-item" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useImageStore } from '@/stores/imageStore'

const props = defineProps(['groupedPhotos'])
//获取store的实例
const imageStore = useImageStore()

const openCertainAlbum = (photos, albumDate) => {
  imageStore.openCertainAlbum({ photos, albumDate })
}
</script>

<style lang="less" scoped>
@import '../assets/css/global.less';
.photo-classification {
  width: 100%;
  height: 100%;
  padding: 0 250px;
  display: grid;
  gap: @grid-gap;
  justify-content: center;
  align-items: center;
  grid-template-columns: repeat(auto-fill, 444px);
  position: relative;
  .grid-item {
    border-radius: 36px;
    width: 100%;
    overflow: hidden;
    height: 333px;
    display: flex;
    justify-content: center;
    align-items: center;
    .img-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      cursor: pointer;
      &::after {
        content: ''; /* 必须设置content以显示伪元素 */
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3); /* 半透明的黑色蒙层 */
        pointer-events: none; /* 使蒙层不可点击，确保点击事件传递到img */
      }
      &:hover::after {
        opacity: 0;
      }
      .img-text {
        color: #fff;
        position: absolute;
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        span {
          display: inline-block;
          width: 100%;
          text-align: center;
        }
        .img-count {
          font-size: 24px;
        }
        .img-description {
          font-size: 64px;
        }
      }
      .img-item {
        height: 100%;
        width: 100%;
        object-fit: cover;
      }
    }
  }
}
</style>
