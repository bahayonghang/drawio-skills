# CLI 参考

离线 CLI 将 YAML、Mermaid、CSV 或现有 Draw.io bundle 转换为原生 `.drawio`、独立 SVG、Desktop 导出或 canonical YAML。

## 用法

```bash
node skills/drawio/scripts/cli.js <input> [output] [options]
node skills/drawio/scripts/cli.js search <query> [--prefix <library>] [--limit <n>] [--json]
```

## 输入

| 输入                             | 选项                                                  |
| -------------------------------- | ----------------------------------------------------- |
| YAML                             | 默认                                                  |
| Mermaid                          | `--input-format mermaid`                              |
| CSV                              | `--input-format csv`                                  |
| `.drawio`                        | `--input-format drawio`                               |
| Python 模块/类                   | `--input-format python-imports` 或 `python-classes`   |
| JavaScript/TypeScript ESM        | `--input-format js-imports`                           |
| Go package                       | `--input-format go-imports`                           |
| Rust 模块                        | `--input-format rust-imports`                         |
| Terraform / Kubernetes / Compose | `--input-format terraform` / `kubernetes` / `compose` |
| SQL DDL / OpenAPI                | `--input-format sql` / `openapi`                      |
| GitHub Actions / GitLab CI       | `--input-format github-actions` / `gitlab-ci`         |
| 结构化 raster extraction         | `--input-format raster-extraction`                    |
| stdin                            | 输入路径使用 `-`                                      |

代码导入器必须接收本地项目目录，不支持 stdin。它们只解析源码结构；Go 与
Rust route 不会调用对应语言工具链。声明态配置导入器、快照/漂移适配器与
raster extraction 都会先归一化为 canonical YAML 或 bundle v1，再进入布局与
渲染——参见[配置与 IaC 导入器](./config-importers.md)、[代码关系导入器](./code-importers.md)与[运行态快照与漂移](./live-drift.md)。

## 渲染与导入选项

| 选项                     | 用途                                            |
| ------------------------ | ----------------------------------------------- |
| `--theme <name>`         | 覆盖 YAML theme                                 |
| `--page <selector>`      | 按索引或名称选择导入的 Draw.io page             |
| `--export-spec`          | 写出 canonical YAML 而不是渲染                  |
| `--validate`             | 报告 spec 与 XML 校验结果                       |
| `--strict`               | warning 和严格质量问题也会导致失败              |
| `--strict-warnings`      | `--strict` 的别名                               |
| `--allow-unknown-shapes` | 临时把 covered stencil 的未知名称降级为 warning |

## 产物与 Desktop 选项

| 选项                  | 用途                                                  |
| --------------------- | ----------------------------------------------------- |
| `--write-sidecars`    | 生成 `.spec.yaml` 和 `.arch.json`                     |
| `--sidecar-dir <dir>` | 将 sidecar 放入指定工作目录                           |
| `--use-desktop`       | 使用 draw.io Desktop 生成 PNG/PDF/JPG 或 embedded SVG |
| `--dpi <n>`           | 栅格导出 DPI，默认 300                                |

`--sidecar-dir` 必须与 `--write-sidecars` 一起使用。除非用户明确要求 beside-output reproducible bundle，否则 sidecar 应位于最终交付目录之外。

## 输出格式

| 输出           | 结果                                            |
| -------------- | ----------------------------------------------- |
| 不提供输出路径 | 在 stdout 输出 Draw.io XML                      |
| `.drawio`      | 可编辑 Draw.io XML                              |
| `.svg`         | 独立 SVG；配合 `--use-desktop` 时为 Desktop SVG |
| `.png`         | Desktop 栅格导出，默认 300 DPI                  |
| `.pdf`         | Desktop PDF 导出                                |
| `.jpg`         | Desktop 栅格导出                                |

## 搜索 Bundled Catalog

```bash
node skills/drawio/scripts/cli.js search "s3, lambda" --prefix aws4 --limit 5
node skills/drawio/scripts/cli.js search pod --prefix kubernetes --json
```

搜索不需要网络或 MCP。应在 YAML 中使用返回的 alias。Covered stencil 中的未知名称会被拒绝并给出建议。

## 常用命令

生成可编辑最终产物，并把 sidecars 放入工作目录：

```bash
node skills/drawio/scripts/cli.js input.yaml final/diagram.drawio --validate --write-sidecars --sidecar-dir .drawio-tmp/diagram
```

生成默认 300 DPI PNG：

```bash
node skills/drawio/scripts/cli.js input.yaml final/diagram.png --validate --use-desktop
```

将现有 Draw.io page 导入为 canonical YAML：

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --page 0 --export-spec --write-sidecars --sidecar-dir .drawio-tmp/existing
```

使用严格校验转换 Mermaid：

```bash
node skills/drawio/scripts/cli.js flow.mmd final/flow.drawio --input-format mermaid --validate --strict
```

渲染 JavaScript/TypeScript ESM 依赖视图：

```bash
node skills/drawio/scripts/cli.js packages/web final/web-imports.drawio --input-format js-imports --validate
```

## 上游能力整合

离线 base 还支持声明态配置与已保存的 live snapshot adapter、结构化 raster extraction、canonical multi-page bundle，以及六种 postprocess 操作。所有 adapter 都先输出 canonical YAML 或 bundle v1，再进入校验、JavaScript ELK 布局和现有 renderer。

```bash
# 将所有页面导入为 canonical bundle v1
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --all-pages --export-spec

# 归一化可信的结构化视觉抽取
node skills/drawio/scripts/cli.js extraction.json final/redraw.drawio --input-format raster-extraction --validate

# 投影或变换 canonical 输入
node skills/drawio/scripts/cli.js postprocess mermaid bundle.yaml architecture.mmd --page context
node skills/drawio/scripts/cli.js postprocess html bundle.yaml viewer.html --all-pages
```

当前交付的 postprocess 仅包括 `mermaid`、`explain`、`relabel`、`restyle`、`heatmap` 和无脚本 `html`。Runbook、动画 SVG、tube/sequence layout、compression、buildup、PPTX、timelapse 与 PR diff 均为 defer，并非隐藏命令。离线 authoring 不依赖 Python、Graphviz、网络、Desktop、browser、MCP 或 model；显式选择的 optional parser 与 export 会准确报告缺失依赖或 fallback。

专题指南：[多页 Bundle](./multi-page.md)、[Postprocess 套件](./postprocess.md)与[上游能力映射](/zh/api/upstream-capability-map.md)。

## 失败语义

无效 YAML、异常 XML、covered library 中的未知 stencil、缺少 flag 值、不安全 icon 名称和请求导出失败都会产生明确错误。draw.io Desktop 不可用时，支持的图像导出会回退为独立 SVG 并报告；不能声称不存在的 PNG/PDF/JPG 已生成。

## 相关内容

- [配置与 IaC 导入器](./config-importers.md)
- [代码关系导入器](./code-importers.md)
- [运行态快照与漂移](./live-drift.md)
- [多页 Bundle](./multi-page.md)与 [Postprocess 套件](./postprocess.md)
- [图标与 Stencil 搜索](./icons-stencils.md)
- [规格格式](./specification.md)
- [导出与产物](./export.md)
- [SVG 转换器](/zh/api/svg-converter.md)
