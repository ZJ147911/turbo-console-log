# Quick Console 更新说明

## 项目概述

Quick Console 是一个基于 Turbo Console Log 项目开发的 VS Code 扩展，专为 JavaScript、TypeScript 和 PHP 开发者设计，提供智能日志插入和管理功能。

## 功能特性

### 智能日志插入

- **AST 驱动的精准定位** - 日志精确显示在它们所属的位置，即使在复杂代码中
- **7 种控制台方法** - 专门的命令用于 `console.log`、`console.info`、`console.debug`、`console.warn`、`console.error`、`console.table` 和来自设置的自定义日志方法
- **独立快捷键** - 每种方法都有自己的组合键，可即时访问
- **多光标支持** - 同时调试多个变量
- **可定制格式** - 控制前缀、引号、间距和上下文信息
- **多语言支持** - 支持 JavaScript、TypeScript 和 PHP

### 日志管理

- **注释所有日志** - 静音当前文件中的所有日志
- **取消注释所有日志** - 恢复已注释的日志
- **删除所有日志** - 从当前文件中删除所有日志
- **修正日志消息** - 在重构后自动更新文件名和行号

### 多语言支持

- **JavaScript/TypeScript**：所有控制台方法和来自设置的自定义日志方法
- **PHP**：`var_dump()`、`print_r()`、`error_log()` 和来自设置的自定义日志方法
- **自定义函数**：您自己的日志函数，任何语言

## 技术实现

### 项目结构

```
src/
├── commands/       # 命令实现
├── core/           # 核心功能
├── debug-message/  # 调试消息处理
├── notifications/  # 通知功能
├── types/          # 类型定义
├── extension.ts    # 扩展入口
└── helpers.ts      # 辅助函数
```

### 核心功能

1. **命令注册系统** - 使用 `CommandRegistry` 类管理所有命令
2. **调试消息处理器** - 分别为 JavaScript 和 PHP 提供调试消息处理
3. **配置管理** - 从 VS Code 工作区配置中获取扩展属性
4. **多语言支持** - 通过不同的调试消息处理器支持多种语言

### 命令系统

- **插入日志命令** - 为不同类型的日志提供专用命令
- **日志管理命令** - 提供注释、取消注释、删除和修正日志的功能
- **快捷键绑定** - 为所有命令提供默认快捷键

## 配置选项

Quick Console 提供了丰富的配置选项：

- **日志消息格式** - 自定义前缀、后缀和分隔符
- **引号样式** - 单引号、双引号或反引号
- **上下文信息** - 包含/排除文件名、行号、类和函数名
- **间距与格式** - 日志前后的空行、包装消息、分号
- **自定义日志函数** - 使用您自己的日志函数代替控制台方法

## 安装与使用

### 安装

1. 在 VS Code 中打开扩展面板（`Ctrl+Shift+X`）
2. 搜索 "Quick Console"
3. 点击 "安装" 按钮
4. 安装完成后点击 "重新加载" 按钮

### 使用方法

1. **插入日志**：选择要记录的变量，使用相应的快捷键（例如 `Ctrl+K Ctrl+L` 插入 `console.log`）
2. **管理日志**：使用相应的快捷键管理日志（`Alt+Shift+C` 注释所有日志，`Alt+Shift+U` 取消注释所有日志，`Alt+Shift+D` 删除所有日志，`Alt+Shift+X` 修正所有日志）

## 快捷键

### 插入日志

- **插入 console.log** – `Ctrl+K Ctrl+L` (Windows/Linux) / `Cmd+K Cmd+L` (Mac)
- **插入 console.info** – `Ctrl+K Ctrl+N` (Windows/Linux) / `Cmd+K Cmd+N` (Mac)
- **插入 console.debug** – `Ctrl+K Ctrl+B` (Windows/Linux) / `Cmd+K Cmd+B` (Mac)
- **插入 console.table** – `Ctrl+K Ctrl+T` (Windows/Linux) / `Cmd+K Cmd+T` (Mac)
- **插入 console.warn** – `Ctrl+K Ctrl+R` (Windows/Linux) / `Cmd+K Cmd+R` (Mac)
- **插入 console.error** – `Ctrl+K Ctrl+E` (Windows/Linux) / `Cmd+K Cmd+E` (Mac)
- **插入自定义日志** – `Ctrl+K Ctrl+K` (Windows/Linux) / `Cmd+K Cmd+K` (Mac)

### 管理日志

- **注释所有日志** – `Alt+Shift+C` (Windows/Linux) / `Alt+Shift+C` (Mac)
- **取消注释所有日志** – `Alt+Shift+U` (Windows/Linux) / `Alt+Shift+U` (Mac)
- **删除所有日志** – `Alt+Shift+D` (Windows/Linux) / `Alt+Shift+D` (Mac)
- **修正所有日志** – `Alt+Shift+X` (Windows/Linux) / `Alt+Shift+X` (Mac)

## 开发与贡献

### 开发环境设置

1. 克隆仓库：`git clone git@github.com:ZJ147911/turbo-console-log.git`
2. 安装依赖：`pnpm install`
3. 启动开发服务器：`pnpm run watch`
4. 按 `F5` 启动扩展进行调试

### 构建与发布

1. 构建扩展：`pnpm run vscode:prepublish`
2. 创建 VSIX 包：使用 VS Code 的扩展开发工具或 `vsce package` 命令

### 贡献指南

- 报告问题：在 GitHub 仓库中创建 issue
- 提交代码：创建分支并提交拉取请求
- 功能建议：在 GitHub 仓库中创建 issue 提出建议

## 许可证

Quick Console 基于 Turbo Console Log 项目开发，使用相同的许可证。

## 联系方式

- **邮箱**：zj147911@foxmail.com
- **仓库**：https://github.com/ZJ147911/turbo-console-log

## 更新日志

### v3.17.0

- 重命名为 Quick Console
- 更新仓库信息和联系方式
- 优化代码结构和性能
- 修复已知问题

### 参考项目

- [Turbo Console Log](https://github.com/Chakroun-Anas/turbo-console-log) - 原始项目，提供了核心功能和灵感
