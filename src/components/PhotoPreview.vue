<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-25 16:38:36
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-25 23:49:25
 * @Description: File description
-->
<template>
  <div class="photo-preview">
    <span class="close-btn" @click="closePreview"></span>
    <div class="rotate-icons">
      <i class="rotate-left" @click="rotateImage(-1)"></i>
      <i class="rotate-right" @click="rotateImage(1)"></i>
    </div>
    <el-carousel
      v-if="isShowCarousel"
      indicator-position="none"
      :initial-index="initIndex"
      :autoplay="false"
      height="100%"
      trigger="click"
      @change="switchImage"
      arrow="always"
      ref="carouselRef"
    >
      <!-- arrow="never" -->
      <el-carousel-item v-for="(imageObject, index) in previewPhotos" :key="index">
        <!-- tabindex使得div可聚焦 这样打开大图时 keydown事件就会自动生效 -->
        <div class="img-container" tabindex="0" @keydown="onKeydown" @click="closePreview">
          <img :src="imageObject.bigImageUrl" class="img-item" @click.stop />
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, onUnmounted, nextTick, computed } from 'vue'
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

let rotateStep = 90
let rotateAngle = 0
const rotateImage = (angleMultiplier) => {
  rotateAngle += angleMultiplier * rotateStep
  updateImageTransfrom()
}

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
    //图片放大缩小功能 绑定鼠标滚轮事件
    elementEventListenerManager.addEventListener(curImageEle.value, 'wheel', onWheel, {
      passive: false
    })
    //图片拖拽功能 绑定鼠标点击事件
    elementEventListenerManager.addEventListener(curImageEle.value, 'mousedown', onMouseDown, {
      passive: false
    })
  })
}

// 图片缩放
let scale = 1
const onWheel = throttle((event) => {
  event.preventDefault() // 阻止默认滚动行为
  // 根据滚轮滚动方向调整缩放比例
  scale += event.deltaY < 0 ? -0.1 : 0.1
  scale = Math.max(0.5, Math.min(scale, 2)) // 设置缩放范围
  // 更新元素的 transform 样式
  updateImageTransfrom()
}, 10)

const updateImageTransfrom = () => {
  curImageEle.value.style.transform = `scale(${scale}) rotate(${rotateAngle}deg)`
}

const updateImageLT = () => {
  curImageEle.value.style.left = 'initial'
  curImageEle.value.style.top = 'initial'
}

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
function switchImage(newIndex) {
  updateActiveIndex(newIndex)
  resetImageStyle()
}

function resetImageStyle() {
  scale = 1
  rotateStep = 90
  rotateAngle = 0
  updateImageTransfrom()
  updateImageLT()
}

//更新当前展示图片索引缓存
let carouselRef = ref(null)
function updateActiveIndex(curIndex) {
  activeIndex.value = curIndex
}

function closePreview() {
  resetImageStyle()
  emit('preview-close')
}

let curImageEle = computed(() => {
  return document.querySelector('.photo-preview').querySelectorAll('.img-item')[activeIndex.value]
})
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

  .rotate-icons {
    position: fixed;
    top: 10px;
    right: 180px;
    z-index: 1;
    // display: flex;
    i {
      display: inline-block;
      cursor: pointer;
      width: 46px;
      height: 46px;
      &.rotate-left {
        background: url('@/assets/icons/rotate-left.png') center / 34px no-repeat; /* 默认图标路径 */
        margin-right: 20px;
      }
      &.rotate-right {
        background: url('@/assets/icons/rotate-right.png') center / 34px no-repeat; /* 默认图标路径 */
      }
      border-radius: 10px;
      &:hover {
        background-color: rgba(211, 211, 211, 0.5); /* 浅灰背景色 */
      }
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
