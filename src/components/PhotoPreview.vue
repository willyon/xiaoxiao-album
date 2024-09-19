<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-25 16:38:36
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-18 21:18:30
 * @Description: File description
-->
<template>
  <div class="photo-preview">
    <span class="close-btn" @click="closePreview"></span>
    <el-carousel
      v-if="isShowCarousel"
      :initial-index="initIndex"
      :autoplay="false"
      height="100%"
      trigger="click"
      arrow="always"
      @change="pictureSwitching"
      ref="carouselRef"
    >
      <el-carousel-item v-for="(imageObject, index) in previewPhotos" :key="index">
        <div class="img-container" @keydown="onKeydown" tabindex="0" @click="closePreview">
          <img :src="imageObject.bigPath" class="img-item" @click.stop />
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, onUnmounted, nextTick } from 'vue'
import elementEventListenerManager from '@/utils/elementEventListenerManager.js'
import { throttle } from 'lodash'

const emit = defineEmits(['preview-close'])

const props = defineProps({
  previewPhotos: {
    type: Array,
    default: []
  },
  initIndex: {
    type: Number,
    default: 0
  }
})

let activeIndex = ref(null)
watch(activeIndex, (nv, ov) => {
  eventBinding()
})

let isShowCarousel = ref(false)
onMounted(() => {
  // 阻止预览组件外的滚动事件 因为在当前预览组件需要用到滚动事件
  elementEventListenerManager.addEventListener(document.body, 'wheel', windowScrollPrevent, {
    passive: false
  })
  // 因为要使用到initial-index 所以要添加这个变量 相当于是让initial-index变量传入组件后 再渲染组件 否则渲染会有问题
  isShowCarousel.value = true
  nextTick(() => {
    // 更新当前展示图片索引缓存
    updateActiveIndex(carouselRef.value.activeIndex)
    // 自动聚焦div 使后面的键盘监听事件的绑定自动生效 而不需要手动点击一次div聚焦
    divFocus()
  })
})

onUnmounted(() => {
  // 移除所有元素的所有监听事件
  elementEventListenerManager.clearAllEventListeners()
})

function divFocus() {
  document.querySelector('.photo-preview').querySelectorAll('.img-container')[activeIndex.value].focus()
}

// 键盘左右箭头事件 切换图片
function onKeydown({ key }) {
  if (key === 'ArrowLeft') {
    carouselRef.value.prev()
  } else if (key === 'ArrowRight') {
    carouselRef.value.next()
  } else if (key === 'Escape') {
    closePreview()
  }
}

// 阻止body元素滚动事件
function windowScrollPrevent(event) {
  event.preventDefault()
}

// 当前图片元素缩放和拖拽功能添加
function eventBinding() {
  nextTick(() => {
    const activeItem = document.querySelector('.photo-preview').querySelectorAll('.img-item')[activeIndex.value]
    //图片放大缩小功能 绑定鼠标滚轮事件
    elementEventListenerManager.addEventListener(activeItem, 'wheel', onWheel, {
      passive: false
    })
    //图片拖拽功能 绑定鼠标点击事件
    elementEventListenerManager.addEventListener(activeItem, 'mousedown', onMouseDown, {
      passive: false
    })
  })
}

// 图片缩放
let scale = 1
const onWheel = throttle((event) => {
  event.preventDefault() // 阻止默认滚动行为
  // 根据滚轮滚动方向调整缩放比例
  scale += event.deltaY < 0 ? 0.1 : -0.1
  scale = Math.max(0.5, Math.min(scale, 2)) // 设置缩放范围
  // 应用缩放效果
  event.target.style.transform = `scale(${scale})`
}, 10)

// 图片拖拽
function onMouseDown(event) {
  event.preventDefault()

  const imgEle = event.target
  const offsetX = event.clientX - imgEle.offsetLeft
  const offsetY = event.clientY - imgEle.offsetTop

  function onMouseMove(event) {
    imgEle.style.left = `${event.clientX - offsetX}px`
    imgEle.style.top = `${event.clientY - offsetY}px`
  }

  function onMouseUp() {
    elementEventListenerManager.clearEventListeners(document)
  }

  //绑定鼠标拖动事件
  elementEventListenerManager.addEventListener(document, 'mousemove', onMouseMove)
  //绑定鼠标释放事件
  elementEventListenerManager.addEventListener(document, 'mouseup', onMouseUp)
}

// 图片切换事件
function pictureSwitching(newIndex) {
  updateActiveIndex(newIndex)
}

//更新当前展示图片索引缓存
let carouselRef = ref(null)
function updateActiveIndex(curIndex) {
  activeIndex.value = curIndex
}

function closePreview() {
  emit('preview-close')
}
</script>

<style lang="less" scoped>
@import '../assets/css/global.less';
.photo-preview {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  overflow: auto;
  .close-btn {
    top: 40px;
    right: 40px;
    width: 44px;
    height: 44px;
    font-size: 24px;
    color: #fff;
    background-color: #66676b;
    border-color: #fff;
    position: absolute;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    opacity: 0.8;
    cursor: pointer;
    &::before,
    &::after {
      content: '';
      background: rgba(255, 255, 255, 0.9);
      width: 22px;
      height: 1.5px;
      position: absolute;
    }
    &::before {
      transform: rotate(-45deg);
    }
    &::after {
      transform: rotate(45deg);
    }
  }
  .el-carousel {
    width: 100%;
    height: 100%;
    background: var(--mask-backdrop);
    backdrop-filter: blur(20px);
    .el-carousel__item {
      .img-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        cursor: zoom-out;
        .img-item {
          height: 100%;
          transition: transform 0.4s;
          position: absolute;
          object-fit: contain;
          &:hover {
            cursor: grab;
          }
        }
      }
    }
  }
}
</style>
