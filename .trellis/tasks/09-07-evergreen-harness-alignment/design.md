# Design

## Ownership
R1 归 lockfile 和已有测试边界；保留生产解析器 OPTIONAL_DEPENDENCY_MISSING 行为。
R2 归 justfile 和 GitHub workflow：version-sync 显式修改，ci 只读检查。
R3 归项目 AGENTS.md、必要的 Claude 薄桥接和当前仓库安装入口；skills/ 是源码，.agents 的旧副本不能成为第二源码。
R4 归双语公共说明和 skill 内可携带说明；base 保持共享 runtime，academic 保留专属政策与示例。
R5 以父任务协调，不将代码路径充当子代理规范。

## Integration and model routing
test-baseline → quality-gates；rule-alignment 可独立开展，AGENTS.md 由它集中修改。
skill-doc-evidence 统一收尾 README、安装页和证据文档，避免两个子任务并发写这些文件。
强模型决定架构、权限、测试覆盖和支持承诺；低成本 worker 只做限定文件且有明确验收命令的小项。
harness 与 model 是两个维度，工具名不表示价格或推理水平。矩阵见 research/harness-matrix.md。

## Minimal choices
统一公共 registry 来源，保留锁定版本和 integrity；不通过 allow-remote=all 绕过安装拒绝。
默认离线测试与 opt-in 真 parser 测试分离，CI 明确执行后者。
拟议维护/CI 基线为 Node 24 LTS；本次 Node 26/npm 12 为复现环境。
Tree-sitter 在 24 上先用锁定版本验证，未通过前不改支持承诺；若需要依赖升级，另行报告和批准，不顺带升级。
package.json提供唯一只读npm gate，just代理；Windows/Linux质量作业contents: read，部署仍release-only且上传前复用gate，写权限仅deploy job。维护clean/tree使用Node，不新增核心Python依赖。
源码→本机入口优先采用经差异审查的本地链接或标准安装刷新，不引入 manifest 同步服务。
替换旧实体副本前检查是否有用户定制，必要时保留可恢复副本；不得无差别删除 .agents、.claude 或用户全局技能目录。

## Evidence and rollback
安装、静态一致性、CLI discovery、新会话、Desktop、视觉和 GitHub 当前 HEAD 作业分别记录。
未执行项标 UNVERIFIED，不能并入 pass。当前仅写 .trellis/tasks/ 新规划。
实施分子任务形成小 diff，回退仅覆盖自身变更；批准内容优先回写仓库及 skill 库，不向知识库复制本机日志。
