# 代码依赖导入器

## Goal

以 foundation 的 projection/identity 合同导入 Python module imports、Python class inheritance、JS/TS、Go 和 Rust 模块关系；parser 只输出结构事实，布局、主题、渲染与 sidecar 回到 base canonical pipeline。

## Requirements

- 前置依赖 `07-18-drawio-adapter-identity-foundation` 完成并发布 versioned projection、Code identity factory 和 projector。
- `pyimports.py`、`pyclasses.py`、`jsimports.py`、`goimports.py`、`rustimports.py` 均映射为 `adapt`：保留经过 fixture 证明的解析语义，替换 upstream graph JSON、Graphviz reduction 和 XML/layout coupling。
- Code identity 必须使用 language + canonical project-relative POSIX module path；Python class identity 在 module identity 后追加 qualified class name。label、checkout root 和文件遍历顺序不得影响 identity。
- Python wrapper 只允许 Python 3 标准库 AST/扫描作为显式 optional parser；通过 stdin/stdout JSON 或文件协议返回 raw projection，不布局、不调用 `tred/dot`。
- JS/TS、Go、Rust 的解析实现必须在 child 启动前选择有维护证据的 parser/tool；任何新 production dependency 需要明确批准。没有批准时对应分支保持 `missing evidence`，不得以正则误报冒充完整 parser。
- projection 默认保留完整直接 dependency/inheritance edges；transitive reduction 是独立 downstream transform，当前不依赖 Graphviz，未有需求证据时 `defer`。
- syntax error、unsupported syntax、unresolved internal reference、optional parser missing 与 empty graph 分别报告；外部/stdlib dependency 的有意忽略写入 diagnostics。

## Acceptance Criteria

- [ ] 五个 upstream script 都有 owner、`adapt` 理由、fixture 和 evidence status。
- [ ] Python imports/classes、JS/TS static/dynamic imports、Go intra-module imports、Rust crate module uses 的约定范围有独立 fixtures。
- [ ] 同一 repo 移动目录、修改 display label 或改变扫描顺序后 identity/render ID 不变。
- [ ] 每个 adapter 输出 valid projection，投影为 canonical spec 后通过 JS ELK/renderer validation，且没有 Graphviz 调用。
- [ ] parser limitation 产生明确 diagnostic/error；不把 regex 可解析范围宣传成语言完整语法支持。
- [ ] optional Python/parser/tool dependency 缺失时只影响对应 route，普通 base workflow 仍可用。
- [ ] focused tests、`npm test`、`just ci` 通过；公共 docs 更新时 docs build 通过。
- [ ] 未运行的大型真实仓库 corpus、可选 parser、Graphviz、Desktop 和 model evidence 保持 `missing evidence`。

## Out Of Scope

- function-level call graph、runtime tracing、third-party dependency graph、所有语言语法的完整语义解析。
- adapter 内布局、style string、XML、Desktop、视觉模型调用。
- 上游 CLI/graph JSON compatibility。
