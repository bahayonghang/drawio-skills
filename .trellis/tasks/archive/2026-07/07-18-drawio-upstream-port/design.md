# Design - drawio 上游能力等价整合与视觉返工闭环加固

## 1. 已确定架构决策

### D1 功能等价，不做逐脚本兼容

用户选择功能等价整合。上游脚本是行为与测试参考，不是必须保留的公共 API。

每项能力采用四类处理：

- `bridge`：本仓已有等价能力，只补路由或回归证据。
- `adapt`：复用上游算法/契约，但输出 canonical spec，进入本仓管线。
- `replace`：上游实现不符合 offline/security/YAML-first，按本仓边界重做。
- `defer`：价值或证据不足，保留研究结论，不进入当前 release。

37 项逐项证据放在 `research/upstream-capability-audit.md`，避免在 `SKILL.md`、PRD 和设计中复制同一清单。

### D2 canonical pipeline 是唯一主干

```text
source
  -> input adapter / optional isolated tool
  -> canonical spec or canonical page bundle
  -> validateSpec
  -> JS ELK when layout is needed
  -> specToDrawioXml
  -> validateXml
  -> artifacts / Desktop export
  -> deterministic inspection
  -> visual review
  -> canonical patch and rerender
```

Adapter 不能直接建立长期并行的 graph-JSON-to-XML renderer。短暂 graph projection 只能是有版本的内部契约，并必须投影回 canonical spec。

### D3 语言与依赖边界

- JS/ESM：CLI、canonical adapters、布局接入、XML 变换、PNG 检查、HTML 生成和大多数后处理。
- Python 3 可选：只有当标准库或成熟 Python 生态显著降低解析/导出风险时使用，例如 Python AST、PyYAML、python-pptx、Pillow。
- Python 工具通过 stdin/stdout JSON 或文件契约与 Node orchestration 连接；不得成为普通 create/edit/export 的隐式前置条件。
- Graphviz 不再作为通用布局必需项；本仓 vendored ELK 是默认。只有经证据证明 ELK 不满足的独立工具才可声明 Graphviz 可选依赖。

### D4 base 与 overlay

- `skills/drawio` 拥有 runtime、schemas、adapters、shared helpers、references、fixtures 和通用 evals。
- `skills/drawio-academic-skills` 只追加 publication policy 与 academic evals。
- 视觉返工的完整流程只在 base 有一个事实源；overlay 保留一行强指针并追加论文可读性 rubric。

## 2. 核心数据契约

### 2.1 Canonical adapter result

现有 Mermaid/CSV 等简单 adapter 可直接返回当前 DSL 可消费的对象：

```json
{
  "meta": { "source": "generated", "layout": "hierarchical" },
  "nodes": [],
  "edges": [],
  "modules": []
}
```

需要跨 snapshot identity、重要属性或多 domain normalization 的 C1 adapter 输出 `CanonicalGraphProjection v1`，再由 shared identity factory/finalizer 与 projector 转成上述 spec。具体 parser 不自行拼 identity/hash。两条路径的样式、主题、布局和导出都回到 base DSL。

C1 规划进一步把完整 external identity 与 renderer-safe canonical `id` 分离：adapter 先输出 versioned canonical graph projection 的结构化 `{ scheme, key }` identity，再由共享 factory 确定性派生符合现有 ID regex 的 hash ID。projection 保留完整 identity 供 drift/sidecar 使用，render ID 供 canonical patch、ELK 和 renderer 使用；两者都不得依赖 label、输入顺序或绝对 checkout path。

### 2.2 Stable identity

跨快照能力必须使用确定性 identity：

- Terraform：module-qualified resource address + instance key。
- Kubernetes：cluster scope + namespace + kind + name。
- Compose/Docker：project + service；运行时容器实例作为次级 identity。
- Code：package/module-relative canonical path；类为 module + qualified class name。
- OpenAPI：method + normalized path；schema 为 canonical component name。
- CI：provider + workflow + job；matrix 展开作为属性或稳定 suffix。

`drawiodiff` 比较 identity、重要属性和边集合；label 只作为显示或显式 fallback，不能作为默认稳定身份。

### 2.3 Canonical page bundle

最终字段与兼容边界由 `07-19-drawio-multi-page-foundation/design.md` 持有。父任务只固定以下跨 child 不变量：legacy flat YAML 默认输出不变；新 bundle 使用显式 version；页面顺序由数组保持；页面和对象以 `(pageId, objectId)` 稳定寻址；schema、serialize/import、renderer、sidecar 和 per-page validation 必须作为一个可 round-trip 的基础契约交付。

C4 和 compress 只能在各自后继 child 中消费该 foundation，不得反向把语义预设、聚类或摘要命名塞入基础层。

## 3. R0 视觉识别与返工设计

R0 的详细实现设计由 `07-18-drawio-vision-rework/design.md` 持有。父任务只固定跨任务契约：

