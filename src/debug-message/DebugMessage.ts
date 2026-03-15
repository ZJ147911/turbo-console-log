import { TextDocument, TextEditorEdit } from 'vscode';

import { ExtensionProperties, Message } from '@/entities';

/**
 * 调试消息处理器接口
 * 定义了生成和检测调试消息的方法
 */
export interface DebugMessage {
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
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    tabSize: number,
    extensionProperties: ExtensionProperties,
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
    logFunction: ExtensionProperties['logFunction'],
    logMessagePrefix: ExtensionProperties['logMessagePrefix'],
    delimiterInsideMessage: ExtensionProperties['delimiterInsideMessage'],
  ): Promise<Message[]>;
}
