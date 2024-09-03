<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-25 16:38:36
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-03 04:13:10
 * @Description: File description
-->
<template>
  <div class="preview-container model-out" @click="animationTrigger" :style="{ visibility: isVisible ? 'visible' : 'hidden' }">
    <div class="main-container" @click.stop @transitionend="handleTransitionEnd">
      <div class="photo-container">
        <el-image class="single-img" :src="item" fit="cover" v-for="item of previewPhotos"> </el-image>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, onUnmounted, toRefs, nextTick } from 'vue'
const emit = defineEmits(['preview-close'])

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  previewPhotos: {
    type: Array,
    default: []
  },
  modelStyle: {
    type: Object,
    default: {
      width: 0,
      height: 0,
      left: 0,
      top: 0
    }
  }
})

function handleTransitionEnd(ev) {
  let previewEle = document.querySelector('.preview-container')
  const eleClassList = previewEle.classList
  //退出大图预览
  if (eleClassList.contains('model-out')) {
    // previewEle.querySelector('.el-image__inner').style.objectFit = 'cover'
    emit('preview-close')
  } else if (eleClassList.contains('model-in')) {
    // 将img标签的object-fit属性设置为contain
    previewEle.querySelector('.el-image__inner').style.objectFit = 'contain'
  }
}

function animationTrigger() {
  const eleNode = document.querySelector('.preview-container')
  eleNode.classList.remove('model-in')
  setMainNodeStyle()
  eleNode.querySelector('.el-image__inner').style.objectFit = 'cover'
  eleNode.classList.add('model-out')
}

function setMainNodeStyle() {
  let mainNode = document.querySelector('.main-container')
  mainNode.style.width = props.modelStyle.width + 'px'
  mainNode.style.height = props.modelStyle.height + 'px'
  mainNode.style.top = props.modelStyle.top + 'px'
  mainNode.style.left = props.modelStyle.left + 'px'
}

watch(
  () => props.isVisible,
  (nv, ov) => {
    nextTick(() => {
      let eleNode = document.querySelector('.preview-container')
      if (eleNode) {
        if (nv) {
          eleNode.classList.remove('model-out')
          setMainNodeStyle()
          nextTick(() => {
            setTimeout(() => {
              eleNode.classList.add('model-in')
            }, 10)
          })
        }
      }
    })
  }
)
// watch(
//   () => props.modelStyle,
//   (nv, ov) => {
//   }
// )
onMounted(() => {})
</script>

<style lang="less" scoped>
@import '../assets/css/global.less';
.preview-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  overflow: auto;
  @during-time: 0.3s;
  &.model-out {
    background: transparent;
    backdrop-filter: blur(0);
    transition: all @during-time;
    .main-container {
      transition: all @during-time ease-in-out;
    }
  }
  &.model-in {
    background: var(--mask-backdrop);
    backdrop-filter: blur(20px);
    transition: all @during-time;
    .main-container {
      width: 70% !important;
      height: 100% !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%);
      transition: all @during-time ease-in-out;
    }
  }
  .main-container {
    // pointer-events: none;
    border-radius: @border-radius;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    .photo-container {
      border-radius: @border-radius;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      .single-img {
        border-radius: @border-radius;
        width: 100%;
        height: 100%;
        // :deep(.el-image__inner) {
        //   &.img-animation {
        //     object-fit: contain !important;
        //   }
        // }
      }
    }
  }
}
</style>
