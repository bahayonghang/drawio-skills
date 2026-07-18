# Implement - 配置与声明架构导入器

## Preconditions

- [ ] foundation 已完成；本 child 三件套获批准。
- [ ] HCL/SQL parser 或明确 subset 方案已获依赖/范围批准。
- [ ] 只启动本 child，父任务/C1 bucket 保持 `planning`；inline 运行 `trellis-before-dev`。

## Ordered Work

1. 先补 cross-domain red fixtures：identity stability、duplicates、unsafe YAML、external refs、projection validation。
2. 实现 Kubernetes/Compose/OpenAPI/CI structured adapters，复用 `js-yaml` safe path。
3. 按批准方案实现 Terraform HCL 与 SQL DDL adapter，不保留 raw body/style。
4. 导出 Terraform/Kubernetes/Compose shared identity input builders 与 important attribute allowlists，供 live child import。
5. 每个 adapter 通过 projection -> spec -> JS ELK -> renderer integration；确认无 Graphviz/provider CLI。
6. 更新 base references、compatibility、fixtures；academic 只保留 base pointer/出版 policy。

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
- Candidate: isolated HCL parser、SQL parser；实施前批准并 pin，缺失时 `OPTIONAL_DEPENDENCY_MISSING`。
- Provider CLIs、Graphviz、Desktop、network：不需要。

## Evidence And Rollback

- 每个 domain 记录 file-backed fixture 与 command-executed 状态；large corpus/optional parser 未执行为 `missing evidence`。
- deterministic validation 不等于 Desktop/model visual run；后二者保持 `missing evidence`。
- 每个 adapter route 独立 rollback；shared identity/attribute contract 变更必须回到本 child/foundation planning，不能由 live child分叉。

## Final Review

- [ ] 声明态 identity 与用户强制规则一致，label/ordinal 不参与 identity。
- [ ] adapter 只解析并输出 projection，无 XML/layout/provider execution。
- [ ] live child 可 import 同一 identity builders/attribute allowlists。
- [ ] JS ELK 默认，Graphviz 不在 dependency tree。
- [ ] focused/root gates 通过或 missing evidence 明示。
