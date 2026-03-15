# ✅ Turbo Console Log – Jest 测试

此文件夹包含由 **Jest** 驱动的 **单元和集成测试**。

## 🧪 测试框架

[Jest](https://jestjs.io/) 是一个现代测试框架，提供：

- 快速且隔离的测试执行
- 快照测试
- 内置模拟工具
- 清晰可读的错误输出
- 通过 `ts-jest` 提供一流的 TypeScript 支持

## 📁 文件夹结构

```
jest-tests/
├── unit/                         # 按逻辑/功能划分的单元测试
│   └── js/
│       └── loc-processing/
│           ├── object/
│           │   └── assignment.test.ts
│           ├── function/
│           │   ├── function-name.test.ts
│           │   └── function-call.test.ts
├── commands/
│   └── getAllCommands.test.ts    # 命令级逻辑测试
├── mocks/                        # 手动 Jest 模拟
│   └── vscode.ts
├── tsconfig.json                 # Jest 特定的 TypeScript 配置
└── README.md
```

## 🧬 编写测试

- 所有测试文件使用 `.test.ts` 扩展名。
- 按 **功能** 或 **逻辑域** 分组。
- 必要时使用 `jest.mock()` 隔离依赖项。
- 如果您的 `tsconfig` 包含 `@types/jest`，则 **不需要导入** `describe`、`test` 或 `expect`。

## 🚀 运行测试

```bash
npm run test:jest
```