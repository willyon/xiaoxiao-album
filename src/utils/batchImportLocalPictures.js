/*
 * @Author: zhangshouchang
 * @Date: 2024-08-18 19:52:56
 * @LastEditors: zhangshouchang
 * @LastEditTime: 2024-08-27 17:04:35
 * @Description: 批量导入本地src/assets/images目录下的指定类型图片文件
 */
export default async () => {
  let imageUrls = []
  const modules = import.meta.glob('@/assets/images/small/*.{png,jpg,jpeg,svg,webp,avif}')
  // 获取本地图片路径
  for (const path in modules) {
    const module = await modules[path]()
    imageUrls.push(module.default)
  }
  return imageUrls
}
