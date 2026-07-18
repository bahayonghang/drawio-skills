# Implement - 代码依赖导入器

## Preconditions

- [x] foundation child 已完成并归档；本 child 三件套已获用户审阅批准。
- [x] parser/dependency 选择已逐项批准；未经批准的语言保持未完成或拆 child。
- [x] 只启动本 child，父任务/C1 bucket 保持 `planning`；inline 运行 `trellis-before-dev`。

## Ordered Work

1. 为五个语言域先补 red fixtures：identity stability、direct edges、syntax error、external ignore、empty graph、容量边界与无 Go/Rust toolchain 调用。
2. 接入 Python imports/classes optional wrapper，验证 JSON protocol 与 error code。
3. 接入 direct-pinned `es-module-lexer` 实现 JS/TS ESM subset adapter。
4. 接入 direct-pinned Node tree-sitter binding 与 Go/Rust grammars，实现明确受限的 Go package imports 和 Rust module uses；不调用 Go/Rust toolchain。
5. 所有 raw records 经 shared Code identity factory/finalizer，输出 projection，不直接输出 spec/XML。
6. CLI 增加 directory input routes，安全区分文件型 config adapter 与 project-root code adapter。
7. 增加 projection -> spec -> JS ELK integration fixtures，确认无 `dot/tred`。
8. 更新 base route/reference/compatibility；academic 只在需要时追加 base pointer。

## Focused Tests

```powershell
node --test skills/drawio/scripts/adapters/code-imports.test.js
node --test skills/drawio/scripts/adapters/python-code-adapter.test.js
node --test skills/drawio/scripts/adapters/js-code-adapter.test.js
node --test skills/drawio/scripts/adapters/go-code-adapter.test.js
node --test skills/drawio/scripts/adapters/rust-code-adapter.test.js
node --test tests/adapters.test.js tests/security.test.js
```

## Root Gates

```powershell
npm test
just ci
npm run docs:build
```

## Optional Dependencies

- Python 3.11+：只对 Python route optional；stdlib only，缺失时 `OPTIONAL_DEPENDENCY_MISSING`。
- `es-module-lexer@2.3.1`：MIT、exact-pinned optional dependency、零 transitive dependency、按 JS/TS route 动态加载。
- `tree-sitter@0.21.1`、`tree-sitter-go@0.23.4`、`tree-sitter-rust@0.23.0`：MIT、peer-compatible exact-pinned optional dependencies；允许 Node native binding，但必须验证 Node 20 install/test，缺失只影响 Go/Rust route，禁止 Go/Rust CLI/toolchain。
- Graphviz：无；transitive reduction 当前 `defer`。

## Evidence And Rollback

- 记录每种语言的 fixture/command-executed 状态；真实大型 repo corpus 未跑则 `missing evidence`。
- Desktop/visual model/Graphviz 为 `missing evidence`，不得由 structure tests 代替。
- 每种语言 adapter route 独立 rollback；删除任一路由不影响 foundation、Mermaid/CSV/drawio import。shared tree-sitter 仅在 Go/Rust 都回滚后删除。

## Completion Evidence

- focused + CLI/security：54/54 passed；真实 optional parser integration：1/1 passed。
- Node `v20.20.2`：真实 Python AST、`es-module-lexer/js`、Go/Rust Tree-sitter integration 1/1 passed。
- `npm test`：533 tests，531 passed，2 opt-in integration skipped，0 failed。
- `just ci`：version sync、Markdown lint、完整测试和 VitePress docs build 通过。
- 静态边界检查：code adapter 无布局/XML/Desktop/Graphviz import，无 `go`/`cargo`/`rustc` subprocess；`go.mod` module directive 是唯一批准的最小 token grammar。
- 大型真实 repo corpus、conditional build/workspace、Graphviz、Desktop、visual model 仍为 `missing evidence`。

## Final Review

- [x] parser 只输出 projection，identity 来自 shared factory。
- [x] label/root/order 不影响 IDs，external dependencies 不被误建内部 edge。
- [x] 没有 Graphviz、XML writer 或 Desktop import。
- [x] optional dependency failure 精确且局部。
- [x] focused/root gates 通过或 missing evidence 明示。
