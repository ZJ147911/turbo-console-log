/**
 * 日志消息类型枚举
 */
export enum LogMessageType {
  /** 数组赋值 */
  ArrayAssignment = 'ArrayAssignment',
  /** 命名函数赋值 */
  NamedFunctionAssignment = 'NamedFunctionAssignment',
  /** 原始属性访问 */
  RawPropertyAccess = 'RawPropertyAccess',
  /** 函数调用赋值 */
  FunctionCallAssignment = 'FunctionCallAssignment',
  /** 对象函数调用赋值 */
  ObjectFunctionCallAssignment = 'ObjectFunctionCallAssignment',
  /** 对象字面量 */
  ObjectLiteral = 'ObjectLiteral',
  /** 原始类型赋值 */
  PrimitiveAssignment = 'PrimitiveAssignment',
  /** 三元表达式 */
  Ternary = 'Ternary',
  /** 二元表达式 */
  BinaryExpression = 'BinaryExpression',
  /** 模板字符串 */
  TemplateString = 'TemplateString',
  /** 属性访问赋值 */
  PropertyAccessAssignment = 'PropertyAccessAssignment',
  /** 函数参数 */
  FunctionParameter = 'FunctionParameter',
  /** 属性方法调用 */
  PropertyMethodCall = 'PropertyMethodCall',
  /** 在 return 语句内 */
  WithinReturnStatement = 'WithinReturnStatement',
  /** 在条件块内 */
  WithinConditionBlock = 'WithinConditionBlock',
  /** 游离表达式 */
  WanderingExpression = 'WanderingExpression',
}

/**
 * 日志上下文元数据类型
 */
export type LogContextMetadata = {
  /** 开始上下文行号 */
  openingContextLine: number;
  /** 结束上下文行号 */
  closingContextLine: number;
  /** 深层对象行号 */
  deepObjectLine: number;
  /** 深层对象路径 */
  deepObjectPath: string;
};

/**
 * 命名函数元数据类型
 */
export type NamedFunctionMetadata = {
  /** 行号 */
  line: number;
};

/**
 * 三元表达式元数据类型
 */
export type TernaryExpressionMetadata = {
  /** 行数 */
  lines: number;
};

/**
 * return 语句内的元数据类型
 */
export type WithinReturnStatementMetadata = {
  /** return 语句行号 */
  returnStatementLine: number;
};

/**
 * 日志消息类型
 */
export type LogMessage = {
  /** 日志消息类型 */
  logMessageType: LogMessageType;
  /** 元数据（可选） */
  metadata?:
    | LogContextMetadata
    | NamedFunctionMetadata
    | TernaryExpressionMetadata
    | WithinReturnStatementMetadata
    | unknown;
};
