# 代码关系导入器（`/drawio code-import`）

代码导入器把一个受限的本地项目目录转换为 `CanonicalGraphProjection v1`，再复用 canonical YAML 校验、JavaScript ELK、渲染与 XML 校验。它们不执行源码、不调用 Graphviz、也不调用 Python 包管理器、`go`、`cargo` 或 `rustc`。

用这个 route 从本地 Python、JavaScript/TypeScript、Go 或 Rust 项目渲染 module import 或 class 继承关系。

## 支持的输入

| 语言 | `--input-format` | 抽取内容 |
|---|---|---|
| Python imports | `python-imports` | 项目内 import |
| Python classes | `python-classes` | 顶层 class 继承 |
| JavaScript/TypeScript ESM | `js-imports` | static、side-effect、export-from、字符串字面量 dynamic import |
| Go package | `go-imports` | `import_spec` package 边 |
| Rust 模块 | `rust-imports` | `crate`/`self`/`super` use 树 |

输入必须是**本地目录**；不支持 stdin。扫描按序进行、不跟随 symlink、跳过隐藏及 cache/vendor/build 目录，并受限于 **500 个文件、单文件 1 MiB、所选源合计 4 MiB**。

## CLI

```bash
node skills/drawio/scripts/cli.js src/python output.drawio --input-format python-imports --validate
node skills/drawio/scripts/cli.js src/python output.drawio --input-format python-classes --validate
node skills/drawio/scripts/cli.js src/web output.drawio --input-format js-imports --validate
node skills/drawio/scripts/cli.js src/go output.drawio --input-format go-imports --validate
node skills/drawio/scripts/cli.js src/rust output.drawio --input-format rust-imports --validate
```

## Parser 范围

- **Python 3.11+** 使用隔离的 stdlib `ast` worker 抽取 import 与顶层 class 继承，使用固定脚本、受限 JSON stdin/stdout、10 秒超时、`shell: false`、固定 cwd 与最小环境。
- **JavaScript/TypeScript** 使用精确固定的 `es-module-lexer@2.3.1`。
- **Go** 使用精确固定的 `tree-sitter@0.21.1` 与 `tree-sitter-go@0.23.4`；由极简 `go.mod` grammar 提供单一 module path——不使用任何 Go 工具链。
- **Rust** 使用精确固定的 `tree-sitter@0.21.1` 与 `tree-sitter-rust@0.23.0`；不使用任何 Rust 工具链。

Node parser 包是精确固定的 optional 依赖，仅由各自 route 加载。缺少绑定返回 `OPTIONAL_DEPENDENCY_MISSING`。它们均为 MIT 许可；Tree-sitter 包含原生绑定，需要 Node 20 安装覆盖。

## 稳定身份与限制

module 身份是"语言 + canonical 项目相对 POSIX path"。Go package 身份用 package 目录（根为 `_root`）。Python class 身份在其 module 身份上追加顶层限定 class 名。绝对 checkout 根、label 与遍历顺序永不用于标识节点。

以下**不解析**（失败或给出明确诊断，绝不谎称支持）：

- CommonJS、TypeScript path alias 以及 monorepo/package 解析。
- Go workspace 与 `replace` 语义。
- Rust workspace、多 crate 根、`cfg`、`#[path]`、inline module 与 edition 歧义的裸路径。

不支持的内部引用会失败，而不是静默丢边；被忽略的外部/stdlib/非相对依赖产生聚合诊断。

## 证据边界

各语言 fixture、worker/parser 命令路径、JavaScript ELK 与 XML 校验属于命令证据。大型仓库语料、Desktop、视觉模型、Graphviz 与条件编译覆盖仍是 `missing evidence`。

## 相关内容

- [配置与 IaC 导入器](./config-importers.md)
- [Canonical graph projection](/zh/api/upstream-capability-map.md)
- [CLI 参考](./cli.md)
