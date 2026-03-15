/**
 * 获取制表符大小
 * @param tabSize 编辑器的制表符大小设置
 * @returns 转换后的制表符大小数值
 */
export function getTabSize(tabSize: number | string | undefined): number {
  if (tabSize === undefined) {
    return 2;
  }
  return typeof tabSize === 'string' ? parseInt(tabSize, 10) : tabSize;
}