# Design - 配置与声明架构导入器

## 1. Data Flow And Shared Identity

```text
declared files
  -> domain parser
  -> domain records + important attributes
  -> foundation identity factory
  -> CanonicalGraphProjection v1 (mode=declared)
  -> shared projector -> JS ELK -> renderer
```

Terraform/Kubernetes/Compose 的 record normalizer 还导出给 live child 使用的 identity input builders/attribute allowlists；live child import 这些 exports，而不是复制规则。

## 2. Upstream Mapping

| Script | Mapping | Reason |
| --- | --- | --- |
| `tfimports.py` | adapt | 保留 resource/module/ref intent；module address、HCL parser、icon/layout 改走新合同 |
| `k8simports.py` | adapt | 保留 object/ref semantics；结构化 YAML/JSON、scope identity 与 shared live path 替换 upstream |
| `composeimports.py` | adapt | 保留 services/depends/volumes；补 project identity 与 shared live normalization |
| `sqlerd.py` | adapt | 保留 table/PK/FK intent；parser、schema identity 与 semantic edge 替换 raw style |
| `openapiimports.py` | adapt | 保留 operation/schema refs；operation identity 不再用 `op0` ordinal |
| `ciimports.py` | adapt | 保留 jobs/needs/stages/triggers；workflow/job identity 不再依赖 basename/display name |

## 3. Domain Contracts

- Terraform: nodes 为 managed resource/module declarations；data/provider/local 默认 excluded diagnostic。edge relation `references`/`depends-on`；address 包含 module nesting。important attributes 最少含 resource type/provider/module，不含 expression/raw body。
- Kubernetes: nodes 为 explicit objects；relations 覆盖 Ingress->Service、Service->workload、workload->ConfigMap/Secret/PVC、HPA->target。Secret data 永不进入 attributes。
- Compose: service identity `project/service`；network/volume 使用独立 scheme。relations 覆盖 depends_on、links、volumes_from、named mounts；build args/env 不进入 projection。
- SQL: table identity `dialect/schema/table`；FK edge discriminator 使用 constraint/column tuple；保留 column name/type/PK/FK 的 sanitized summary。
- OpenAPI: operation identity `METHOD normalized-path`；schema identity component name；external refs diagnostic。path normalization 只处理 leading/repeated slash 与 whitespace，不 lower-case path。
- CI: GitHub provider/workflow repo-relative path/job key；GitLab provider/workflow path/job key。trigger/stage/matrix/reuse 是 attributes/relations，display names 不是 identity。

## 4. Parser Choices And Optional Dependencies

- YAML/JSON domains 复用现有 `js-yaml` safe load 和 `JSON.parse`，不新增 dependency。
- Terraform HCL 使用 `python-hcl2==8.1.2`；SQL DDL 使用 `sqlglot==30.12.0`。两者由同一个 optional Python 3.9+ worker 承载，版本、MIT license、维护状态与隔离边界已在 2026-07-18 启动审阅中获批准。
- Node wrapper 通过 `execFile`/`spawn` 的参数数组调用固定 worker，不启用 shell；JSON request 只包含 adapter、dialect/locator 与 source text，设置输入、输出、超时和工作目录上限，并使用最小环境变量白名单。
- worker 不读取任意路径、不执行 provider CLI、不访问网络；dependency 缺失映射为 `OPTIONAL_DEPENDENCY_MISSING`，syntax/AST/worker protocol failure 映射为 `ADAPTER_PARSE`。
- optional route 使用 lazy boundary；普通 `adapters/index.js` import、Mermaid/CSV/create/edit/export 在 Python 或 parser package 缺失时仍可加载。
- SQL 只声明 fixture 验证过的 `CREATE TABLE`、column、PK/FK 与 schema-qualified identity；unsupported statement/dialect construct 必须 diagnostic 或失败，不能产生猜测 edge。
- Graphviz `dot/tred` 不需要；all layout 回到 JS ELK。

## 5. Errors, Security, And Rollback

Parser 只读显式文件/stdin，路径必须在 selected root 内。YAML custom tags、prototype keys、oversized object sets、duplicate identity、ambiguous K8s scope/Compose project 和 external refs 均按 error policy处理。各 domain adapter 可单独 rollback；Python worker 可连同依赖 pin 和 Terraform/SQL routes 整体移除，structured adapters 与普通 base runtime 不受影响；shared identity exports 只能由 foundation/config owner 变更并有 cross-child fixtures。

## 6. Missing Evidence

上游小 fixture 和本仓 pinned parser file-backed smoke 证明 basic edge extraction，不证明 multi-module Terraform、CRD scope、Compose profiles/includes、SQL dialects、OpenAPI callbacks/webhooks 或 CI includes/expressions。未执行的 large corpus/provider/Desktop/Graphviz comparison/model 路径继续 `missing evidence`。
