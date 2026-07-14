# 学术出版 Overlay

当图表用于论文、学位论文、期刊、会议、IEEE/ACM 投稿、manuscript、camera-ready 包或 Word/LaTeX 出版物时，应使用 `drawio-academic-skills`，而不是只使用 Base Skill。

## 边界

Overlay 有意保持轻量：

- `../drawio` 负责 CLI、schema、渲染器、主题、通用工作流、示例、样式预设和 Desktop 导出。
- `drawio-academic-skills` 负责出版决策、论文可读性门槛、学术示例和导出检查。

两个 skill 必须并列安装。如果找不到 `../drawio/scripts/cli.js`，应停止并安装 Base Skill，不能把 Base runtime 复制进 Overlay。

## 学术预检

渲染前先确定：

1. 投稿场景和目标读者。
2. 图类型：`architecture`、`roadmap` 或 `workflow`。
3. 颜色策略：单色、灰度安全强调色或彩色 PDF。
4. caption、title、legend 和缩写要求。
5. 公式与文字位置保真要求。
6. 打印目标和导出格式。
7. 节点预算，以及是否需要拆图。

```yaml
meta:
  profile: academic-paper
  figureType: workflow
  theme: academic
  title: Experimental workflow
  print: { target: ieee-single }
```

## 源材料理解与方案确认

对于论文，只提取图中需要的问题、证据链、方法、机制、验证、结论和贡献。对于参考图，盘点容器、标签、公式、连接线、图例、颜色以及不确定内容。

复杂论文图或学术参考图复刻必须先给出简明图表方案并等待确认；简单且要求完整的图可以直接进入 YAML。

## 可选图片预览

外部图片模型只能在方案确认后作为概念预览使用，它不是最终产物。

- 发送未发表、机密、专有或敏感材料前必须询问用户。
- 优先发送精简方案、短标签、布局意图和样式约束，而不是原始文档。
- 模型生成的文字和公式只能视为近似结果，最终必须在 YAML 中纠正。
- 权威视觉验证对象是导出的 Draw.io 产物，不是概念预览。

## 交付

默认学术最终产物为：

- 可编辑的 `<name>.drawio`
- draw.io Desktop 导出的 300 DPI `<name>.png`

Desktop 不可用时，PNG 会回退为独立 SVG，并且必须明确报告。`.spec.yaml`、`.arch.json`、归一化 YAML 和诊断信息应放在工作目录。

```bash
node skills/drawio/scripts/cli.js input.yaml figure.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/figure --strict-warnings
node skills/drawio/scripts/cli.js input.yaml figure.png --validate --use-desktop
```

IEEE 或其他要求矢量格式的投稿应显式导出 PDF 或目标期刊支持的矢量格式。默认 PNG 适合评审、Word、学位论文和栅格优先交付，不能代替投稿要求的矢量文件。

## 质量门

交付前确认：

- 标签在目标印刷宽度下仍清晰可读
- 节点数量符合 academic playbook 预算
- 公式使用支持的定界符
- 中英文混排使用预期的 Times New Roman 与 SimSun 字体栈
- 颜色不是唯一的语义载体
- caption、legend、标签和公式没有裁切
- 边标签避开线条，箭头不穿过文字或节点
- 已检查导出 PNG、回退 SVG 或用户要求的 Desktop 产物
- 发现可见缺陷后已修改 YAML 并重新渲染

Academic Overlay 永远不要求 MCP 或 live backend。

## 相关内容

- [工作流](./workflows.md)
- [复刻图表](./scientific-workflows.md)
- [数学公式排版](./math-typesetting.md)
- [导出与产物](./export.md)
