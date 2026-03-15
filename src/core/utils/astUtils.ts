import * as vscode from 'vscode';

/**
 * 从文档中获取包围变量的类名和函数名
 * @param document 文本文档
 * @param lineNumber 变量所在的行号
 * @returns 包含类名和函数名的对象
 */
export function getEnclosingContext(
  document: vscode.TextDocument,
  lineNumber: number
): { enclosingClass: string | undefined; enclosingFunction: string | undefined } {
  // 获取文档内容
  const text = document.getText();
  const lines = text.split('\n');

  // 存储找到的类名和函数名
  let enclosingClass: string | undefined;
  let enclosingFunction: string | undefined;

  // 从当前行向上搜索
  for (let i = lineNumber; i >= 0; i--) {
    const line = lines[i].trim();

    // 跳过注释行
    if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*') || line.endsWith('*/')) {
      continue;
    }

    // 查找函数定义 - 更全面的模式匹配
    // 匹配: function name(), const name = function(), const name = (), name = () =>, function* name()
    const functionPatterns = [
      /^function\s+([\w$]+)\s*\(/, // function declaration
      /^const\s+([\w$]+)\s*=\s*function\s*/, // const function expression
      /^const\s+([\w$]+)\s*=\s*\(/, // const arrow function
      /^([\w$]+)\s*=\s*function\s*/, // function expression
      /^([\w$]+)\s*=\s*\(/, // arrow function
      /^function\*\s+([\w$]+)\s*\(/, // generator function
      /^([\w$]+)\s*\([^)]*\)\s*=>/ // concise arrow function
    ];

    for (const pattern of functionPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        enclosingFunction = match[1];
        break;
      }
    }

    if (enclosingFunction) {
      break;
    }

    // 查找类定义
    const classMatch = line.match(/^class\s+([\w$]+)/);
    if (classMatch) {
      enclosingClass = classMatch[1];
    }
  }

  return { enclosingClass, enclosingFunction };
}
