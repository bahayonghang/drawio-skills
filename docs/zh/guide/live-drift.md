# 运行态快照与架构漂移（`/drawio live-drift`）

这个 route 只处理用户显式选择的 JSON 快照。它在内存中解析 Terraform state/plan JSON、Docker inspect JSON 或 Kubernetes live JSON，把每个投影为 `mode: live` 的 `CanonicalGraphProjection v1`，并可将 live 投影与声明态投影对比以渲染漂移。它不运行 `terraform`、`docker` 或 `kubectl`，不连接 daemon、cluster 或云，不继承 provider 凭据，也不把原始快照拷入工作目录。

## 快照适配器

| 源 | 适配器 | 身份 |
|---|---|---|
| Terraform state/plan JSON | `parseTerraformStateSnapshot` | 精确 resource instance 地址 |
| Docker inspect JSON | `parseDockerInspectSnapshot` | Compose project/service（副本聚合） |
| Kubernetes live JSON | `parseKubernetesLiveSnapshot` | scope/namespace/kind/name |

- **Terraform** 保留精确的 resource instance 地址。声明态未展开地址与 `count`/`for_each` 实例保持不同身份。
- **Docker** 仅接受带显式 Compose project/service 标签的容器，并按 project/service 聚合副本；独立容器被排除。容器 ID/名称、env、无关标签、凭据与挂载路径永不投影。network/volume 一致性仍是 `missing evidence`。
- **Kubernetes** live JSON 复用与声明态 manifest 相同的 parser 核心、身份构造器、kind-scope 规则与属性 allowlist。Secret payload、annotation、managed field 与字面 env 值被排除。

声明态与 live 投影使用同一身份工厂与 allowlist，因此展示 label、捕获时间、输入顺序、容器实例名与 pod UID 都不用于标识实体。

## 对比与渲染漂移

```js
import {
  parseDockerInspectSnapshot,
  compareGraphProjections,
  renderDriftGraph,
} from './skills/drawio/scripts/adapters/index.js'

const report = compareGraphProjections(declared, live, {
  baselineContext: 'shop-production',
  observedContext: 'shop-production',
})
const { spec, xml } = await renderDriftGraph(report, declared, live)
```

两个逻辑 context 均为必填且必须一致。投影/报告版本、domain、context 或身份歧义会以 `DRIFT_INCOMPATIBLE` 或 `IDENTITY_COLLISION` 显式失败；比较器绝不回退到 label 匹配。

带版本的报告在确定性身份顺序下有节点、边、allowlist 属性的 `added`/`removed`/`changed`/`unchanged` 桶。label 变化是同一身份上的展示变化。边的 relation 属于身份的一部分，因此 relation 变化表现为"移除 + 新增"。漂移 canonical YAML 携带状态文本与变更 key 名、包含 legend，并把移除的边渲染为虚线——颜色不是唯一的状态载体。

## 证据边界

一个记录在案的 Compose 漂移案例位于 `skills/drawio/references/examples/importers/live/`（`compose-drift-report.json`、`compose-drift.spec.yaml`、`compose-drift-evidence.json`）。它证明确定性解析、对比、JavaScript ELK、渲染与 XML 校验，但不证明 provider CLI 捕获、真实环境、Desktop 预览或视觉模型评审；这些仍是 `missing evidence`。

## 相关内容

- [配置与 IaC 导入器](./config-importers.md)
- [Canonical graph projection](/zh/api/upstream-capability-map.md)
- [CLI 参考](./cli.md)