- `vision-preview` 是供模型/人工检查的临时或 work-dir artifact，不改变 final deliverable 默认值。
- preview 不嵌入 XML，不使用 300dpi scale；检查 IHDR 后按 width/height 重导，最终最长边不超过 2000px。
- final 仍可嵌入且保持现有输出命名；PNG repair 是结构验证后的兼容分支，不是无条件追加字节。
- Desktop 返回后等待文件存在且大小稳定。
- 视觉输出使用结构化 review record；返工优先 canonical YAML/spec。
- C1 drift、C2 raster/C4、C3 prdiff/buildup 都复用这个 preview/review contract。

## 4. 能力域整合

### 4.1 方向一

- importers 放入 `scripts/adapters/` 或由 adapter 调用的隔离工具。
- adapter 输出 canonical spec；`cli.js` 只做参数和路由。
- shared parsing/escaping 进入 `scripts/shared/`，不在多个后处理器复制 XML flatten 逻辑。
- declared/live 对使用相同 identity factory；先完成 identity contract，再实现 drift。

### 4.2 方向二

- `shapesearch`：`bridge` 到当前 catalog search。
- network/swimlane：`bridge` 到当前 semantic types/docs/evals。
- raster：`adapt` 到 replicate + canonical spec。
- SysML/BPMN：先做 capability gap；只补 semantic/schema/docs/evals 中真实缺口。
- C4：`replace` 为 canonical multi-page 模型，不能直接照搬 Python XML generator。
- AI icons：`replace` 上游 CDN 解析器。由固定的 `@lobehub/icons-static-svg@1.91.0` 生成 309 品牌的 `assets/catalog/ai-icons.json.gz`，运行时通过独立 lazy loader 读取；resolver 保持窄接口、兼容已有公共别名，并为未知名称提供离线建议。
- canonical variant 确定性选择顺序为 `-color`、`-brand-color`、base；当前来源 871 个 SVG 已验证可解析为 309 个真实 base brand，分布为 209/1/99。上游报告的 311 包含 `civitai-text-color` 与 `kwaikat-text-color` 被误分出的两个伪 family。生成器固定排序、来源 integrity、许可证和安全拒绝规则，不把 npm 包加入 runtime dependencies。

### 4.3 方向三

- explain/relabel/restyle/heatmap/runbook/drawio2mermaid：优先纯 JS、复用 shared XML parser。
- interactive HTML/svgflow：复用 Desktop provider 与导出稳定等待；嵌入内容需要 sanitization/CSP 评估。
- PPT/buildup/timelapse/compress：独立声明外部依赖、输入限制和降级，不伪装成 parser。
- prdiff：独立 Governed 子任务，默认禁用示例；固定下载版本与 hash，actions 固定 commit SHA，最小权限。

## 5. Skill 信息架构

`SKILL.md` 只保留：

1. 能力族路由。
2. canonical/offline/base-overlay 安全边界。
3. 完成报告与视觉验证的一行强契约。
4. 指向 `references/workflows/` 和 capability toolbox 的 context pointers。

详细脚本、依赖、例子和故障排查放入 references；确定性逻辑放 scripts；可复现质量证据放 evals/reports。不得复制上游 6,000+ words 的入口，也不得在 base 与 academic 重复完整流程。

## 6. 安全与治理

- 所有输入 adapter 继续经过 `validateSpec`。
- HTML/Markdown 输出对标签、链接、SVG、Git subject、文件名进行上下文正确的 escaping/sanitization。
- Python/Node 子进程使用参数数组，不拼接 shell；路径和可执行候选沿用现有 Desktop 安全模式。
- 网络功能默认关闭且隔离；AI 图标目录没有联网扩展，刷新只发生在显式开发期供应链流程中，普通 create/edit/export 运行时零网络访问。
- PR bot 记录 permission、dependency pin、download checksum、package hash 和残余风险。
- recorded fixture 不得被称为 model-executed；未运行的外部路径是 `missing evidence`。

## 7. Rollout 与所有权

1. C0 先行，产出所有后续能力复用的 preview/review contract。
2. C1 已拆成 adapter/identity foundation、code importers、config importers、live snapshots + drift 四个独立 deliverable；C1 bucket 保持 planning。C2/C3 仍是能力域 bucket；C2 已先拆出 `07-18-drawio-ai-icon-catalog`，其余 raster、diagram types 和 multi-page 仍待独立规划。
3. C1 顺序为 foundation -> code/config（可并行交付）-> live/drift；live/drift 同时依赖已完成 C0。依赖已写入每个 child artifact，不由目录树暗示。
4. PR bot 独立 Governed child。
5. 最后创建 integration/promotion child，统一修改 SKILL routing、interfaces、evals、compatibility 和 release evidence。
6. 父任务保持 planning/integration-only，不直接修改生产代码。

## 8. Rollback

- 每个 feature child 只拥有一个可独立回滚的契约面。
- C0 保持现有 final export 默认值，preview 作为新增显式 profile；回滚时移除 preview 路由不会破坏旧调用。
- Adapter 与 multi-page schema 通过版本化 fixture 保护；发生兼容问题时保留旧单页路径。
- 网络或 Governed 能力可以整体禁用，不影响 offline base。
