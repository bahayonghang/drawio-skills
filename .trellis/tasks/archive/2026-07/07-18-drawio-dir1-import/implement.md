# Implement - 方向①导入与漂移 bucket 编排

本 bucket 不运行 `task.py start`，不直接修改生产代码。

## Planning Gate

- [x] 创建四个独立 child，均使用 `--no-start` 且保持 `planning`。
- [x] 写明跨 child dependency、delivery order、acceptance boundary 和 rollback。
- [x] 为每个 child 准备 `prd.md`、`design.md`、`implement.md`。
- [x] 将 15 个相关 upstream 脚本分配给唯一 owner 并给出 mapping。
- [x] 用户审阅并明确批准首个 foundation child；只启动了该 child。

## Delivery Order

1. `07-18-drawio-adapter-identity-foundation`
2. foundation 完成后，`07-18-drawio-code-importers` 与 `07-18-drawio-config-importers` 可分别启动。
3. config 完成后启动 `07-18-drawio-live-snapshots-drift`；它同时消费已归档 C0 合同。
4. 四个 child 独立验收、归档后，由父任务的 integration/promotion child 做 route/docs/package 总审。

## Per-Child Start Gate

每次只启动一个真正 deliverable child。启动前：

- 重新运行 `trellis-before-dev` 并读取该 child 三件套、父 research、`frontend` 与 `drawio-skill` specs。
- 检查前置 child 已完成且消费的 schema/version/identity fixtures 存在。
- 确认可选生产依赖已获批准；未批准的分支保持 out of scope 或 `missing evidence`。
- 保持父任务与本 bucket 为 `planning`；inline 模式不要求 jsonl curation。

## Cross-Child Validation

Focused tests 由各 child 自己定义。每个 runtime child 最少运行：

```powershell
node --test <focused-test-files>
npm test
just ci
npm run docs:build
```

docs build 只在公共 docs/reference surface 变化时是 child 完成硬门；未运行的 gate 必须在 child evidence 中说明，不能标成 pass。

跨 child 额外检查：

- 同一 Terraform/Kubernetes/Compose fixture 的 declared/live identity 完全相同。
- label、输入顺序和绝对 checkout path 变化不改变 identity 或 render ID。
- 所有 importer spec 都可通过 `validateSpec`、JS ELK 和 XML validation。
- Graphviz/Python/provider/model 未执行路径保持显式 optional 或 `missing evidence`。
- academic overlay 没有新增 runtime/schema/parser 副本。

## Bucket Rollback

如果 foundation contract 在后续 child 暴露缺陷，回到 planning 修订 versioned contract，再逐 child 更新；不得在 live child 私建第二套 identity。任何 child 可单独回滚，现有 Mermaid/CSV/drawio import 路径必须继续工作。
