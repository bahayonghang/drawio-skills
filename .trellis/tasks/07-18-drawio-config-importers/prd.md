# 配置与声明架构导入器

## Goal

导入 Terraform、Kubernetes、Docker Compose、SQL DDL、OpenAPI、GitHub Actions 和 GitLab CI 的声明态结构，输出 foundation 定义的 canonical graph projection，并为后续 live drift 固化共享 identity 与重要属性合同。

## Requirements

- 前置依赖 `07-18-drawio-adapter-identity-foundation` 完成；所有 identity 通过 shared factory。
- `tfimports.py`、`k8simports.py`、`composeimports.py`、`sqlerd.py`、`openapiimports.py`、`ciimports.py` 均映射为 `adapt`：保留已证明的 domain relations，替换 upstream graph JSON、raw style、Graphviz reduction/layout 和弱 identity。
- Terraform identity 使用 module-qualified resource address；Kubernetes 使用 scope/namespace/kind/name；Compose 使用 project/service；OpenAPI operation 使用 method + normalized path；CI 使用 provider/workflow/job。SQL 使用 dialect/schema/table。
- Terraform/Kubernetes/Compose 的 declared projection 必须导出 live child 可复用的重要 attribute allowlist 与同一 identity inputs；不得由 live child重新定义。
- Kubernetes/Compose/OpenAPI/CI 的 YAML/JSON 使用现有 `js-yaml`/structured APIs；禁用 unsafe YAML schema/tags。Terraform HCL 与 SQL DDL 采用成熟 parser 的选择需要实施前批准，缺少证据时不能宣称完整 dialect support。
- Adapter 只解析，不写 raw Draw.io styles，不布局、不生成 XML、不调用 provider CLI/Desktop。
- Unsupported/external refs、ambiguous namespace/project、duplicate workflow/table/resource、unsafe input、parser dependency missing 必须有明确 error/diagnostic。

## Acceptance Criteria

- [ ] 六个 upstream scripts 的 `adapt` mapping、理由、owner、fixture 和证据状态完整。
- [ ] Terraform/Kubernetes/Compose identity fixtures 可被 live child 原样复用，label 和输入顺序变化不改变 identity。
- [ ] OpenAPI path normalization 保留 path case/templated params，method 大写；summary/operationId 变化不改变 identity。
- [ ] CI identity 使用 canonical repo-relative workflow path 和 job key，不使用 mutable `name`。
- [ ] SQL schema-qualified table 和 FK edge 有稳定 identity；unsupported dialect clause 不产生错误 edge。
- [ ] 每个 projection 投影为 valid spec，经 JS ELK/renderer validation；默认路径没有 Graphviz。
- [ ] optional parser 缺失只影响所属 adapter，普通 base runtime 保持可用。
- [ ] focused tests、`npm test`、`just ci` 通过；公共 docs 变化时 docs build 通过。
- [ ] 真实大型 HCL/SQL corpus、provider CLI、Graphviz、Desktop 和 model runs 未取得时保持 `missing evidence`。

## Out Of Scope

- 执行 Terraform/kubectl/docker、读取 secrets、连接数据库、解析 Helm/Kustomize 渲染结果。
- 所有 HCL/SQL/OpenAPI/vendor extension 的完整语义支持。
- adapter 内布局、XML、视觉验收或 upstream CLI compatibility。
