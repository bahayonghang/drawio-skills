# Design - 运行态快照与架构漂移

## 1. Inputs And Data Flow

```text
explicit user-selected JSON file/stdin
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

Raw input只在内存中选择性读取；不复制到 work dir。Capture providers、命令示例和认证环境访问不属于当前 child。

## 2. Upstream Mapping

| Script | Mapping | Reason |
| --- | --- | --- |
| `tfstate.py` | adapt | 保留 state/plan recursive managed-resource extraction；identity/attributes/projector/ELK 改为 shared contracts |
| `dockerimports.py` | adapt | 保留可靠的 Compose service/dependency relations；primary match 改为 project/service，replicas 聚合；standalone 与 network/volume parity defer |
| `drawiodiff.py` | replace | 从 XML cell/label diff 改为 projection identity + node/edge/attribute diff，保留非颜色语义 |
| `k8simports.py` live mode | bridge to config adapter | 同一 structured JSON parser/identity builder 已由 config child拥有，不复制脚本 |

## 3. Domain Normalization

- Terraform: 接受 `format_version=1.x` 下的 `values.root_module` 或 `planned_values.root_module`；只读取 managed resource metadata/address/type/depends_on。instance address 精确参与 identity；`values`、`sensitive_values`、outputs/change payload 永不进入 candidate、diagnostic 或 evidence。
- Docker: 只接受带明确 `com.docker.compose.project` 与 `com.docker.compose.service` 的 containers；按 project/service 聚合 replica count，并要求 image 等 allowlisted values 一致。只读取三个精确 Compose labels和 `Config.Image`；忽略所有 env、其他 labels、IDs/names、credentials、mount paths。standalone、network/volume parity 返回 aggregate diagnostic，不猜测逻辑名。
- Kubernetes: declared/live wrappers 复用同一个 structured object normalizer、`buildKubernetesIdentityInput` 和 allowlist；调用者必须提供 scope。live wrapper 输出 `mode=live`，Secret payload、annotations、managedFields 和 literal env values 永不进入 projection。
- Snapshot adapters 的公共签名为 `parseTerraformStateSnapshot(source, options)`、`parseDockerInspectSnapshot(source, options)` 和 `parseKubernetesLiveSnapshot(source, options)`；全部返回 finalized `CanonicalGraphProjection v1`。

## 4. Drift Contract

Machine-readable report：

```json
{
  "version": 1,
  "baseline": { "source": "declared" },
  "observed": { "source": "live" },
  "nodes": { "added": [], "removed": [], "changed": [], "unchanged": [] },
  "edges": { "added": [], "removed": [], "changed": [], "unchanged": [] },
  "attributes": { "added": [], "removed": [], "changed": [], "unchanged": [] },
  "diagnostics": []
}
```

`compareGraphProjections(baseline, observed, { baselineContext, observedContext })` 先比较 projection version、domain 和显式 logical context。Kubernetes scope、Compose project、Terraform environment key 由调用者提供且必须相等；不从 locator、cwd、backend 或 display label 推断。Changed record 保存 identity、display label change、before/after allowlisted values 与 sorted changed keys。Secret/raw values 不进入 report。edge identity 使用 foundation discriminator；relation change是 removed + added。所有 buckets 按 serialized identity 排序，object keys canonical-sort 后比较。

Drift projection 的 node/edge label 加稳定 status token，changed 包含 concise changed-key summary，所有 status 在 legend 中有 text。Removed edge 使用现有 dashed connector override；drift spec 在 shared projector 之后只增加 canonical style/legend presentation，不让 snapshot adapter产生 raw style，也不新增 semantic type/theme surface。颜色是辅助手段。

## 5. C0 Consumption

drift spec 写入 work-dir sidecar；file-backed review record 绑定 stable renderer ID，并复用 C0 的 canonical patch、review schema 与 2/5 stopping rules。当前 child 只运行确定性 diff/validation 和 recorded fixture 检查，不调用 Desktop/model；PNG、Desktop 与 model execution 分别保持 `missing evidence`。修复只改 canonical drift YAML 的 presentation/label/layout，不修改 live snapshot 或 preview。

## 6. Errors, Optional Dependencies, Rollback

JSON parse/schema、explicit context mismatch、projection/report version、duplicate identity 和 domain mismatch 分层失败。当前 child 无 provider CLI、capture subprocess、Graphviz、Desktop 或 model execution。Snapshot adapters 与 comparator/presentation 分成两个原子工作提交；任一可整体移除，不影响 config importers 或 existing base authoring。snapshot/report version 显式，未知 version 不猜测。

## 7. Missing Evidence

小 fixture 不能证明真实 Terraform provider state、Docker replicas/swarm、network/volume logical-name recovery、Kubernetes CRD scope 或 provider CLI permissions。Terraform instance aggregation、Docker standalone/network/volume parity、真实 environment、Desktop preview 和视觉模型分别标记 `missing evidence`；structure diff 不能替代视觉实测。
