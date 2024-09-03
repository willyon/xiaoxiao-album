/*
 * @Author: zhangshouchang
 * @Date: 2024-08-22 15:37:53
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-08-27 15:42:20
 * @Description:获取grid布局的列数。
 */
export default (gridContainer) => {
  if (gridContainer) {
    // 获取每一列的宽度 的字符串集合 例如gridContainerColumns会是这样 “246.852px 246.852px 246.852px 246.852px 246.852px 246.852px 246.852px” 表示有七列 并宽度相同
    const gridContainerColumns = getComputedStyle(gridContainer).gridTemplateColumns
    if (gridContainerColumns) {
      return gridContainerColumns.split(' ').length
    }
    return 0
  }
  return 0
}
