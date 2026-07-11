# 执行清单：PR #7 图标解析加固

1. [x] 更新回归测试：未知 Lobe/brand/Lucide 返回 `null` 并产生告警；所有公开内嵌图标输出 data URI；Desktop 使用 resolve 语义。
2. [x] 重构 `icon-resolver.js`：移除根依赖、文件系统读取和 CDN fallback，补齐 `server-cog` / `alarm-clock` 内嵌路径。
3. [x] 从 `package.json` / lockfile 移除 `lucide-static`。
4. [x] 同步 README 中英文、icon design docs、stencil guide 和 schema 示例，使支持集与离线契约一致。
5. [x] 添加 Lobe Icons 与 Lucide 第三方许可证声明。
6. [x] 修正 Desktop 路径 helper 与对应测试。
7. [x] 强制跟踪已存在但被 ignore 漏掉的 academic fixture，保留白名单测试并恢复 clean-checkout CI baseline。
8. [x] 运行 targeted tests：
   - `node --test skills/drawio/scripts/dsl/spec-to-drawio.test.js tests/desktop-detection.test.js tests/drawio-academic-skill.test.js tests/security.test.js`
9. [x] 按 `trellis-check` 复核源码、依赖、文档和测试一致性，运行 `just ci`。
10. [x] 按 `trellis-update-spec` 将可复制图标解析契约写入 frontend quality spec。
11. [x] 使用中文 Conventional Commit、emoji、`[AI]` 和 agent trailers 分批提交；不包含用户的 `.gitignore` / `skills-lock.json`。
12. [x] 归档任务并记录 session。

## Rollback Points

- 步骤 2 后：若文档承诺图标不能全部解析，恢复实现并重新收敛支持集。
- 步骤 4 后：用全仓 `rg` 确认无 `full Lucide`、`lucide-static` 或 Lobe CDN 残留。
- `just ci` 失败时只修复与本任务或已确认 baseline defect 相关的问题，不吸收无关工作树改动。
