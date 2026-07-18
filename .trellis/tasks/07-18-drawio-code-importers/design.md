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

CLI directory routes:

```text
<project-dir> --input-format python-imports
<project-dir> --input-format python-classes
<project-dir> --input-format js-imports
<project-dir> --input-format go-imports
<project-dir> --input-format rust-imports
```

`js-imports` 同时扫描 JS/JSX/MJS 与 TS/TSX 文件，并按扩展名分别使用 `javascript` / `typescript` identity language。CLI 在读取输入前识别 code route，要求 positional input 为本地目录；stdin 不支持 code project route。现有 YAML/config/file routes 继续使用文件或 stdin，不受目录分支影响。

## 2. Upstream Mapping

| Script | Mapping | Reason |
| --- | --- | --- |
| `pyimports.py` | adapt | Python AST 与 relative-import resolution 可复用；删除 `tred` 和 graph JSON CLI contract |
| `pyclasses.py` | adapt | 保留 top-level inheritance scope；identity 改为 module + qualified class，删除 `tred` |
| `jsimports.py` | adapt | 保留 intra-project module graph intent；替换 regex/Python shell 与 mutable path IDs |
| `goimports.py` | adapt | 用 Node tree-sitter Go grammar 保留 module-local package edge intent，不调用 Go toolchain |
| `rustimports.py` | adapt | 用 Node tree-sitter Rust grammar 保留 crate module-use scope，不调用 Rust toolchain |

## 3. Parser And Dependency Boundary

- Python: 新增独立 fixed code worker，使用 Python 3.11 grammar 的 stdlib `ast`，批量 stdin/stdout JSON 上限 4 MiB、stdout 上限 1 MiB、10 秒 timeout；Node 负责安全遍历、relative import resolution、identity finalization。config worker 的 `terraform/sql` allowlist 不扩展。
- JS/TS: direct pin `es-module-lexer@2.3.1` 并使用 CSP/no-eval 的 `/js` build；只支持 ESM static、side-effect、export-from 与 string-literal dynamic imports。CJS、非 literal dynamic import、TS path alias、package exports 和 monorepo resolution 保持 out of scope / `missing evidence`。
- Go: direct pin `tree-sitter@0.21.1` + `tree-sitter-go@0.23.4`，从 AST `import_spec` 提取 imports；只支持单 `go.mod` module，`module` directive 使用明确的最小 token grammar。build tags 全量静态包含并给 diagnostic；workspace、replace、vendor 语义保持 out of scope。
- Rust: direct pin `tree-sitter@0.21.1` + `tree-sitter-rust@0.23.0`，从 AST `use_declaration` / use tree 提取 `crate/self/super` 路径。按 repo-relative `.rs` 文件建立 module；inline module、`#[path]`、cfg 求值、workspace 和 edition 2015 bare path 保持 out of scope。
- Go/Rust parser 全部在 Node 进程内运行；禁止探测或调用 `go`、`cargo`、`rustc`，禁止 Go/Rust subprocess/worker。

新增 parser package 以 exact-pinned `optionalDependencies` 进入 `package-lock.json`，由对应 route 动态加载，缺失映射为 `OPTIONAL_DEPENDENCY_MISSING`；普通 YAML/Mermaid/CSV/config/create/edit/export 不加载 parser package。不得依赖 VitePress 的 transitive Babel。`es-module-lexer` 为 MIT、172,041 bytes、零依赖；peer-compatible tree-sitter 三包均为 MIT，合计约 17.23 MB unpacked，并依赖 `node-addon-api`/`node-gyp-build`，必须在 Node 20 CI 验证 prebuilt/native install。四个 repo 均未 archived，2026 年有 push/update 证据。

每个语言 route 独立提交与 rollback。JS/TS rollback 删除 lexer route/package；Go/Rust rollback 删除各 grammar route，只有两者都移除时才删除 shared `tree-sitter`；Python rollback 删除 code worker，但不得回退 config worker。

## 4. Projection Semantics

- module node 使用 `createCodeIdentity({ language, modulePath })`；`modulePath` 是显式 project root 下保留扩展名的 canonical repo-relative POSIX source path，Go package 使用目录 path，root package 使用 `_root`。scan root、checkout absolute path、label 和遍历顺序不参与 identity。
- class node 使用新增 `createCodeClassIdentity({ moduleIdentity, qualifiedClassName })`；scheme `code-class`，key 为 canonical module identity + top-level qualified class name。
- import/use edge: relation `imports`/`uses`；inheritance edge: `inherits`。
- external targets 默认不创建 node；diagnostics 记录 ignored count，不记录完整敏感 path。
- group identity 使用 canonical parent module path；projector 决定 modules，不写 raw group style。

## 5. Errors And Rollback

Node 不跟随 symlink，跳过语言约定的 generated/vendor/cache 目录；单文件上限 1 MiB、项目聚合 source 上限 4 MiB。解析错误通过 `AdapterContractError.context` 保留 project-relative path + line/column；不可读路径、escaping root、duplicate/case-folded canonical path、tree-sitter `ERROR` node、unresolved relative/internal reference 和 optional tool missing 均硬失败。外部/stdlib ignore 只记录聚合 diagnostic，不泄露绝对路径。当前 projection 的 100 nodes / 200 edges / 20 modules 是明确支持上限，超限保持 `PROJECTION_INVALID`。

## 6. Missing Evidence

上游单元 fixture 只证明小样本，不证明大型 monorepo、conditional compilation、path alias、workspace/module replace 或 generated code。对应 corpus/tool evidence 在取得前均为 `missing evidence`；Desktop/model evidence 不属于 parser 完成证据。
