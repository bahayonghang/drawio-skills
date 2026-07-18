# Implement - 代码依赖导入器

## Preconditions

- [ ] foundation child 已完成并归档；本 child 三件套已获用户审阅批准。
- [ ] parser/dependency 选择已逐项批准；未经批准的语言保持未完成或拆 child。
- [ ] 只启动本 child，父任务/C1 bucket 保持 `planning`；inline 运行 `trellis-before-dev`。

## Ordered Work

1. 为五个语言域先补 red fixtures：identity stability、direct edges、syntax error、external ignore、empty graph。
2. 接入 Python imports/classes optional wrapper，验证 JSON protocol 与 error code。
3. 按已批准 parser 实现 JS/TS、Go、Rust adapters；每个 route 独立提交验证，不共享正则 parser。
4. 所有 raw records 经 shared Code identity factory/finalizer，输出 projection，不直接输出 spec/XML。
5. 增加 projection -> spec -> JS ELK integration fixtures，确认无 `dot/tred`。
6. 更新 base route/reference/compatibility；academic 只在需要时追加 base pointer。

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

- Python 3：只对 Python route optional；stdlib only，缺失时 `OPTIONAL_DEPENDENCY_MISSING`。
- JS/TS/Go/Rust parser/tool：实施前单独批准并 pin；禁止依赖 transitive package 或隐式网络。
- Graphviz：无；transitive reduction 当前 `defer`。

## Evidence And Rollback

- 记录每种语言的 fixture/command-executed 状态；真实大型 repo corpus 未跑则 `missing evidence`。
- Desktop/visual model/Graphviz 为 `missing evidence`，不得由 structure tests 代替。
- 每种语言 adapter route 独立 rollback；删除 route 不影响 foundation、Mermaid/CSV/drawio import。

## Final Review

- [ ] parser 只输出 projection，identity 来自 shared factory。
- [ ] label/root/order 不影响 IDs，external dependencies 不被误建内部 edge。
- [ ] 没有 Graphviz、XML writer 或 Desktop import。
- [ ] optional dependency failure 精确且局部。
- [ ] focused/root gates 通过或 missing evidence 明示。
