/*
 * @Author: zhangshouchang
 * @Date: 2024-08-22 17:24:08
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-08-25 21:46:14
 * @Description: 将grid布局中，以列索引为key，每一列包含的子元素为值，得出一个数组对象，如：{1:[childNode,...], 2:[childNode,...],...}。前提是所有列宽度是一致的 这样计算列索引才准确
 */
export default (gridItemClassName) => {
  let nodesGroupedInColumns = {}
  let gridItems = document.querySelectorAll(`.${gridItemClassName}`)
  if (gridItems && gridItems.length) {
    let gridContainer = gridItems[0].parentNode
    // 列间距
    let columnGap = parseFloat(getComputedStyle(gridContainer).columnGap) // getComputedStyle(gridContainer).columnGap得出一个字符串 如‘16.5px’ 然后parseInt转为数字16.5
    for (let gridItem of gridItems) {
      let columnWidth = gridItem.offsetWidth + columnGap
      // 计算当前子元素左边距离父元素左边的距离
      let distanceToLeftBoundaryParentNode =
        gridItem.getBoundingClientRect().left - gridContainer.getBoundingClientRect().left
      let columnIndex = Math.floor(distanceToLeftBoundaryParentNode / columnWidth) + 1 // 计算列索引
      if (!nodesGroupedInColumns[columnIndex]) {
        nodesGroupedInColumns[columnIndex] = []
      }
      nodesGroupedInColumns[columnIndex].push(gridItem)
    }
  }
  return nodesGroupedInColumns
}
