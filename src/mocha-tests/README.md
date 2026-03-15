# 🧪 Turbo Console Log – Mocha 测试

此文件夹包含在真实 VSCode 实例中执行扩展的 **集成测试**。
我们在这里使用 **Mocha**，因为它与官方的 [VSCode 扩展测试运行器](https://code.visualstudio.com/api/working-with-extensions/testing-extension) 兼容。

## 🔧 测试框架

### **Mocha**

[Mocha](https://mochajs.org/) 是一个灵活、成熟的测试运行器，支持：

- 异步测试执行
- TDD 和 BDD 语法
- 生命周期钩子 (`before`, `after`, `beforeEach`, `afterEach`)

### **Chai**

[Chai](https://www.chaijs.com/) 使用 `expect`、`should` 或 `assert` 提供表达性断言。

## 📁 文件夹结构

```
mocha-tests/
├── files/                   # 集成测试中使用的测试夹具文件
├── integration/             # VSCode 扩展集成测试
│   └── insert-log/
│       └── insertLogAtCursor.test.ts
├── unit/                    # (已弃用) 基于 Mocha 的单元测试（正在迁移到 Jest）
├── runTests.ts              # 入口点
├── testsRunner.ts           # Mocha 运行器加载器
└── README.md                # 您在此处
```

## 🧬 编写测试

- 使用 `.test.ts` 后缀。
- 将测试文件放在 `integration/` 或 `unit/` 目录中。
- 利用 `helpers/` 中的辅助函数，如：
  - `expectActiveTextEditorWithFile`
  - `documentLinesChanged`

## 🚀 运行测试

### ▶️ 通过 CLI（无头）

```bash
npm run test
```

> ⚠️ VSCode **必须关闭** 才能正确运行 CLI 集成测试。

### 🐞 使用调试器（推荐）

1. 运行 `npm run test:compile`
2. 在 VSCode 中打开 **调试视图**
3. 从启动下拉菜单中选择 **VSCode 集成测试**
4. 按 **F5** 开始调试

要运行单个测试文件，请使用 `.only`（例如 `it.only(...)`）
只是不要忘记在提交前删除它 😉