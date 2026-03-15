/// <reference types="vscode" />

/**
 * 调试消息接口
 * 定义了生成和插入调试消息的方法
 */
interface DebugMessage {
  /**
   * 生成调试消息并插入到编辑器中
   * @param textEditor 文本编辑器编辑对象
   * @param document 文本文档
   * @param selectedVar 选中的变量
   * @param lineOfSelectedVar 选中变量的行号
   * @param tabSize 制表符大小
   * @param extensionProperties 扩展配置属性
   * @param logFunction 日志函数名称
   */
  msg(
    textEditor: import('vscode').TextEditorEdit,
    document: import('vscode').TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    tabSize: number,
    extensionProperties: QuickConsole.ExtensionProperties,
    logFunction: string,
  ): void;

  /**
   * 检测文件中的所有日志消息
   * @param fs 文件系统模块
   * @param vscode VS Code 模块
   * @param filePath 文件路径
   * @param logFunction 日志函数名称
   * @param logMessagePrefix 日志消息前缀
   * @param delimiterInsideMessage 消息内部的分隔符
   * @returns 检测到的消息数组
   */
  detectAll(
    fs: typeof import('fs'),
    vscode: typeof import('vscode'),
    filePath: string,
    logFunction: QuickConsole.ExtensionProperties['logFunction'],
    logMessagePrefix: QuickConsole.ExtensionProperties['logMessagePrefix'],
    delimiterInsideMessage: QuickConsole.ExtensionProperties['delimiterInsideMessage'],
  ): Promise<QuickConsole.Message[]>;
}

declare namespace QuickConsole {
  /**
   * 扩展配置属性类型
   */
  type ExtensionProperties = {
    /** 是否包装日志消息 */
    wrapLogMessage: boolean;
    /** 日志消息前缀 */
    logMessagePrefix: string;
    /** 日志消息后缀 */
    logMessageSuffix: string;
    /** 是否在末尾添加分号 */
    addSemicolonInTheEnd: boolean;
    /** 是否插入包含的类名 */
    insertEnclosingClass: boolean;
    /** 是否启用日志修正通知 */
    logCorrectionNotificationEnabled: boolean;
    /** 是否插入包含的函数名 */
    insertEnclosingFunction: boolean;
    /** 是否在日志消息前插入空行 */
    insertEmptyLineBeforeLogMessage: boolean;
    /** 是否在日志消息后插入空行 */
    insertEmptyLineAfterLogMessage: boolean;
    /** 消息内部的分隔符 */
    delimiterInsideMessage: string;
    /** 是否包含文件名 */
    includeFilename: boolean;
    /** 是否包含行号 */
    includeLineNum: boolean;
    /** 引号类型 */
    quote: string;
    /** 日志函数名称 */
    logFunction: string;
  };

  /**
   * 命令处理函数的属性类型
   */
  type CommandHandlerProperties = {
    /** VS Code 扩展上下文 */
    context: import('vscode').ExtensionContext;
    /** 扩展配置属性 */
    extensionProperties: ExtensionProperties;
    /** JavaScript 调试消息处理器 */
    jsDebugMessage: {
      msg: (
        textEditor: import('vscode').TextEditorEdit,
        document: import('vscode').TextDocument,
        selectedVar: string,
        lineOfSelectedVar: number,
        tabSize: number,
        extensionProperties: ExtensionProperties,
        logFunction: string,
      ) => void;
      detectAll: (
        fs: any,
        vscode: any,
        filePath: string,
        logFunction: string,
        logMessagePrefix: string,
        delimiterInsideMessage: string,
      ) => Promise<Message[]>;
    };
    /** PHP 调试消息处理器 */
    phpDebugMessage?: {
      msg: (
        textEditor: import('vscode').TextEditorEdit,
        document: import('vscode').TextDocument,
        selectedVar: string,
        lineOfSelectedVar: number,
        tabSize: number,
        extensionProperties: ExtensionProperties,
        logFunction: string,
      ) => void;
      detectAll: (
        fs: any,
        vscode: any,
        filePath: string,
        logFunction: string,
        logMessagePrefix: string,
        delimiterInsideMessage: string,
      ) => Promise<Message[]>;
    };
    /** 命令参数（可选） */
    args?: string[];
  };

  /**
   * 命令类型定义
   */
  type Command = {
    /** 命令名称 */
    name: string;
    /** 命令处理函数 */
    handler: (
      commandHandlerProperties: CommandHandlerProperties,
    ) => Promise<void>;
  };

  /**
   * 消息类型定义
   */
  type Message = {
    /** 空格字符串 */
    spaces: string;
    /** 消息所在的行范围数组 */
    lines: string[];
    /** 是否被注释（可选） */
    isCommented?: boolean;
    /** 使用的日志函数（可选），例如 'console.log', 'console.warn', 'console.error' */
    logFunction?: string;
    /** 是否是由 Turbo Console Log 插入的日志（包含前缀和分隔符） */
    isQuickConsole?: boolean;
  };

  /**
   * 编程语言类型
   */
  const ProgrammingLanguage = {
    JAVASCRIPT: 'javascript',
    TYPESCRIPT: 'typescript',
    PHP: 'php',
  } as const;

  type ProgrammingLanguage =
    (typeof ProgrammingLanguage)[keyof typeof ProgrammingLanguage];

  /**
   * 块类型
   */
  const BlockType = {
    FUNCTION: 'function',
    CLASS: 'class',
    LOOP: 'loop',
    CONDITIONAL: 'conditional',
    TRY_CATCH: 'try-catch',
    ARROW_FUNCTION: 'arrow-function',
  } as const;

  type BlockType = (typeof BlockType)[keyof typeof BlockType];

  /**
   * 括号类型
   */
  const BracketType = {
    CURLY: 'curly',
    SQUARE: 'square',
    ROUND: 'round',
  } as const;

  type BracketType = (typeof BracketType)[keyof typeof BracketType];

  /**
   * 日志括号类型
   */
  type LogBracket = {
    /** 开括号 */
    open: string;
    /** 闭括号 */
    close: string;
  };

  /**
   * 日志消息类型
   */
  type LogMessage = {
    /** 消息内容 */
    message: string;
    /** 消息元数据 */
    metadata: Record<string, string | number | boolean>;
  };

  /**
   * 多行上下文变量类型
   */
  type MultilineContextVariable = {
    /** 变量名 */
    name: string;
    /** 变量值 */
    value: string;
    /** 变量所在的行号 */
    line: number;
  };
}
