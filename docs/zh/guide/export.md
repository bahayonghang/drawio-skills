# 导出与保存

Draw.io Skill 把导出视为离线 bundle 工作流的一部分，而不是浏览器会话里的附属动作。

## 最终产物与工作目录 Sidecars

最终交付目录默认只放用户通常需要保留的文件：

- `<name>.drawio`
- `<name>.svg`

除非用户明确要求 sidecar bundle 放在输出旁边，否则把中间 sidecars 放在 `.drawio-tmp/<name>/` 这类项目工作目录：

- `<name>.spec.yaml`
- `<name>.arch.json`

这样可以在不依赖 live session 的前提下持续本地迭代，同时保持最终目录干净。只有当请求是 thesis、A4、Word、raster-first、截图重绘或明确要求 PNG 时，才额外补一个 `.png`，并且需要 draw.io Desktop 可用。

## 常用导出命令

### 生成 `.drawio`

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/output
```

### 生成独立 SVG

```bash
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars --sidecar-dir .drawio-tmp/output
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

## 视觉验证顺序

视觉检查优先使用导出产物，而不是浏览器截图：

1. 当前环境能查看 SVG 时，先检查生成的 SVG。
2. 如果需要栅格或最终保真检查，且 draw.io Desktop 可用，检查 Desktop 导出的 PNG、PDF、JPG 或 embedded `.drawio.svg`。
3. 只有在用户明确要求 live refinement，且没有可检查的导出产物时，才把浏览器或 Playwright 截图作为兜底。

## 如何选导出格式

| 需求 | 推荐输出 |
|------|----------|
| 后续继续编辑 | `.drawio` + 工作目录 sidecars |
| 论文插图 | `.svg` |
| 论文插图 + 可编辑源 | 最终 `.drawio` + `.svg`，sidecars 放在 `.drawio-tmp/<name>/` |
| 幻灯片图片 | 配合 Desktop 的 `.png` 或 `.jpg` |
| 可打印交付 | 配合 Desktop 的 `.pdf` |

## 建议

- 论文级输出建议启用 `--strict-warnings`
- 需要矢量质量时优先保留 SVG
- 只要图表未来还会演化，就保留工作目录 sidecars

## 下一步

- [CLI 工具](./cli.md)
- [编辑图表](./editing-diagrams.md)
- [SVG 转换器](/zh/api/svg-converter.md)
