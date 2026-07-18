# Design - 运行态快照与架构漂移

## 1. Inputs And Data Flow

```text
captured JSON file/stdin
  -> live domain normalizer
  -> shared config identity builder + attribute allowlist
  -> CanonicalGraphProjection v1 (mode=live)

declared projection + live projection
  -> compatibility check
  -> identity-indexed node/edge/attribute diff
  -> machine-readable drift report + drift projection
  -> shared projector -> canonical YAML -> JS ELK -> renderer
  -> C0 vision-preview/review/rework/stopping loop
```

Capture command examples只作为 docs/operator convenience；runtime 不 shell 拼接或自动执行它们。

## 2. Upstream Mapping

| Script | Mapping | Reason |
| --- | --- | --- |
| `tfstate.py` | adapt | 保留 state/plan recursive managed-resource extraction；identity/attributes/projector/ELK 改为 shared contracts |
| `dockerimports.py` | adapt | 保留 container/network/volume relations；primary match 改为 project/service，instance 变 attribute |
| `drawiodiff.py` | replace | 从 XML cell/label diff 改为 projection identity + node/edge/attribute diff，保留非颜色语义 |
| `k8simports.py` live mode | bridge to config adapter | 同一 structured JSON parser/identity builder 已由 config child拥有，不复制脚本 |

## 3. Domain Normalization

- Terraform: 接受 `values.root_module` 或 `planned_values.root_module`；managed resource address 是 identity；sensitive/raw values 不进入 attributes。`depends_on` 规范为 stable edge。
- Docker: Compose-managed container 用 label 中 project/service 建 primary identity；replicas/container IDs 作为 instances。未带 compose labels 的 standalone container 进入独立 `docker-container` scheme，不能与 declared Compose 猜测匹配。
- Kubernetes: 复用 config parser；调用者必须提供与 declared projection 一致的 scope。namespace/kind/name 规则完全共享。

## 4. Drift Contract

Machine-readable report：

```json
{
  "version": 1,
  "baseline": { "source": "declared" },
  "observed": { "source": "live" },
  "nodes": { "added": [], "removed": [], "changed": [], "same": [] },
  "edges": { "added": [], "removed": [], "changed": [], "same": [] },
  "attributes": { "changed": [] },
  "diagnostics": []
}
```

Changed record 保存 identity、before/after allowlisted values 与 changed keys。Secret/raw values 不进入 report。edge identity 使用 foundation discriminator；attribute order 不影响 equality。

Drift projection 节点 label 加 status token，removed 使用 dashed，changed 包含 concise changed-key summary，所有 status 在 legend 中有 text。颜色是辅助手段。

## 5. C0 Consumption

drift spec 写入 work-dir sidecar，生成 bounded preview；review record 绑定 stable renderer ID。确定性 diff/validation 先行，随后检查真实 preview。修复只改 canonical drift YAML 的 presentation/label/layout，不修改 live snapshot 或 preview；遵守 2/5 stopping rules。

## 6. Errors, Optional Dependencies, Rollback

JSON parse/schema、scope/project mismatch、projection version、duplicate identity 和 domain mismatch 分层失败。provider CLI 仅文档化 optional；Graphviz 无。live adapters/diff route 可整体移除，不影响 config importers 或 existing base authoring。snapshot/report version 显式，未知 version 不猜测。

## 7. Missing Evidence

小 fixture 不能证明真实 Terraform provider state、Docker replicas/swarm、Kubernetes CRD scope 或 provider CLI permissions。未运行真实 environment、Desktop preview 或视觉模型时分别标记 `missing evidence`；structure diff 不能替代视觉实测。
