<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-31 14:03:43
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-22 02:00:52
 * @Description: File description
-->
<template>
  <div
    class="photo-classification"
    v-infinite-scroll="hitBottom"
    v-loading-more="{ isLoading, isNoMore: !isLoading && isAtBottom }"
    :data-loading-text="loadingText"
    :data-no-more-text="noMoreText"
  >
    <div class="grid-item" v-for="item of groupedCatalog" :key="item.timeOfGroup" @click="openAlbum(item)">
      <div class="img-container">
        <p class="img-text">
          <span class="img-description">{{ $t(`universal.${item.timeOfGroup}`) }}</span>
          <span class="img-count">（ 1 / {{ item.imageCount }} ）</span>
        </p>
        <img :src="item.latestImageUrl" class="img-item" />
      </div>
    </div>
  </div>
</template>

<script setup>
// import { useImageStore } from '@/stores/imageStore'
import { BY_YEAR, BY_MONTH, BY_OTHER } from '@/constants/constant'
import useScrollHitBottom from '../composables/useScrollHitBottom'
// import { BY_YEAR } from '@/constants/constant'

const props = defineProps({
  groupedCatalog: [],
  isLoading: true,
  loadingText: 'Loading...',
  noMoreText: 'No more...'
})

//获取store的实例
// const imageStore = useImageStore()

const emit = defineEmits(['load-data', 'open-certain-album'])
const { hitBottom, isAtBottom } = useScrollHitBottom(props, emit)
const openAlbum = (groupObject) => {
  const { timeOfGroup } = groupObject
  if (timeOfGroup !== 'unknown') {
    if (timeOfGroup.includes('-')) {
      // 月份目录 '2024-02'
      emit('open-certain-album', groupObject, BY_MONTH)
    } else {
      // 年份目录 '2024'
      emit('open-certain-album', groupObject, BY_YEAR)
    }
  } else {
    // 无时间记录目录 'unkonown'
    emit('open-certain-album', groupObject, BY_OTHER)
  }
}
</script>

<style lang="less" scoped>
@import '../assets/css/global.less';
.photo-classification {
  width: 100%;
  height: 100%;
  padding: 0 250px 50px;
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
