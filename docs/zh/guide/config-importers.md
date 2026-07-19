# 配置与 IaC 导入器（`/drawio config-import`）

声明态配置导入器把基础设施与工作流源归一化为 `CanonicalGraphProjection v1`，再复用现有的 canonical YAML、JavaScript ELK 布局、renderer 与 XML 校验路径。它们不会执行 provider CLI、不连接 cluster 或数据库、不调用 Graphviz、也不写原始 Draw.io style。

用这个 route 把声明态的 Terraform、Kubernetes、Compose、SQL DDL、OpenAPI、GitHub Actions 或 GitLab CI 源转换为可编辑的架构图。

## 支持的输入

| 源                  | `--input-format` | 关键选项                                   |
| ------------------- | ---------------- | ------------------------------------------ |
| Terraform (HCL)     | `terraform`      | `--module-address module.name`             |
| Kubernetes manifest | `kubernetes`     | `--scope <logical-scope>`（必填）          |
| Docker Compose      | `compose`        | `--project <name>`                         |
| SQL DDL             | `sql`            | `--dialect postgres`                       |
| OpenAPI             | `openapi`        | —                                          |
| GitHub Actions      | `github-actions` | `--workflow <repo-relative-path>`（stdin） |
| GitLab CI           | `gitlab-ci`      | `--workflow <repo-relative-path>`（stdin） |

Kubernetes 始终需要一个稳定的逻辑 `--scope`。Compose 接受顶层 `name`；当声明态与 live 源需要显式共享覆盖时使用 `--project`。CI 从 stdin 输入时用 `--workflow` 传 repo 相对路径。

## CLI

```bash
node skills/drawio/scripts/cli.js infra/main.tf output.drawio --input-format terraform --module-address module.app --validate
node skills/drawio/scripts/cli.js k8s/app.yaml output.drawio --input-format kubernetes --scope prod --validate
node skills/drawio/scripts/cli.js compose.yaml output.drawio --input-format compose --project shop --validate
node skills/drawio/scripts/cli.js db/schema.sql output.drawio --input-format sql --dialect postgres --validate
node skills/drawio/scripts/cli.js api/openapi.yaml output.drawio --input-format openapi --validate
node skills/drawio/scripts/cli.js .github/workflows/ci.yml output.drawio --input-format github-actions --validate
node skills/drawio/scripts/cli.js .gitlab-ci.yml output.drawio --input-format gitlab-ci --validate
```

加 `--export-spec` 写出 canonical YAML 而不渲染，加 `--write-sidecars --sidecar-dir <dir>` 把 `.spec.yaml` / `.arch.json` bundle 放入工作目录。

## 可选 HCL 与 SQL Parser

Terraform 与 SQL 需要 Python 3.9+ 及固定版本的 parser 包：

```bash
python -m pip install -r skills/drawio/scripts/adapters/python/requirements.txt
```

| 包            | 版本      | 许可 | 用途              |
| ------------- | --------- | ---- | ----------------- |
| `python-hcl2` | `8.1.2`   | MIT  | Terraform HCL AST |
| `sqlglot`     | `30.12.0` | MIT  | SQL DDL AST       |

该 worker 可选且隔离：从 stdin 读取受限 JSON、在 stdout 返回脱敏记录、使用固定脚本与 `shell: false`，且永不返回原始 HCL/SQL 内容。缺少 Python 或包时，仅 Terraform/SQL 返回 `OPTIONAL_DEPENDENCY_MISSING`——YAML、Mermaid、CSV、create、edit 与 export 照常工作。

## 稳定身份

- **Terraform**——module 限定的 managed-resource 地址；`references` 与 `depends-on` 边。data/provider/local 块作为诊断。
- **Kubernetes**——scope/namespace/kind/name。未知 CRD scope 需要显式 `kindScopes` 覆盖；Secret data 永不进入属性。
- **Compose**——project/service，外加独立命名的 network/volume 身份。
- **SQL**——dialect/schema/table；外键判别使用约束与列元组。
- **OpenAPI**——大写 method 加保留大小写的归一化 path；summary 与 operationId 仅作展示属性。
- **CI**——provider/repo 相对 workflow/job key；展示名永不用于标识 job。

Terraform、Kubernetes、Compose 导出各自的身份构造器与属性 allowlist，供[运行态快照与漂移](./live-drift.md) route 复用同一套 key，而不是重造字符串逻辑。

## 错误与证据边界

| 条件                                          | 结果                          |
| --------------------------------------------- | ----------------------------- |
| 空、超限、异常、递归或带 prototype key 的输入 | `ADAPTER_PARSE`               |
| 未知 Kubernetes kind scope 或不支持的构造     | `ADAPTER_UNSUPPORTED`         |
| 缺少 Python 可执行文件或固定 parser 包        | `OPTIONAL_DEPENDENCY_MISSING` |
| Compose project 歧义                          | `ADAPTER_PARSE`               |
| SQL 外键目标不在所选 DDL 中                   | `ADAPTER_UNSUPPORTED`         |
| 外部 K8s/Compose/OpenAPI/CI/Terraform 引用    | 明确诊断，不产生悬空边        |

确定性 fixture、worker 命令路径、JavaScript ELK 与 XML 校验属于命令证据。provider CLI 捕获、Desktop 预览、Graphviz 对比、大规模多 module/多 dialect 语料以及视觉模型评审仍是 `missing evidence`，需单独执行。不要把小 fixture 说成完整 dialect 支持。

## 相关内容

- [Canonical graph projection](/zh/api/upstream-capability-map.md)
- [运行态快照与漂移](./live-drift.md)
- [代码关系导入器](./code-importers.md)
- [CLI 参考](./cli.md)
