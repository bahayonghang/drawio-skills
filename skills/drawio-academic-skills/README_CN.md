# Draw.io Academic Skill

面向论文图、IEEE 风格架构图、科研流程图、路线图、公式图和出版级导出的 draw.io skill。

这个目录融合了两套能力：

- `ref/drawio-skill`：纯 SKILL.md 画图、Desktop 导出、自检、样式预设、diagrams.net URL 兜底。
- `skills/drawio`：YAML DSL、CLI 校验、离线 sidecars、学术图质量门和公式处理。

## 默认链路

```text
需求 -> YAML spec -> CLI 校验 -> .drawio + .spec.yaml + .arch.json + .svg
```

PNG、PDF、JPG 和 embedded `.drawio.svg` 通过 draw.io Desktop 导出。

## 快速导出

```bash
node skills/drawio-academic-skills/scripts/cli.js input.yaml figure.svg --validate --write-sidecars
node skills/drawio-academic-skills/scripts/cli.js input.yaml figure.png --validate --use-desktop
```

如果没有 draw.io Desktop，可以生成 diagrams.net 浏览器 URL：

```bash
node skills/drawio-academic-skills/scripts/runtime/diagrams-net-url.js figure.drawio
```

## MCP 定位

这个 skill 不携带 `.mcp.json`。日常 create、edit、replicate、export 都走离线优先。

## 样式预设

用户预设目录：

```text
~/.drawio-academic-skills/styles/
```

上游内置预设保留在 `styles/built-in/`。

## 重要参考

- `SKILL.md`：融合后的主工作流。
- `references/docs/upstream-pure-drawio-skill.md`：保留的上游纯 SKILL.md 工作流。
- `references/docs/academic-figure-playbook.md`：学术图类型和交付规则。
- `references/docs/academic-export-checklist.md`：出版级检查清单。
- `references/docs/math-typesetting.md`：公式规则。
- `references/examples/`：可复用 YAML 示例。
