import * as vscode from 'vscode';

/**
 * 从文档中获取包围变量的类名和函数名
 * @param document 文本文档
 * @param lineNumber 变量所在的行号
 * @returns 包含类名和函数名的对象
 */
// 预定义正则表达式模式，提高性能
const LANGUAGE_PATTERNS = {
  js: {
    functionPatterns: [
      /^function\s+([\w$]+)\s*\(/, // 函数声明
      /^function\*\s+([\w$]+)\s*\(/, // 生成器函数
      /^const\s+([\w$]+)\s*=\s*function\s*/, // const函数表达式
      /^const\s+([\w$]+)\s*=\s*\(/, // const箭头函数
      /^([\w$]+)\s*=\s*function\s*/, // 函数表达式
      /^([\w$]+)\s*=\s*\(/, // 箭头函数
      /^([\w$]+)\s*\([^)]*\)\s*=>/, // 简洁箭头函数
      /^([\w$]+)\s*:\s*function\s*/, // 对象方法函数
      /^([\w$]+)\s*:\s*\(/, // 对象方法箭头函数
      /^([\w$]+)\s*:\s*\([^)]*\)\s*=>/, // 对象方法简洁箭头函数
      /^static\s+function\s+([\w$]+)\s*\(/, // 静态方法
      /^static\s+([\w$]+)\s*\(/, // 静态方法简写
      /^static\s+([\w$]+)\s*:\s*function\s*/, // 静态对象方法函数
      /^static\s+([\w$]+)\s*:\s*\(/, // 静态对象方法箭头函数
      /^static\s+([\w$]+)\s*:\s*\([^)]*\)\s*=>/, // 静态对象方法简洁箭头函数
      /^get\s+([\w$]+)\s*\(/, // getter
      /^set\s+([\w$]+)\s*\(/, // setter
      /^static\s+get\s+([\w$]+)\s*\(/, // 静态getter
      /^static\s+set\s+([\w$]+)\s*\(/, // 静态setter
      /^async\s+function\s+([\w$]+)\s*\(/, // 异步函数声明
      /^async\s+function\*\s+([\w$]+)\s*\(/, // 异步生成器函数
      /^const\s+([\w$]+)\s*=\s*async\s*function\s*/, // 异步const函数表达式
      /^const\s+([\w$]+)\s*=\s*async\s*\(/, // 异步const箭头函数
      /^([\w$]+)\s*=\s*async\s*function\s*/, // 异步函数表达式
      /^([\w$]+)\s*=\s*async\s*\(/, // 异步箭头函数
      /^async\s+([\w$]+)\s*\([^)]*\)\s*=>/, // 异步简洁箭头函数
      /^async\s+([\w$]+)\s*:\s*function\s*/, // 异步对象方法函数
      /^async\s+([\w$]+)\s*:\s*\(/, // 异步对象方法箭头函数
      /^async\s+([\w$]+)\s*:\s*\([^)]*\)\s*=>/, // 异步对象方法简洁箭头函数
      /^static\s+async\s+function\s+([\w$]+)\s*\(/, // 静态异步方法
      /^static\s+async\s+([\w$]+)\s*\(/, // 静态异步方法简写
      /^async\s+get\s+([\w$]+)\s*\(/, // 异步getter
      /^async\s+set\s+([\w$]+)\s*\(/, // 异步setter
      /^static\s+async\s+get\s+([\w$]+)\s*\(/, // 静态异步getter
      /^static\s+async\s+set\s+([\w$]+)\s*\(/, // 静态异步setter
      // 添加访问修饰符支持
      /^public\s+function\s+([\w$]+)\s*\(/, // public方法
      /^protected\s+function\s+([\w$]+)\s*\(/, // protected方法
      /^private\s+function\s+([\w$]+)\s*\(/, // private方法
      /^public\s+static\s+function\s+([\w$]+)\s*\(/, // public静态方法
      /^protected\s+static\s+function\s+([\w$]+)\s*\(/, // protected静态方法
      /^private\s+static\s+function\s+([\w$]+)\s*\(/, // private静态方法
      /^public\s+([\w$]+)\s*\(/, // public方法简写
      /^protected\s+([\w$]+)\s*\(/, // protected方法简写
      /^private\s+([\w$]+)\s*\(/, // private方法简写
      /^public\s+static\s+([\w$]+)\s*\(/, // public静态方法简写
      /^protected\s+static\s+([\w$]+)\s*\(/, // protected静态方法简写
      /^private\s+static\s+([\w$]+)\s*\(/, // private静态方法简写
      /^public\s+get\s+([\w$]+)\s*\(/, // public getter
      /^protected\s+get\s+([\w$]+)\s*\(/, // protected getter
      /^private\s+get\s+([\w$]+)\s*\(/, // private getter
      /^public\s+set\s+([\w$]+)\s*\(/, // public setter
      /^protected\s+set\s+([\w$]+)\s*\(/, // protected setter
      /^private\s+set\s+([\w$]+)\s*\(/, // private setter
      /^public\s+async\s+function\s+([\w$]+)\s*\(/, // public异步方法
      /^protected\s+async\s+function\s+([\w$]+)\s*\(/, // protected异步方法
      /^private\s+async\s+function\s+([\w$]+)\s*\(/, // private异步方法
      /^public\s+async\s+([\w$]+)\s*\(/, // public异步方法简写
      /^protected\s+async\s+([\w$]+)\s*\(/, // protected异步方法简写
      /^private\s+async\s+([\w$]+)\s*\(/, // private异步方法简写
      /^public\s+static\s+async\s+function\s+([\w$]+)\s*\(/, // public静态异步方法
      /^protected\s+static\s+async\s+function\s+([\w$]+)\s*\(/, // protected静态异步方法
      /^private\s+static\s+async\s+function\s+([\w$]+)\s*\(/, // private静态异步方法
      /^public\s+static\s+async\s+([\w$]+)\s*\(/, // public静态异步方法简写
      /^protected\s+static\s+async\s+([\w$]+)\s*\(/, // protected静态异步方法简写
      /^private\s+static\s+async\s+([\w$]+)\s*\(/, // private静态异步方法简写
      // 添加无访问修饰符的方法支持
      /^([\w$]+)\s*\([^)]*\)\s*\{/, // 无访问修饰符的类方法
      /^async\s+([\w$]+)\s*\([^)]*\)\s*\{/, // 无访问修饰符的异步类方法
      /^static\s+([\w$]+)\s*\([^)]*\)\s*\{/, // 无访问修饰符的静态类方法
      /^static\s+async\s+([\w$]+)\s*\([^)]*\)\s*\{/, // 无访问修饰符的静态异步类方法
    ],
    classPattern: /^(export\s+)?class\s+([\w$]+)/, // 支持可选的export关键字，匹配 'class Test' 或 'export class Test'
    commentPatterns: [
      /^\/\//, // 单行注释
      /^\/\*\*/, // JSDoc注释
      /^\*\//, // 块注释结束
      /^\*/, // 块注释中间
    ],
  },
  php: {
    functionPatterns: [
      /^function\s+([\w$]+)\s*\(/, // 函数声明
      /^function\s+&\s*([\w$]+)\s*\(/, // 引用函数
      /^public\s+function\s+([\w$]+)\s*\(/, // public方法
      /^protected\s+function\s+([\w$]+)\s*\(/, // protected方法
      /^private\s+function\s+([\w$]+)\s*\(/, // private方法
      /^public\s+static\s+function\s+([\w$]+)\s*\(/, // public静态方法
      /^protected\s+static\s+function\s+([\w$]+)\s*\(/, // protected静态方法
      /^private\s+static\s+function\s+([\w$]+)\s*\(/, // private静态方法
      /^public\s+final\s+function\s+([\w$]+)\s*\(/, // public final方法
      /^protected\s+final\s+function\s+([\w$]+)\s*\(/, // protected final方法
      /^private\s+final\s+function\s+([\w$]+)\s*\(/, // private final方法
      /^public\s+abstract\s+function\s+([\w$]+)\s*\(/, // public抽象方法
      /^protected\s+abstract\s+function\s+([\w$]+)\s*\(/, // protected抽象方法
      /^public\s+static\s+final\s+function\s+([\w$]+)\s*\(/, // public静态final方法
      /^protected\s+static\s+final\s+function\s+([\w$]+)\s*\(/, // protected静态final方法
      /^private\s+static\s+final\s+function\s+([\w$]+)\s*\(/, // private静态final方法
      /^__construct\s*\(/, // 构造函数
      /^__destruct\s*\(/, // 析构函数
      /^__get\s*\(/, // 魔术方法get
      /^__set\s*\(/, // 魔术方法set
      /^__call\s*\(/, // 魔术方法call
      /^__callStatic\s*\(/, // 魔术方法callStatic
      /^__isset\s*\(/, // 魔术方法isset
      /^__unset\s*\(/, // 魔术方法unset
      /^__toString\s*\(/, // 魔术方法toString
      /^__invoke\s*\(/, // 魔术方法invoke
      /^__set_state\s*\(/, // 魔术方法set_state
      /^__clone\s*\(/, // 魔术方法clone
      /^__debugInfo\s*\(/, // 魔术方法debugInfo
    ],
    classPattern: /^class\s+([\w$]+)/,
    commentPatterns: [
      /^\/\//, // 单行注释
      /^#/, // 单行注释（井号）
      /^\/\*\*/, // PHPDoc注释
      /^\*\//, // 块注释结束
      /^\*/, // 块注释中间
    ],
  },
};

/**
 * 获取文件的语言类型
 * @param fileName 文件名
 * @returns 语言类型 ('js' 或 'php')
 */
function getLanguageType(fileName: string): 'js' | 'php' {
  const extension = fileName.toLowerCase();
  if (extension.endsWith('.php')) {
    return 'php';
  }
  // 默认为 JavaScript/TypeScript
  return 'js';
}

export function getEnclosingContext(
  document: vscode.TextDocument,
  lineNumber: number,
): {
  enclosingClass: string | undefined;
  enclosingFunction: string | undefined;
} {
  // 获取文档内容
  const text = document.getText();
  const lines = text.split('\n');
  const fileName = document.fileName;
  const languageType = getLanguageType(fileName);
  const patterns = LANGUAGE_PATTERNS[languageType];

  // 存储找到的类名和函数名
  let enclosingClass: string | undefined;
  let enclosingFunction: string | undefined;

  // 从当前行向上搜索
  for (let i = lineNumber; i >= 0; i--) {
    const line = lines[i].trim();

    // 跳过注释行
    if (patterns.commentPatterns.some((pattern) => pattern.test(line))) {
      continue;
    }

    // 跳过HTML标签，除了<script>标签
    if (line.startsWith('<') && !line.includes('<script')) {
      continue;
    }

    // 查找函数定义
    let foundFunction = false;
    for (const pattern of patterns.functionPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        enclosingFunction = match[1];
        foundFunction = true;
        break;
      }
    }

    if (foundFunction) {
      // 继续向上搜索，可能还有嵌套的类
      for (let j = i - 1; j >= 0; j--) {
        const classLine = lines[j].trim();
        if (
          patterns.commentPatterns.some((pattern) => pattern.test(classLine))
        ) {
          continue;
        }
        // 跳过HTML标签，除了<script>标签
        if (classLine.startsWith('<') && !classLine.includes('<script')) {
          continue;
        }
        const classMatch = classLine.match(patterns.classPattern);
        if (classMatch) {
          enclosingClass = classMatch[2];
          break;
        }
      }
      break;
    }

    // 查找类定义（如果还没有找到函数）
    if (!enclosingFunction) {
      // 跳过HTML标签，除了<script>标签
      if (!line.startsWith('<') || line.includes('<script')) {
        const classMatch = line.match(patterns.classPattern);
        if (classMatch) {
          enclosingClass = classMatch[2];
        }
      }
    }
  }

  return { enclosingClass, enclosingFunction };
}

/**
 * 检测是否为可打印的变量
 * @param text 文本内容
 * @param languageType 语言类型
 * @returns 是否为可打印的变量
 */
export function isPrintableVariable(
  text: string,
  languageType: 'js' | 'php',
): boolean {
  // 移除首尾空白
  const trimmedText = text.trim();

  // 空字符串不是变量
  if (!trimmedText) {
    return false;
  }

  // 检查是否为字符串字面量
  if (
    (trimmedText.startsWith('"') && trimmedText.endsWith('"')) ||
    (trimmedText.startsWith("'") && trimmedText.endsWith("'")) ||
    (trimmedText.startsWith('`') && trimmedText.endsWith('`'))
  ) {
    return false;
  }

  // 检查是否为数字字面量
  if (!isNaN(Number(trimmedText)) && trimmedText !== '') {
    return false;
  }

  // 检查是否为布尔字面量
  if (trimmedText === 'true' || trimmedText === 'false') {
    return false;
  }

  // 检查是否为null或undefined
  if (trimmedText === 'null' || trimmedText === 'undefined') {
    return false;
  }

  // 检查是否为PHP特殊值
  if (
    languageType === 'php' &&
    (trimmedText === 'null' ||
      trimmedText === 'true' ||
      trimmedText === 'false' ||
      trimmedText === 'array' ||
      trimmedText === 'object')
  ) {
    return false;
  }

  // 检查是否为有效的变量名或表达式
  if (languageType === 'js') {
    // JavaScript变量名或表达式
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*$/.test(
      trimmedText,
    );
  } else {
    // PHP变量名或表达式
    return /^\$?[a-zA-Z_][a-zA-Z0-9_]*(->[a-zA-Z_][a-zA-Z0-9_]*)*$/.test(
      trimmedText,
    );
  }
}
