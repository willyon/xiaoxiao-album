/*
 * @Author: zhangshouchang
 * @Date: 2024-08-11 15:07:46
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-08-13 23:16:02
 * @Description: File description
 */
/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    // '@vue/eslint-config-prettier/skip-formatting' // 只禁用与prettier冲突但不涉及格式化的exlint规则
    '@vue/eslint-config-prettier' // 将格式化完齐全交给prettier
  ],
  // 使用该依赖包作为eslint解析器，避免出现奇奇怪怪的错误提示
  parser: '@babel/eslint-parser',
  // 即使没有 babelrc 配置文件，也使用 babel-eslint 来解析 看网上的示例z这行是放在 parserOptions里写的 可是我是写在外面才有效 暂不知为啥
  requireConfigFile: false
  // parserOptions: {}
}
