<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-25 16:38:36
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-27 23:36:41
 * @Description: File description
-->
<template>
  <div class="photo-preview">
    <span class="close-btn" @click="closePreview"></span>
    <!-- 反转箭头 向左-->
    <i class="img-rotate rotate-left" @click.stop="rotateImage(-1)"></i>
    <!-- 反转箭头 向右-->
    <i class="img-rotate rotate-right" @click.stop="rotateImage(1)"></i>
    <el-carousel
      v-if="isShowCarousel"
      indicator-position="none"
      :initial-index="initIndex"
      :autoplay="false"
      height="100%"
      trigger="click"
      @change="onImageChange"
      arrow="always"
      ref="carouselRef"
    >
      <el-carousel-item v-for="(imageObject, index) in previewPhotos" :key="index">
        <!-- tabindex使得div可聚焦 这样打开大图时 keydown事件就会自动生效 -->
        <div class="img-container" tabindex="0" @keydown="onKeydown" @click="closePreview">
          <p class="hack-block block-left"></p>
          <p class="hack-block block-right"></p>
          <img v-if="!isHighQualityImageLoaded[index]" :src="imageObject.bigLowQualityImageUrl" class="img-item low-quality" @click.stop />
          <img
            :src="imageObject.bigHighQualityImageUrl"
            class="img-item high-quality"
            :class="isHighQualityImageLoaded[index] ? 'loaded' : ''"
            @load="handleLoaded(index)"
            @click.stop
          />
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, onUnmounted, nextTick, computed } from 'vue'
import elementEventListenerManager from '@/utils/elementEventListenerManager.js'
import { throttle, debounce } from 'lodash'

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

let isHighQualityImageLoaded = ref([])
onMounted(() => {
  for (let i = 0; i < props.previewPhotos.length; i++) {
    isHighQualityImageLoaded.value[i] = false
  }
})
const handleLoaded = (imageIndex) => {
  isHighQualityImageLoaded.value[imageIndex] = true
}

let rotateStep = 90
let rotateAngle = 0
const rotateImage = (angleMultiplier) => {
  rotateAngle += angleMultiplier * rotateStep
  updateImageTransfrom()
  focusCurImgContainer()
}

const focusCurImgContainer = () => {
  curImageContainer.value.focus()
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
function onImageChange(newIndex) {
  updateActiveIndex(newIndex)
  resetImageStyle()
  setTimeout(() => {
    focusCurImgContainer()
  }, 1000)
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
  return document.querySelector('.photo-preview').querySelectorAll('.high-quality')[activeIndex.value]
})

let curImageContainer = computed(() => {
  return document.querySelector('.photo-preview').querySelectorAll('.img-container')[activeIndex.value]
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
    &:hover {
      background-color: #9b9da1;
    }
  }
  .img-rotate {
    display: inline-block;
    position: absolute;
    z-index: 1;
    top: 46px;
    cursor: pointer;
    width: 46px;
    height: 46px;
    border-radius: 10px;
    &.rotate-left {
      background: url('@/assets/icons/rotate-left.png') center / 34px no-repeat; /* 默认图标路径 */
      right: 340px;
    }
    &.rotate-right {
      background: url('@/assets/icons/rotate-right.png') center / 34px no-repeat; /* 默认图标路径 */
      right: 280px;
    }
    &:hover {
      background-color: rgba(211, 211, 211, 0.5); /* 浅灰背景色 */
    }
  }
  .img-switch {
    display: inline-block;
    cursor: pointer;
    width: 40px;
    height: 40px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-position: center;
    background-size: 28px;
    background-repeat: no-repeat;
    pointer-events: none;
    z-index: 2;
    border-radius: 50%;
    &.arrow-prev {
      background-image: url('@/assets/icons/arrow-prev.png');
      left: 20px;
    }
    &.arrow-next {
      background-image: url('@/assets/icons/arrow-next.png');
      right: 20px;
    }
    &.events-all {
      background-color: #9b9da1;
    }
    &.events-none {
      background-color: #78787c;
    }
  }

  .el-carousel {
    width: 100%;
    height: 100%;
    // background: black;
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
        .hack-block {
          position: absolute;
          width: 36px;
          height: 36px;
          background: transparent;
          pointer-events: all;
          &.block-left {
            left: 16px;
          }
          &.block-right {
            right: 16px;
          }
        }
        .img-item {
          height: 100%;
          transition: transform 0.4s;
          position: absolute;
          object-fit: contain;
          &:hover {
            cursor: grab;
          }
          &.low-quality {
            filter: blur(10px); /* 低质量图片的模糊效果 */
          }
          &.high-quality {
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
            &.loaded {
              opacity: 1; /* 高质量图片淡入效果 */
            }
          }
        }
      }
    }
  }
}
</style>
