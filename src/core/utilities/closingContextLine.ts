import { TextDocument } from 'vscode';
import { BracketType } from '../../entities';

/**
 * 找到与开括号匹配的闭括号所在的行
 * @param document 文本文档
 * @param lineNumber 开括号所在的行号
 * @param bracketType 括号类型
 * @returns 闭括号所在的行号，如果没有找到则返回 -1
 */
export function closingContextLine(
  document: TextDocument,
  lineNumber: number,
  bracketType: BracketType,
): number {
  const bracketPairs: Record<BracketType, [string, string]> = {
    [BracketType.PARENTHESIS]: ['(', ')'],
    [BracketType.CURLY_BRACES]: ['{', '}'],
  };

  const [openingBracket, closingBracket] = bracketPairs[bracketType];
  let openingBracketCount = 0;
  let closingBracketCount = 0;
  let line = lineNumber;
  const documentNbrOfLines = document.lineCount;

  while (line < documentNbrOfLines) {
    const currentLine = document.lineAt(line).text;
    const openingBrackets = (currentLine.match(new RegExp(`\\${openingBracket}`, 'g')) || []).length;
    const closingBrackets = (currentLine.match(new RegExp(`\\${closingBracket}`, 'g')) || []).length;

    openingBracketCount += openingBrackets;
    closingBracketCount += closingBrackets;

    if (openingBracketCount === closingBracketCount && openingBracketCount > 0) {
      return line;
    }

    line++;
  }

  return -1;
}
