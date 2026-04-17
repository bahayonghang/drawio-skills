# 导出与保存

Draw.io Skill 把导出视为离线 bundle 工作流的一部分，而不是浏览器会话里的附属动作。

## 规范产物三件套

只要图表后面还会改，就尽量把这些文件放在一起：

- `<name>.drawio`
- `<name>.spec.yaml`
- `<name>.arch.json`

这样可以在不依赖 live session 的前提下持续本地迭代。

对于 `academic-paper` 输出，默认交付物是这套 bundle 加 `.svg`。只有当请求是 thesis、A4、Word、raster-first、截图重绘或明确要求 PNG 时，才额外补一个 `.png`，并且需要 draw.io Desktop 可用。

## 常用导出命令

### 生成 `.drawio`

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars
```

### 生成独立 SVG

```bash
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars
```

### 借助 draw.io Desktop 生成 PNG、PDF 或 JPG

```bash
node skills/drawio/scripts/cli.js input.yaml output.pdf --validate --use-desktop
node skills/drawio/scripts/cli.js input.yaml output.png --validate --use-desktop
```

## 导入现有 `.drawio`

如果你拿到的是已有 `.drawio` 文件，但想切回 YAML-first 编辑流程：

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars
```

这会生成可继续版本化维护的 sidecar bundle。

## Embedded SVG 与 Standalone SVG

- **Standalone SVG**：完全离线可生成
- **Embedded `.drawio.svg`**：需要 draw.io Desktop，并在导出路径里保留 round-trip editing 元数据

当你需要 embedded SVG 时，再启用 `--use-desktop`。

## 可选 MCP 导出

如果你已经处于 live browser session，也可以通过 `export_diagram` 保存 `.drawio`、`.png` 或 `.svg`。

但这是可选路径；默认导出模型仍然是本地 CLI 生成。

## 如何选导出格式

| 需求 | 推荐输出 |
|------|----------|
| 后续继续编辑 | `.drawio` bundle |
| 论文插图 | `.svg` |
| 论文插图 + 可编辑源 | `.drawio` + `.spec.yaml` + `.arch.json` + `.svg` |
| 幻灯片图片 | 配合 Desktop 的 `.png` 或 `.jpg` |
| 可打印交付 | 配合 Desktop 的 `.pdf` |

## 建议

- 论文级输出建议启用 `--strict-warnings`
- 需要矢量质量时优先保留 SVG
- 只要图表未来还会演化，就保留 sidecar

## 下一步

- [CLI 工具](./cli.md)
- [编辑图表](./editing-diagrams.md)
- [SVG 转换器](/zh/api/svg-converter.md)
