<!--
 * @Author: zhangshouchang
 * @Date: 2024-08-24 20:32:27
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-21 10:07:19
 * @Description: File description
-->
<template>
  <!-- -->
  <div class="nav-bar">
    <div class="tag-container">
      <ul class="tag-box tag-time">
        <li
          class="tag-item"
          :class="{ 'tag-active': imageStore.activeTab === tabValue }"
          @click="imageStore.tabSwitch(tabValue)"
          v-for="tabValue of TIME_TAB_GROUP"
        >
          {{ $t(`navBar.${tabValue}`) }}
        </li>
      </ul>
      <ul class="tag-box tag-type">
        <li
          class="tag-item"
          :class="{ 'tag-active': tagTypeSelected.includes(item) }"
          @click="!tagTypeSelected.includes(item) && tagClick(tagTypeSelected, item)"
          v-for="item of tagTypeArr"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { TIME_TAB_GROUP } from '@/constants/constant'
import { ref } from 'vue'
import { useImageStore } from '@/stores/imageStore'
//获取store的实例
const imageStore = useImageStore()

const tagTypeArr = ['全部', '婚纱照', '满月照', '宝贝日常', '大家庭']
let tagTypeSelected = ref([tagTypeArr[0]])
function tagClick(selectedArr, tagItem) {
  selectedArr.splice(0)
  selectedArr.push(tagItem)
}
</script>

<style lang="less" scoped>
@import '../assets/css/global.less';
.nav-bar {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: @nav-bar-min-h;
  padding: 10px @container-padding-lr 10px @container-padding-lr;
  background: #fff;
  box-shadow:
    rgba(0, 0, 0, 0.08) 0px 2px 6px 0px,
    rgba(0, 0, 0, 0.02) 0px 0px 2px 0px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10; /* 保证导航栏在其他元素之上 */
  .tag-container {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    @flex-gap: 20px;
    .tag-box {
      display: flex;
      gap: @flex-gap;
      flex-wrap: wrap;
      .tag-item {
        border: 1px solid #e9e9eb;
        background-color: #f4f4f5;
        color: #919398;
        padding: 6px 18px;
        border-radius: 24px;
        &:hover {
          cursor: pointer;
        }
        &.tag-active {
          background: #fff;
          color: #000;
          border-color: #000;
          // &:hover {
          //   cursor: not-allowed;
          // }
        }
      }
    }
    .tag-time {
      padding-right: @flex-gap;
      border-right: 1px solid #e9e9eb;
    }
    .tag-type {
      flex: 1;
      padding-left: @flex-gap;
    }
  }
}
</style>
