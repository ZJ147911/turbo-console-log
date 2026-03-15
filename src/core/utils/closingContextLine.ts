/**
 * 计算闭合上下文行
 * @param lines 文档的所有行
 * @param lineIndex 当前行索引
 * @param openBracket 开括号
 * @param closeBracket 闭括号
 * @returns 闭合上下文行的索引
 */
export function closingContextLine(
  lines: string[],
  lineIndex: number,
  openBracket: string,
  closeBracket: string,
): number {
  let openBracketsCount = 0;
  let closeBracketsCount = 0;
  let closingContextLineIndex = -1;

  for (let i = lineIndex; i < lines.length; i++) {
    const line = lines[i];
    const openBrackets = (line.match(new RegExp(openBracket, 'g')) || []).length;
    const closeBrackets = (line.match(new RegExp(closeBracket, 'g')) || []).length;

    openBracketsCount += openBrackets;
    closeBracketsCount += closeBrackets;

    if (openBracketsCount === closeBracketsCount && openBracketsCount > 0) {
      closingContextLineIndex = i;
      break;
    }
  }

  return closingContextLineIndex;
}