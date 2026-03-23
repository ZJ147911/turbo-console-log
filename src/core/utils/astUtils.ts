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
      // export 导出的函数（优先匹配，避免被其它模式漏掉）
      /^export\s+async\s+function\s+([\w$]+)\s*\(/, // export async function name(
      /^export\s+function\s+([\w$]+)\s*\(/, // export function name(
      /^export\s+function\*\s+([\w$]+)\s*\(/, // export function* name(
      /^export\s+default\s+async\s+function\s+([\w$]+)\s*\(/, // export default async function name(
      /^export\s+default\s+function\s+([\w$]+)\s*\(/, // export default function name(
      // export 导出的 const 函数（箭头函数 / function 表达式）
      /^export\s+const\s+([\w$]+)\s*=\s*async\s*function\s*/, // export const name = async function
      /^export\s+const\s+([\w$]+)\s*=\s*async\s*\(/, // export const name = async (
      /^export\s+const\s+([\w$]+)\s*=\s*function\s*/, // export const name = function
      /^export\s+const\s+([\w$]+)\s*=\s*function\*/, // export const name = function*
      /^export\s+const\s+([\w$]+)\s*=\s*\(/, // export const name = (
      /^function\s+([\w$]+)\s*\(/, // 函数声明
      /^function\*\s+([\w$]+)\s*\(/, // 生成器函数
      /^const\s+([\w$]+)\s*=\s*function\s*/, // const函数表达式
      /^const\s+([\w$]+)\s*=\s*\(/, // const箭头函数
      /^([\w$]+)\s*=\s*function\s*/, // 函数表达式
      /^([\w$]+)\s*=\s*\(/, // 箭头函数
      /^([\w$]+)\s*\([^)]*\)\s*=>/, // 简洁箭头函数
      /*
       * 对象字面量中的方法（属性值函数）：getEnclosingContext 向上扫描时须先于「类方法」等宽泛规则匹配，
       * 否则在 obj = { fn() { … } } 内打日志时 enclosingFunction 会错挂到外层。
       * 顺序要求：命名 function（捕获内部名）须排在「key: function」匿名形式之前。
       */
      /^[\w$]+\s*:\s*async\s+function\s+([\w$]+)\s*\(/, // key: async function innerName(
      /^[\w$]+\s*:\s*function\s+([\w$]+)\s*\(/, // key: function innerName(
      /^([\w$]+)\s*:\s*function\s*/, // key: function (…) 匿名，用属性名
      /^([\w$]+)\s*:\s*\(/, // key: (…) => 或 key: (
      /^([\w$]+)\s*:\s*\([^)]*\)\s*=>/, // key: (a) =>
      /^\*\s*([\w$]+)\s*\([^)]*\)\s*\{/, // * generatorMethod() { … }
      /^([\w$]+)\s*\?\s*\([^)]*\)\s*\{/, // TS: optionalMethod?() { … }
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
      // 添加无访问修饰符的方法支持（含 TS 返回类型注解）
      /^([\w$]+)\s*\([^)]*\)\s*\{/, // 无访问修饰符的类方法
      /^([\w$]+)\s*\([^)]*\)\s*:\s*[^;{=>]+\s*\{/, // 无访问修饰符的类方法（TS 返回类型）
      /^async\s+([\w$]+)\s*\([^)]*\)\s*\{/, // 无访问修饰符的异步类方法
      /^async\s+([\w$]+)\s*\([^)]*\)\s*:\s*[^;{=>]+\s*\{/, // 无访问修饰符的异步类方法（TS 返回类型）
      /^static\s+([\w$]+)\s*\([^)]*\)\s*\{/, // 无访问修饰符的静态类方法
      /^static\s+([\w$]+)\s*\([^)]*\)\s*:\s*[^;{=>]+\s*\{/, // 无访问修饰符的静态类方法（TS 返回类型）
      /^static\s+async\s+([\w$]+)\s*\([^)]*\)\s*\{/, // 无访问修饰符的静态异步类方法
      /^static\s+async\s+([\w$]+)\s*\([^)]*\)\s*:\s*[^;{=>]+\s*\{/, // 无访问修饰符的静态异步类方法（TS 返回类型）
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

/** 预编译：JS 非函数定义行（interface/type/namespace/module）匹配 */
const JS_SKIP_LINE_REGEX =
  /^(?:export\s+)?(?:declare\s+)?(?:interface|type|namespace|module)\b/;

/**
 * 获取文件的语言类型
 * @param fileName 文件名
 * @returns 语言类型 ('js' 或 'php')
 */
function getLanguageType(fileName: string): 'js' | 'php' {
  return fileName.toLowerCase().endsWith('.php') ? 'php' : 'js';
}

/** 匹配到“函数形式”但不是真正函数名的关键字（if/for/try 等），不当作 enclosingFunction 输出 */
/**
 * 判断 JS 行是否应跳过（非函数定义，如 interface/type/namespace/module 声明或仅签名的行）
 * 与构建产物 hs() 逻辑一致
 */
function isSkipLineForJs(line: string): boolean {
  if (!line) return false;
  return (
    JS_SKIP_LINE_REGEX.test(line) ||
    (line.endsWith(';') &&
      line.includes('(') &&
      !line.includes('{') &&
      !line.includes('=>'))
  );
}

const JS_BLOCK_KEYWORDS = new Set([
  'if',
  'else',
  'for',
  'foreach',
  'while',
  'do',
  'switch',
  'case',
  'try',
  'catch',
  'finally',
  'with',
]);
const PHP_BLOCK_KEYWORDS = new Set([
  'if',
  'elseif',
  'else',
  'for',
  'foreach',
  'while',
  'do',
  'switch',
  'case',
  'try',
  'catch',
  'finally',
]);

/**
 * 当无名函数 / 无名箭头函数作为「函数调用的参数」时，用左侧最终赋值名作为 enclosingFunction
 *（例如 const searchResult = debounceFn(() => { ... }) 内打日志 → searchResult）。
 * 支持单行写法与「调用括号在上一行、下一行才是 () =>」的多行写法。
 */
function getAssignmentNameWhenCallHasAnonymousCallback(
  line: string,
  nextLine: string | undefined,
): string | undefined {
  /** 调用左侧的 callee（可含 new、链式 a.b） */
  const callee = '(?:new\\s+)?[\\w$.]+';
  const sameLinePatterns: RegExp[] = [
    new RegExp(
      `^export\\s+const\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*\\(\\s*\\)\\s*=>`,
    ),
    new RegExp(
      `^export\\s+const\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*\\([^)]*\\)\\s*=>`,
    ),
    new RegExp(
      `^export\\s+const\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*function\\s*\\(`,
    ),
    new RegExp(
      `^export\\s+const\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*async\\s*\\(\\s*\\)\\s*=>`,
    ),
    new RegExp(
      `^export\\s+const\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*async\\s+function\\s*\\(`,
    ),
    new RegExp(
      `^const\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*\\(\\s*\\)\\s*=>`,
    ),
    new RegExp(
      `^const\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*\\([^)]*\\)\\s*=>`,
    ),
    new RegExp(
      `^const\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*function\\s*\\(`,
    ),
    new RegExp(
      `^const\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*async\\s*\\(\\s*\\)\\s*=>`,
    ),
    new RegExp(
      `^const\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*async\\s+function\\s*\\(`,
    ),
    new RegExp(
      `^let\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*\\(\\s*\\)\\s*=>`,
    ),
    new RegExp(
      `^let\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*\\([^)]*\\)\\s*=>`,
    ),
    new RegExp(`^let\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*function\\s*\\(`),
    new RegExp(
      `^let\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*async\\s*\\(\\s*\\)\\s*=>`,
    ),
    new RegExp(
      `^let\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*async\\s+function\\s*\\(`,
    ),
    new RegExp(
      `^var\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*\\(\\s*\\)\\s*=>`,
    ),
    new RegExp(
      `^var\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*\\([^)]*\\)\\s*=>`,
    ),
    new RegExp(`^var\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*function\\s*\\(`),
    new RegExp(
      `^var\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*async\\s*\\(\\s*\\)\\s*=>`,
    ),
    new RegExp(
      `^var\\s+([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*async\\s+function\\s*\\(`,
    ),
    new RegExp(`^([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*\\(\\s*\\)\\s*=>`),
    new RegExp(`^([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*\\([^)]*\\)\\s*=>`),
    new RegExp(`^([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*function\\s*\\(`),
    new RegExp(
      `^([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*async\\s*\\(\\s*\\)\\s*=>`,
    ),
    new RegExp(
      `^([\\w$]+)\\s*=\\s*${callee}\\s*\\(\\s*async\\s+function\\s*\\(`,
    ),
  ];
  for (const re of sameLinePatterns) {
    const m = line.match(re);
    if (m) {
      return m[1];
    }
  }

  const next = nextLine?.trim() ?? '';
  const nextLooksLikeAnonymousArg =
    /^\(\s*\)\s*=>/.test(next) ||
    /^\([^)]*\)\s*=>/.test(next) ||
    /^async\s*\(\s*\)\s*=>/.test(next) ||
    /^async\s*\([^)]*\)\s*=>/.test(next) ||
    /^function\s*\(/.test(next) ||
    /^async\s+function\s*\(/.test(next);

  if (nextLooksLikeAnonymousArg) {
    const mExport = line.match(
      /^export\s+const\s+([\w$]+)\s*=\s*[\w$.]+\s*\(\s*$/,
    );
    if (mExport) {
      return mExport[1];
    }
    const mDecl = line.match(
      /^(?:const|let|var)\s+([\w$]+)\s*=\s*[\w$.]+\s*\(\s*$/,
    );
    if (mDecl) {
      return mDecl[1];
    }
    const mRe = line.match(/^([\w$]+)\s*=\s*[\w$.]+\s*\(\s*$/);
    if (mRe) {
      return mRe[1];
    }
  }

  return undefined;
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

    // 跳过 JS 非函数定义行（interface/type/namespace/module 声明或仅签名的行）
    if (languageType === 'js' && isSkipLineForJs(line)) {
      continue;
    }

    // 查找函数定义（匹配到的名称若是 if/try/for 等块关键字则忽略，继续向上找）
    let foundFunction = false;
    const blockKeywords =
      languageType === 'js' ? JS_BLOCK_KEYWORDS : PHP_BLOCK_KEYWORDS;

    if (languageType === 'js') {
      const assignmentName = getAssignmentNameWhenCallHasAnonymousCallback(
        line,
        lines[i + 1],
      );
      if (assignmentName && !blockKeywords.has(assignmentName)) {
        enclosingFunction = assignmentName;
        foundFunction = true;
      }
    }

    if (!foundFunction) {
      for (const pattern of patterns.functionPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const name = match[1];
          if (blockKeywords.has(name)) continue;
          enclosingFunction = name;
          foundFunction = true;
          break;
        }
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
          enclosingClass = (classMatch[2] ?? classMatch[1]) as string;
          break;
        }
      }
      break;
    }

    // 查找类定义（如果还没有找到函数）
    if (
      !enclosingFunction &&
      (!line.startsWith('<') || line.includes('<script'))
    ) {
      const classMatch = line.match(patterns.classPattern);
      if (classMatch) {
        enclosingClass = (classMatch[2] ?? classMatch[1]) as string;
      }
    }
  }

  return { enclosingClass, enclosingFunction };
}

// 可打印变量校验：字面量与保留字集合（用 Set 做 O(1) 查找，避免误把字面量/关键字当变量插入日志）
/** JS 字面量：这些不应作为“变量”插入 log */
const JS_LITERALS = new Set([
  'true',
  'false',
  'null',
  'undefined',
  'NaN',
  'Infinity',
]);
/** JS 保留字：关键字不能作为变量名插入 log */
const JS_RESERVED = new Set([
  'const',
  'let',
  'var',
  'function',
  'class',
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'return',
  'new',
  'this',
  'typeof',
  'instanceof',
  'in',
  'of',
  'throw',
  'try',
  'catch',
  'finally',
  'break',
  'continue',
  'default',
  'export',
  'import',
  'from',
  'extends',
  'static',
  'async',
  'await',
  'yield',
  'get',
  'set',
  'delete',
  'void',
]);
/** PHP 字面量/类型名：不作为变量插入 log */
const PHP_LITERALS = new Set(['null', 'true', 'false', 'array', 'object']);

/**
 * 剥离 TypeScript 类型语法，提取实际变量部分
 * 支持：variable as Type、variable satisfies Interface、以及末尾的 ! 非空断言
 * @param text 可能包含 TS 类型注解的文本
 * @returns 剥离类型后的变量部分
 */
export function stripTsTypeSyntax(text: string): string {
  let result = text.trim();
  // 剥离 " as Type" 或 " satisfies Type"
  const asMatch = result.match(/\s+as\s+/);
  const satisfiesMatch = result.match(/\s+satisfies\s+/);
  let cutIndex = result.length;
  if (asMatch && asMatch.index !== undefined) {
    cutIndex = Math.min(cutIndex, asMatch.index);
  }
  if (satisfiesMatch && satisfiesMatch.index !== undefined) {
    cutIndex = Math.min(cutIndex, satisfiesMatch.index);
  }
  result = result.substring(0, cutIndex).trim();
  // 剥离非空断言 !（如 obj!、obj!.prop）
  return result.replace(/!+/g, '');
}

// 变量形式正则：模块级常量，只编译一次
/** JS/TS：支持 identifier、obj.prop、obj?.prop、arr[0]、obj['key']、obj["key"] */
const JS_VARIABLE_PATTERN =
  /^[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*|\?\.[a-zA-Z_$][a-zA-Z0-9_$]*|\[\s*(?:[a-zA-Z0-9_$]+|'[^']*'|"[^"]*")\s*\])*$/;
// PHP：支持 $var、$obj->prop、$arr[0]、$arr['key']、$obj->prop['key']
const PHP_VARIABLE_PATTERN =
  /^\$?[a-zA-Z_][a-zA-Z0-9_]*(?:->[a-zA-Z_][a-zA-Z0-9_]*(?:\[\s*[a-zA-Z0-9_$'"]+\s*\])*|\[\s*[a-zA-Z0-9_$'"]+\s*\])*$/;

/**
 * 检测是否为可打印的变量
 * 支持：简单标识符、成员链、可选链、下标/括号访问；排除字面量与保留字
 * @param text 文本内容
 * @param languageType 语言类型
 * @returns 是否为可打印的变量
 */
export function isPrintableVariable(
  text: string,
  languageType: 'js' | 'php',
): boolean {
  const trimmedText = text.trim();

  if (trimmedText.length === 0) {
    return false;
  }

  // 仅允许单行（多行视为表达式，不当作单一变量）
  if (trimmedText.includes('\n')) {
    return false;
  }

  // 字符串字面量：首尾为 " (0x22) / ' (0x27) / ` (0x60) 的视为字符串，不插入 log
  const first = trimmedText.charCodeAt(0);
  const last = trimmedText.charCodeAt(trimmedText.length - 1);
  if (
    (first === 0x22 && last === 0x22) ||
    (first === 0x27 && last === 0x27) ||
    (first === 0x60 && last === 0x60)
  ) {
    return false;
  }

  // 数字字面量：能按数字解析且形如数字/十六进制/Infinity/NaN 的排除
  const num = Number(trimmedText);
  if (
    !Number.isNaN(num) &&
    /^-?(?:\d|\.\d|\d\.|0x[\da-fA-F]|Infinity|NaN)/i.test(trimmedText)
  ) {
    return false;
  }

  if (languageType === 'js') {
    // 忽略 TS 类型语法：剥离 as/satisfies/! 后再校验
    const varPart = stripTsTypeSyntax(trimmedText);
    if (varPart.length === 0) return false;
    if (JS_LITERALS.has(varPart) || JS_RESERVED.has(varPart)) {
      return false;
    }
    return JS_VARIABLE_PATTERN.test(varPart);
  }

  // PHP：先排除字面量，再按变量形式正则校验
  if (PHP_LITERALS.has(trimmedText)) {
    return false;
  }
  return PHP_VARIABLE_PATTERN.test(trimmedText);
}
