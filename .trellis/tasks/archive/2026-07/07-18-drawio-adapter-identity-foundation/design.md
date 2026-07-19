# Design - Canonical adapter 与稳定身份基础

## 1. Modules And Ownership

建议 base-owned modules：

```text
skills/drawio/scripts/adapters/
  graph-projection.js       # validate/finalize CanonicalGraphProjection v1
  identity.js               # all identity factories + stable renderer IDs
  projection-to-spec.js     # semantic projection only; no layout/XML
skills/drawio/assets/schemas/
  graph-projection.schema.json
```

具体文件名可在实施前按现有目录搜索结果微调，但 owner 不变。现有 `adapters/index.js` 可作为 public export surface，不承载所有实现。

## 2. CanonicalGraphProjection v1

```json
{
  "version": 1,
  "source": {
    "adapter": "terraform-config",
    "domain": "terraform",
    "mode": "declared",
    "locator": "infra"
  },
  "nodes": [
    {
      "identity": { "scheme": "terraform-resource", "key": "module.api.aws_instance.web" },
      "label": "web",
      "semanticType": "server",
      "moduleIdentity": { "scheme": "terraform-module", "key": "module.api" },
      "attributes": { "resourceType": "aws_instance" }
    }
  ],
  "edges": [
    {
      "from": { "scheme": "terraform-resource", "key": "module.api.aws_instance.web" },
      "to": { "scheme": "terraform-resource", "key": "module.net.aws_security_group.web" },
      "relation": "depends-on",
      "discriminator": "depends_on[aws_security_group.web]",
      "attributes": {}
    }
  ],
  "modules": [],
  "diagnostics": []
}
```

Attributes 只允许 JSON scalar、scalar array 和经过 domain allowlist 的浅对象。secret values、full Kubernetes Secret data、environment values、raw source blocks、absolute paths 和 arbitrary nested payload 不进入 projection。

## 3. Identity Model

### 3.1 Canonical identity

Identity 是结构化 tuple 的规范序列化，不是 display string。factory 先验证 domain fields，再生成 `{ scheme, key }`。key 使用 domain-specific escaping，禁止 control characters、空字段和 ambiguous separator。

| Domain | Canonical inputs | Key rule |
| --- | --- | --- |
| Terraform | module path, resource type/name, instance key | Terraform canonical address grammar |
| Kubernetes | scope, namespaced flag, namespace, kind, name | `scope/namespace-or-_cluster/kind/name` |
| Compose | project, service | `project/service` |
| Code | language, project-relative module path | `language/normalized-posix-module-path` |
| OpenAPI | method, path | `METHOD normalized-case-preserving-path` |
| CI | provider, workflow repo path, job key | `provider/workflow/job` |
| SQL | dialect, schema, table | `dialect/schema/table` |

Kubernetes `scope` 是显式 logical cluster/environment key。namespaced object 缺 namespace 规范为 `default`；cluster-scoped object 使用 `_cluster`。unknown kind 的 scope ambiguity 必须由 parser 提供 `namespaced`，不能猜测。

Compose project 取 top-level `name` 或显式 CLI option；从目录 basename 推断时必须产生 diagnostic，并要求 declared/live drift 使用相同 override。

### 3.2 Renderer-safe ID

```text
payload = scheme + "\0" + key
id = <kind-prefix> + "-" + first_20_hex(sha256(payload))
```

prefix 使用 `n`、`e`、`m`，满足现有 `VALID_ID`。20 hex 是格式合同，不是碰撞容错；finalization 仍维护 `id -> identity` map，任何 collision 立即抛 `IDENTITY_COLLISION`，不得按遍历顺序追加 suffix。

### 3.3 Edge identity

edge key 使用规范 JSON tuple `[relation, from serialization, to serialization, discriminator]`，避免把 NUL 等控制字符写入 YAML/JSON identity。没有稳定 discriminator 时，只允许每个 `(from, relation, to)` 一条 edge；第二条失败。label 不参与 key。NUL 只用于 renderer hash 的内部 `scheme + NUL + key` payload，不进入持久化 key。

## 4. Projection Finalization And Projector

```text
raw projection
  -> structural validation
  -> domain identity validation/normalization
  -> uniqueness + collision checks
  -> referential integrity
  -> deterministic sort by identity
  -> projection-to-spec
```

Projector 输出：

- `meta.source: generated` 与 `meta.layout: hierarchical`；另加最小 adapter provenance。
- node/module/edge `id` 使用 factory ID；`identity` 保留完整 `{ scheme, key }`。
- `from/to` 使用 node renderer ID。
- semantic hints 只映射到现有 canonical fields；未知 hint diagnostic + conservative semantic fallback，不接受 raw style。
- projector 返回 spec 后才调用 `validateSpec` 和 `applyAutoLayout`；adapter/projector module 禁止 import Desktop/XML writer。

为 identity metadata 更新 `spec.schema.json`、`validateSpec`、schema drift key set 和 `buildArchMetadata`。旧 spec 可没有 identity；新 adapter-produced spec 必须有 identity。

## 5. Error Boundary

统一 error object 至少包含 `code`、`message`、`adapter`、`source`、可选 `identity`/`path` 和 `cause`。CLI 只渲染这些字段。Parser child 抛 `ADAPTER_PARSE`/`ADAPTER_UNSUPPORTED`；foundation 抛 projection/identity errors；optional wrapper 抛 dependency error；live child 抛 drift compatibility error。

Diagnostics 是明确的非致命信息，例如 inferred Compose project 或跳过 unsupported external reference。会改变 identity、删除已声明 node/edge 或产生不确定结果的情况不能降级为 warning。

## 6. Layout And Graphviz Decision

`autolayout.py` 映射为 `replace`：foundation/projector 只设置 hierarchical intent，现有 `applyAutoLayout` 使用 vendored ELK，之后 canonical renderer 生成 XML。Graphviz `dot/tred` 不加入依赖，也不保留 upstream XML generator。只有后续 fixture 证明 ELK 无法满足具体图族且有对比 score 时，才另行设计 optional Graphviz tool；当前为 `defer` + `missing evidence`。

## 7. Compatibility And Rollback

- Projection version hard gate；未来 migration 以显式 converter 实现。
- Identity fields 对旧 canonical spec 可选，对 adapter projection 输出强制。
- 新 modules/exports/routes 可独立移除；现有 Mermaid/CSV/drawio adapters 不改变返回值。
- `.arch.json` 只增加 sanitized identity/provenance；不改变 final `.drawio/.svg` contract。
- 若 schema 扩展产生兼容问题，回滚 adapter route 和 identity metadata；不修改现有 ID regex。

## 8. Evidence Matrix

| Evidence | Required here | Status before implementation |
| --- | --- | --- |
| schema/identity unit fixtures | yes | planned |
| projection -> spec -> JS ELK command | yes | planned |
| Graphviz comparison | no | missing evidence / deferred |
| provider CLI capture | no | missing evidence |
| Desktop export | no | missing evidence |
| visual model execution | no | missing evidence |
