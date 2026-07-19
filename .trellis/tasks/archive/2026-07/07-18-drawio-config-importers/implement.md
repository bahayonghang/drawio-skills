# Implement - 配置与声明架构导入器

## Preconditions

- [x] foundation 已完成并归档；本 child 三件套获批准。
- [x] `python-hcl2==8.1.2`、`sqlglot==30.12.0`、optional Python 3.9+ worker 与受限 subprocess 边界已获依赖/范围批准。
- [x] 只启动本 child，父任务/C1 bucket 保持 `planning`；inline 运行 `trellis-before-dev`。

## Ordered Work

1. 先补 cross-domain red fixtures：identity stability、duplicates、unsafe YAML、external refs、projection validation。
2. 实现 Kubernetes/Compose/OpenAPI/CI structured adapters，复用 `js-yaml` safe path。
3. 实现固定 JSON protocol 的 optional Python worker 与 Node wrapper，覆盖 dependency missing、timeout、non-zero、malformed output、size limit 和 parser error。
4. 使用 `python-hcl2==8.1.2` 实现 Terraform HCL adapter，使用 `sqlglot==30.12.0` 实现 SQL DDL adapter，不保留 raw body/style，不宣称 fixture 外 dialect 完整支持。
5. 导出 Terraform/Kubernetes/Compose shared identity input builders 与 important attribute allowlists，供 live child import。
6. 每个 adapter 通过 projection -> spec -> JS ELK -> renderer integration；确认无 Graphviz/provider CLI。
7. 更新 base references、compatibility、fixtures；academic 只保留 base pointer/出版 policy。

## Focused Tests

```powershell
node --test skills/drawio/scripts/adapters/terraform-config.test.js
node --test skills/drawio/scripts/adapters/kubernetes.test.js
node --test skills/drawio/scripts/adapters/compose.test.js
node --test skills/drawio/scripts/adapters/sql-ddl.test.js
node --test skills/drawio/scripts/adapters/openapi.test.js
node --test skills/drawio/scripts/adapters/ci.test.js
node --test tests/adapters.test.js tests/security.test.js
```

## Root Gates

```powershell
npm test
just ci
npm run docs:build
```

## Optional Dependencies

- Existing: Node 20、`js-yaml`、vendored ELK。
- Approved optional: Python 3.9+、`python-hcl2==8.1.2`、`sqlglot==30.12.0`；通过固定 worker protocol 隔离，缺失时 `OPTIONAL_DEPENDENCY_MISSING`。
- Provider CLIs、Graphviz、Desktop、network：不需要。

## Evidence And Rollback

- 每个 domain 记录 file-backed fixture 与 command-executed 状态；pinned HCL/SQL parser 已在隔离 venv 中执行 small fixtures，large corpus 仍为 `missing evidence`。
- deterministic validation 不等于 Desktop/model visual run；后二者保持 `missing evidence`。
- 每个 adapter route 独立 rollback；shared identity/attribute contract 变更必须回到本 child/foundation planning，不能由 live child分叉。

## Verification Evidence - 2026-07-18

- focused config/identity/security/pipeline tests：`28/28` passed，包含真实 `python-hcl2==8.1.2` 与 `sqlglot==30.12.0` worker integration。
- focused CLI config routes：`2/2` passed；完整 CLI integration：`32/32` passed。
- file-backed Terraform/SQL CLI smoke：command-executed，均产生 canonical renderer XML。
- `npm test` / `just ci`：`512` total、`511` passed、`1` intentional skip；该 skip 是无 `DRAWIO_TEST_PYTHON` 时的真实 worker case，已在 focused venv run 单独通过。
- version sync、Markdown lint、task/spec Markdown、Python AST、imports、`git diff --check` 与 VitePress docs build：passed。
- `package.json`/lockfile、academic overlay、Graphviz、`dot/tred`、provider CLI 路径：无改动或无调用。
- large HCL/SQL corpus、provider CLI、Desktop、Graphviz comparison、visual model：`missing evidence`；deterministic JS ELK/XML 不计作视觉模型实测。

## Final Review

- [x] 声明态 identity 与用户强制规则一致，label/ordinal 不参与 identity。
- [x] adapter 只解析并输出 projection，无 XML/layout/provider execution。
- [x] live child 可 import 同一 identity builders/attribute allowlists。
- [x] JS ELK 默认，Graphviz 不在 dependency tree。
- [x] focused/root gates 通过或 missing evidence 明示。
