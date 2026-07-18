# Design - 代码依赖导入器

## 1. Data Flow

```text
project root + language option
  -> language parser (optional isolated tool where required)
  -> raw module/class/reference records
  -> shared Code identity factory
  -> CanonicalGraphProjection v1
  -> shared projector -> validateSpec -> JS ELK -> renderer
```

Adapter 只依赖 foundation exports，不 import layout/XML/Desktop modules。

## 2. Upstream Mapping

| Script | Mapping | Reason |
| --- | --- | --- |
| `pyimports.py` | adapt | Python AST 与 relative-import resolution 可复用；删除 `tred` 和 graph JSON CLI contract |
| `pyclasses.py` | adapt | 保留 top-level inheritance scope；identity 改为 module + qualified class，删除 `tred` |
| `jsimports.py` | adapt | 保留 intra-project module graph intent；替换 regex/Python shell 与 mutable path IDs |
| `goimports.py` | adapt | 保留 module-local package edge intent；parser/tool 与 identity 经新合同隔离 |
| `rustimports.py` | adapt | 保留 crate module-use scope；明确 cfg/inline module/edition 限制并删除 `tred` |

## 3. Parser And Dependency Boundary

- Python: optional `python3` standard library AST wrapper，精确报告 executable missing/syntax error；Node orchestration 负责 identity finalization。
- JS/TS: 推荐评估 `es-module-lexer` + CJS coverage 或成熟 AST parser；这是新 direct dependency 候选，实施前需批准并记录 package/license/size。没有批准不以 lockfile 的 transitive Babel parser 作为隐式依赖。
- Go: 优先评估 `go list` 的 offline/read-only 模式与 source parser；provider tool 不得联网拉取 dependency。选择前保留 `missing evidence`。
- Rust: 优先评估 cargo/rust parser 的 offline behavior；不能把 regex 支持声明为完整 Rust parsing。选择前保留 `missing evidence`。

该 child 可以分阶段交付已批准 parser，但不能把未批准语言勾成完成；必要时再拆更细 child，而不是扩大 foundation。

## 4. Projection Semantics

- module node: identity `code/<language>/<canonical-path>`，label 为短 path/name。
- class node: scheme `code-class`，key 为 module key + qualified class name。
- import/use edge: relation `imports`/`uses`；inheritance edge: `inherits`。
- external targets 默认不创建 node；diagnostics 记录 ignored count，不记录完整敏感 path。
- group identity 使用 canonical parent module path；projector 决定 modules，不写 raw group style。

## 5. Errors And Rollback

解析错误保留 file + line/column（相对 project root）；不可读路径、escaping root、duplicate canonical path 和 optional tool missing 均硬失败。单语言 route 可单独回滚；foundation 和其他语言不受影响。默认不做 transitive reduction，因此回滚不依赖 Graphviz。

## 6. Missing Evidence

上游单元 fixture 只证明小样本，不证明大型 monorepo、conditional compilation、path alias、workspace/module replace 或 generated code。对应 corpus/tool evidence 在取得前均为 `missing evidence`；Desktop/model evidence 不属于 parser 完成证据。
