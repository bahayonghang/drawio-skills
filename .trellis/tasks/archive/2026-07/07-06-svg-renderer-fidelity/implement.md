# Implement — SVG 渲染器保真修复

> 复现基线已确认：`/tmp/svg-fix/mod-test.yaml` → 子节点画在 (24,64) 重叠、边零长度。
> .js 一律经 Bash 写入（项目 memory：PostToolUse prettier 会改写引号风格）。

## Checklist

1. [ ] `drawio-to-svg.js`：新增几何辅助（`resolveAbsoluteGeometry`、矩形-线段裁剪、锚点解析、正交折弯合成、`splitLabelLines`/`renderTextElement`）。
   - 验证：`node --test skills/drawio/scripts/svg/` 既有 26 测试仍绿。
2. [ ] 重接主循环：绝对坐标注入 renderVertex/renderEdge/renderEdgeLabel/viewBox；边改点列渲染（2 点 line / ≥3 点 polyline）；标签三处接 tspan 管线；classifyShape+cube 绘制。
   - 验证：`node skills/drawio/scripts/cli.js /tmp/svg-fix/mod-test.yaml /tmp/svg-fix/mod-test.svg`，SVG 中 Encoder rect x=64 y=104、Decoder x=264 y=104，边端点 (184,134)→(264,134)（锚点 exitY/entryY=0.25 → y=104+0.25*60=119？以实际锚点公式为准），非零长度。
3. [ ] 扩展 `drawio-to-svg.test.js`：嵌套容器×2 层、waypoints、exit/entry 锚点、正交无 waypoint、8 行图例 tspan、cube、多行边标签。
   - 验证：新测试先红后绿（当前实现下坐标断言必失败）。
4. [ ] 全量渲染回归：`references/examples/*.yaml` + `skills/drawio-academic-skills/references/templates/*.yaml` 逐个 → SVG 无抛错；抽查 modules 场景坐标。
   - 验证：循环脚本 exit 0。
5. [ ] 文档措辞同步：`SKILL.md` 限制第 12 条、`references/docs/xml-format.md:31`、`references/workflows/create.md:130` 按新能力如实改写（保留"复杂正交路由仍以 Desktop 为准"的边界）。
   - 验证：grep 无"straight-line edge previews"残留。
6. [ ] 最后一轮全量检查：`node --test tests/` + `node --test skills/drawio/scripts/`。
   - 验证：全部通过。

## 回滚点

- 步骤 2 后如输出大面积回归：`git checkout -- skills/drawio/scripts/svg/drawio-to-svg.js` 回到基线。
- 全部改动单分支单提交，revert 即回滚。
