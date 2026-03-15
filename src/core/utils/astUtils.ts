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
      /^function\s+([\w$]+)\s*\(/, // function declaration
      /^function\*\s+([\w$]+)\s*\(/, // generator function
      /^const\s+([\w$]+)\s*=\s*function\s*/, // const function expression
      /^const\s+([\w$]+)\s*=\s*\(/, // const arrow function
      /^([\w$]+)\s*=\s*function\s*/, // function expression
      /^([\w$]+)\s*=\s*\(/, // arrow function
      /^([\w$]+)\s*\([^)]*\)\s*=>/, // concise arrow function
      /^([\w$]+)\s*:\s*function\s*/, // object method function
      /^([\w$]+)\s*:\s*\(/, // object method arrow function
      /^([\w$]+)\s*:\s*\([^)]*\)\s*=>/, // object method concise arrow function
      /^static\s+function\s+([\w$]+)\s*\(/, // static method
      /^static\s+([\w$]+)\s*\(/, // static method shorthand
      /^static\s+([\w$]+)\s*:\s*function\s*/, // static object method function
      /^static\s+([\w$]+)\s*:\s*\(/, // static object method arrow function
      /^static\s+([\w$]+)\s*:\s*\([^)]*\)\s*=>/, // static object method concise arrow function
      /^get\s+([\w$]+)\s*\(/, // getter
      /^set\s+([\w$]+)\s*\(/, // setter
      /^static\s+get\s+([\w$]+)\s*\(/, // static getter
      /^static\s+set\s+([\w$]+)\s*\(/, // static setter
      /^async\s+function\s+([\w$]+)\s*\(/, // async function declaration
      /^async\s+function\*\s+([\w$]+)\s*\(/, // async generator function
      /^const\s+([\w$]+)\s*=\s*async\s*function\s*/, // async const function expression
      /^const\s+([\w$]+)\s*=\s*async\s*\(/, // async const arrow function
      /^([\w$]+)\s*=\s*async\s*function\s*/, // async function expression
      /^([\w$]+)\s*=\s*async\s*\(/, // async arrow function
      /^async\s+([\w$]+)\s*\([^)]*\)\s*=>/, // async concise arrow function
      /^async\s+([\w$]+)\s*:\s*function\s*/, // async object method function
      /^async\s+([\w$]+)\s*:\s*\(/, // async object method arrow function
      /^async\s+([\w$]+)\s*:\s*\([^)]*\)\s*=>/, // async object method concise arrow function
      /^static\s+async\s+function\s+([\w$]+)\s*\(/, // static async method
      /^static\s+async\s+([\w$]+)\s*\(/, // static async method shorthand
      /^async\s+get\s+([\w$]+)\s*\(/, // async getter
      /^async\s+set\s+([\w$]+)\s*\(/, // async setter
      /^static\s+async\s+get\s+([\w$]+)\s*\(/, // static async getter
      /^static\s+async\s+set\s+([\w$]+)\s*\(/, // static async setter
      // 添加访问修饰符支持
      /^public\s+function\s+([\w$]+)\s*\(/, // public method
      /^protected\s+function\s+([\w$]+)\s*\(/, // protected method
      /^private\s+function\s+([\w$]+)\s*\(/, // private method
      /^public\s+static\s+function\s+([\w$]+)\s*\(/, // public static method
      /^protected\s+static\s+function\s+([\w$]+)\s*\(/, // protected static method
      /^private\s+static\s+function\s+([\w$]+)\s*\(/, // private static method
      /^public\s+([\w$]+)\s*\(/, // public method shorthand
      /^protected\s+([\w$]+)\s*\(/, // protected method shorthand
      /^private\s+([\w$]+)\s*\(/, // private method shorthand
      /^public\s+static\s+([\w$]+)\s*\(/, // public static method shorthand
      /^protected\s+static\s+([\w$]+)\s*\(/, // protected static method shorthand
      /^private\s+static\s+([\w$]+)\s*\(/, // private static method shorthand
      /^public\s+get\s+([\w$]+)\s*\(/, // public getter
      /^protected\s+get\s+([\w$]+)\s*\(/, // protected getter
      /^private\s+get\s+([\w$]+)\s*\(/, // private getter
      /^public\s+set\s+([\w$]+)\s*\(/, // public setter
      /^protected\s+set\s+([\w$]+)\s*\(/, // protected setter
      /^private\s+set\s+([\w$]+)\s*\(/, // private setter
      /^public\s+async\s+function\s+([\w$]+)\s*\(/, // public async method
      /^protected\s+async\s+function\s+([\w$]+)\s*\(/, // protected async method
      /^private\s+async\s+function\s+([\w$]+)\s*\(/, // private async method
      /^public\s+async\s+([\w$]+)\s*\(/, // public async method shorthand
      /^protected\s+async\s+([\w$]+)\s*\(/, // protected async method shorthand
      /^private\s+async\s+([\w$]+)\s*\(/, // private async method shorthand
      /^public\s+static\s+async\s+function\s+([\w$]+)\s*\(/, // public static async method
      /^protected\s+static\s+async\s+function\s+([\w$]+)\s*\(/, // protected static async method
      /^private\s+static\s+async\s+function\s+([\w$]+)\s*\(/, // private static async method
      /^public\s+static\s+async\s+([\w$]+)\s*\(/, // public static async method shorthand
      /^protected\s+static\s+async\s+([\w$]+)\s*\(/, // protected static async method shorthand
      /^private\s+static\s+async\s+([\w$]+)\s*\(/, // private static async method shorthand
      // 添加无访问修饰符的方法支持
      /^([\w$]+)\s*\([^)]*\)\s*\{/, // class method without access modifier
      /^async\s+([\w$]+)\s*\([^)]*\)\s*\{/, // async class method without access modifier
      /^static\s+([\w$]+)\s*\([^)]*\)\s*\{/, // static class method without access modifier
      /^static\s+async\s+([\w$]+)\s*\([^)]*\)\s*\{/, // static async class method without access modifier
    ],
    classPattern: /^(export\s+)?class\s+([\w$]+)/, // 支持可选的export关键字，匹配 'class Test' 或 'export class Test'
    commentPatterns: [
      /^\/\//, // single line comment
      /^\/\*\*/, // JSDoc comment
      /^\*\//, // end of block comment
      /^\*/, // middle of block comment
    ],
  },
  php: {
    functionPatterns: [
      /^function\s+([\w$]+)\s*\(/, // function declaration
      /^function\s+&\s*([\w$]+)\s*\(/, // reference function
      /^public\s+function\s+([\w$]+)\s*\(/, // public method
      /^protected\s+function\s+([\w$]+)\s*\(/, // protected method
      /^private\s+function\s+([\w$]+)\s*\(/, // private method
      /^public\s+static\s+function\s+([\w$]+)\s*\(/, // public static method
      /^protected\s+static\s+function\s+([\w$]+)\s*\(/, // protected static method
      /^private\s+static\s+function\s+([\w$]+)\s*\(/, // private static method
      /^public\s+final\s+function\s+([\w$]+)\s*\(/, // public final method
      /^protected\s+final\s+function\s+([\w$]+)\s*\(/, // protected final method
      /^private\s+final\s+function\s+([\w$]+)\s*\(/, // private final method
      /^public\s+abstract\s+function\s+([\w$]+)\s*\(/, // public abstract method
      /^protected\s+abstract\s+function\s+([\w$]+)\s*\(/, // protected abstract method
      /^public\s+static\s+final\s+function\s+([\w$]+)\s*\(/, // public static final method
      /^protected\s+static\s+final\s+function\s+([\w$]+)\s*\(/, // protected static final method
      /^private\s+static\s+final\s+function\s+([\w$]+)\s*\(/, // private static final method
      /^__construct\s*\(/, // constructor
      /^__destruct\s*\(/, // destructor
      /^__get\s*\(/, // magic get
      /^__set\s*\(/, // magic set
      /^__call\s*\(/, // magic call
      /^__callStatic\s*\(/, // magic callStatic
      /^__isset\s*\(/, // magic isset
      /^__unset\s*\(/, // magic unset
      /^__toString\s*\(/, // magic toString
      /^__invoke\s*\(/, // magic invoke
      /^__set_state\s*\(/, // magic set_state
      /^__clone\s*\(/, // magic clone
      /^__debugInfo\s*\(/, // magic debugInfo
    ],
    classPattern: /^class\s+([\w$]+)/,
    commentPatterns: [
      /^\/\//, // single line comment
      /^#/, // single line comment (hash)
      /^\/\*\*/, // PHPDoc comment
      /^\*\//, // end of block comment
      /^\*/, // middle of block comment
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
    if (patterns.commentPatterns.some(pattern => pattern.test(line))) {
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
        if (patterns.commentPatterns.some(pattern => pattern.test(classLine))) {
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
      const classMatch = line.match(patterns.classPattern);
        if (classMatch) {
          enclosingClass = classMatch[2];
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
export function isPrintableVariable(text: string, languageType: 'js' | 'php'): boolean {
  // 移除首尾空白
  const trimmedText = text.trim();

  // 空字符串不是变量
  if (!trimmedText) {
    return false;
  }

  // 检查是否为字符串字面量
  if ((trimmedText.startsWith('"') && trimmedText.endsWith('"')) ||
      (trimmedText.startsWith('\'') && trimmedText.endsWith('\'')) ||
      (trimmedText.startsWith('`') && trimmedText.endsWith('`'))) {
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
  if (languageType === 'php' && (trimmedText === 'null' || trimmedText === 'true' || trimmedText === 'false' || trimmedText === 'array' || trimmedText === 'object')) {
    return false;
  }

  // 检查是否为有效的变量名或表达式
  if (languageType === 'js') {
    // JavaScript变量名或表达式
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*$/.test(trimmedText);
  } else {
    // PHP变量名或表达式
    return /^\$?[a-zA-Z_][a-zA-Z0-9_]*(->[a-zA-Z_][a-zA-Z0-9_]*)*$/.test(trimmedText);
  }
}
