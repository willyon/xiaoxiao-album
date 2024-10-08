/*
 * @Author: zhangshouchang
 * @Date: 2024-09-02 18:08:46
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-09-24 23:47:19
 * @Description: File description
 */
import { createI18n } from 'vue-i18n'

// define the language message
const messages = {
  en: {
    universal: {
      unknown: 'others'
    },
    photoAlbum: {
      noTimeRecord: 'no time record',
      tooltip1: 'Look through other memories from this month',
      tooltip2: 'Look through other memories',
      introduction1: "These are all <span class='album-bold-text'>&nbsp;{count}&nbsp;</span>memories",
      introduction2:
        "These are <span class='album-bold-text'>&nbsp;{count}&nbsp;</span>memories from<span class='album-bold-text'>&nbsp;{dateFormat}</span>",
      introduction3: "Oops！These are<span class='album-bold-text'>&nbsp;{count}&nbsp;</span>memories without time records"
    },
    navBar: {
      overview: 'overview',
      byYear: 'by year',
      byMonth: 'by month'
    }
  },
  zh: {
    universal: {
      unknown: '其它'
    },
    loadingText: {
      loadMore: '请稍候，加载更多照片中......',
      noMore: '没有更多照片咯～'
    },
    photoAlbum: {
      noTimeRecord: '没有时间记录',
      tooltip1: '翻翻看这个月其它回忆',
      tooltip2: '翻翻看其它没有时间记录的回忆',
      introduction1: "这是全部<span class='album-bold-text'>&nbsp;{count}&nbsp;</span>条回忆",
      introduction2:
        "这是关于<span class='album-bold-text'>&nbsp;{dateFormat}&nbsp;</span>的<span class='album-bold-text'>&nbsp;{count}&nbsp;</span>条回忆",
      introduction3: "啊嗷！这是没有时间记录的<span class='album-bold-text'>&nbsp;{count}&nbsp;</span>条回忆"
    },
    navBar: {
      overview: '总览',
      byYear: '按年份',
      byMonth: '按月份'
    }
  }
}

// create i18n instance
export default createI18n({
  legacy: false,
  locale: 'zh', // default language
  fallbackLocale: 'en',
  messages,
  missingWarn: false, //禁用缺失翻译的警告
  fallbackWarn: false, // 禁用回退翻译的警告
  warnHtmlMessage: false,
  // 当找不到翻译时，将会执行这个函数
  missing: (locale, key, vm) => {
    // console.warn(`Missing translation for ${key} in ${locale} ${vm}`)
    return key.split('.').pop() // 返回变量内容本身
  }
})
