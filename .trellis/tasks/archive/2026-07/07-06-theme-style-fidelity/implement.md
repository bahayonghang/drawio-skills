# Implement — 主题样式保真与网络图标修正

> .js 一律经 Bash 写入（format-hook memory）；单块命令 ≤8KB（Windows 截断阈值）。

## Checklist

1. [ ] 生成 `assets/catalog/shape-catalog.json.gz`（python 从 ref shape-index 过滤生成，含 builtin/stencils/aws4ResourceIcons 与 _source 注记）。
   - 验证：zcat 解析 JSON 成功，三段计数 ≈ 78/1125/554。
2. [ ] 新增 `scripts/dsl/shape-catalog.js`（懒加载 + isKnownShapeName/isKnownAws4ResourceIcon）。
   - 验证：node -e 抽查 switch=true、mxgraph.cisco.security.firewall=true、mxgraph.cisco.firewalls.firewall=false。
3. [ ] spec-to-drawio.js 六处修改：falsy `??`、applyThemeRounding、字体链接入 theme.typography、图标映射正名与 subnet 删除、aws4 resIcon 复合样式、validateSpec 未知形状 warning。
   - 验证：mod-test.yaml academic 渲染 XML 含 rounded=0 无 arcSize；aws-vpc-topology 渲染无 rds_instance 子网。
4. [ ] SVG 渲染器双名兼容 + 其测试夹具换正名。
   - 验证：svg 测试通过。
5. [ ] 更新既有断言（spec-to-drawio.test.js / integration.test.js）+ 新增单测（rounded/字体链/映射/目录自检/未知 icon warning）。
   - 验证：npm test 全绿。
6. [ ] 示例与文档：aws-vpc-topology.yaml、style-reference.md、themes.md、theme.schema.json。
   - 验证：grep 无旧假名残留（ref/ 目录除外）；全示例渲染回归。
7. [ ] 全量检查：npm test + 全主题×全示例渲染。

## 回滚点

- 步骤 3 后回归失败：git checkout spec-to-drawio.js。
- 单分支单提交，revert 即回滚。
