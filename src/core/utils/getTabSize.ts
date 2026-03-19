/**
 * 获取制表符大小（约束在 1–32 之间，与构建产物一致）
 * @param tabSize 编辑器的制表符大小设置
 * @returns 转换后的制表符大小数值
 */
export function getTabSize(tabSize: number | string | undefined): number {
  const raw =
    tabSize === undefined
      ? 2
      : typeof tabSize === 'string'
        ? parseInt(tabSize, 10)
        : tabSize;
  const n = Number.isFinite(raw) ? Math.floor(raw) : 2;
  return Math.min(32, Math.max(1, n || 2));
}
