# CLI 工具

CLI 用于把图表输入转换成 `.drawio`、SVG，或者把现有图导入成 YAML bundle。

## 用法

```bash
node skills/drawio/scripts/cli.js <input> [output] [options]
```

## 输入类型

| 输入 | 用法 |
|------|------|
| YAML | 默认输入格式 |
| Mermaid | `--input-format mermaid` |
| CSV | `--input-format csv` |
| `.drawio` | `--input-format drawio --export-spec` |
| stdin | 把输入路径写成 `-` |

## 关键参数

| 参数 | 说明 |
|------|------|
| `--input-format <f>` | `yaml`、`mermaid`、`csv` 或 `drawio` |
| `--theme <name>` | 覆盖主题：`tech-blue`、`academic`、`academic-color`、`nature`、`dark`、`high-contrast` |
| `--page <selector>` | 导入 `.drawio` 时按索引或页面名选择页面 |
| `--export-spec` | 导出规范 YAML，而不是直接渲染 XML/SVG |
| `--write-sidecars` | 在输出旁边写出 `.spec.yaml` 和 `.arch.json` |
| `--use-desktop` | 借助 draw.io Desktop 生成 PNG、PDF、JPG 或 embedded SVG |
| `--validate` | 打印规格 warning 并执行 XML 校验 |
| `--strict` | 把 warning 和严格复杂度错误都视为失败 |
| `--strict-warnings` | `--strict` 的别名 |

## 输出格式

| 输出 | 结果 |
|------|------|
| 不写输出路径 | XML 打到 stdout |
| `.drawio` | draw.io XML 文件 |
| `.svg` | 独立 SVG |
| `.png` | Desktop 导出 |
| `.pdf` | Desktop 导出 |
| `.jpg` | Desktop 导出 |

## 示例

### 生成 `.drawio` bundle

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --validate --write-sidecars
```

### 生成严格校验 SVG

```bash
node skills/drawio/scripts/cli.js input.yaml output.svg --validate --write-sidecars --strict-warnings
```

### 覆盖主题

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --theme high-contrast
```

### 导入现有 `.drawio`

```bash
node skills/drawio/scripts/cli.js existing.drawio --input-format drawio --export-spec --write-sidecars
```

### 转换 Mermaid

```bash
node skills/drawio/scripts/cli.js flow.mmd output.drawio --input-format mermaid --validate
```

## 校验输出

`--validate` 会输出两层结果：

1. 规格 warning
2. XML 校验结果

如果希望这些 warning 直接阻断产物，使用 `--strict` 或 `--strict-warnings`。

## 相关

- [规格格式](./specification.md)
- [导出与保存](./export.md)
- [SVG 转换器](/zh/api/svg-converter.md)
