# CLI 工具

Draw.io 技能包含一个命令行工具，用于将 YAML 规格转换为 draw.io XML 或 SVG 文件。

## 概述

CLI 工具允许您：

- 将 YAML 规格转换为 draw.io XML
- 从 YAML 生成 SVG 文件
- 应用不同的设计主题
- 验证生成的 XML 结构
- 在严格模式下执行复杂度护栏

## 前置要求

- 已安装 Node.js
- 已安装项目依赖（在项目根目录运行 `npm install`）

## 用法

```bash
node skills/drawio/scripts/cli.js <input.yaml> [output] [options]
```

### 参数

| 参数 | 必需 | 说明 |
|------|------|------|
| `input.yaml` | 是 | YAML 规格文件 |
| `output` | 否 | 输出文件路径。省略则输出到标准输出 |

### 选项

| 标志 | 说明 |
|------|------|
| `--theme <name>` | 覆盖 YAML 中的主题（tech-blue、academic、academic-color、nature、dark） |
| `--strict` | 错误模式：超过 30 个节点或 50 条边时报错 |
| `--validate` | 转换后运行 XML 结构验证 |
| `--help` | 显示帮助信息 |

## 输出格式

输出格式由文件扩展名决定：

| 扩展名 | 格式 | 说明 |
|--------|------|------|
| （无） | XML | 将 draw.io XML 输出到标准输出 |
| `.drawio` | XML | 保存为 draw.io XML 文件 |
| `.svg` | SVG | 转换为独立 SVG 文件 |

## 示例

### 基本转换

```bash
# 输出到标准输出
node cli.js microservices.yaml

# 保存为 .drawio 文件
node cli.js microservices.yaml output.drawio

# 转换为 SVG
node cli.js microservices.yaml output.svg
```

### 指定主题

```bash
# 使用学术主题替代 YAML 中指定的主题
node cli.js diagram.yaml output.drawio --theme academic

# 深色主题 SVG
node cli.js diagram.yaml presentation.svg --theme dark
```

### 带验证

```bash
# 验证 XML 结构
node cli.js diagram.yaml output.drawio --validate

# 严格模式（复杂图表报错）
node cli.js large-diagram.yaml output.drawio --strict

# 组合选项
node cli.js diagram.yaml output.svg --theme nature --validate --strict
```

## XML 验证

`--validate` 标志对生成的 XML 运行结构验证：

| 检查项 | 说明 |
|--------|------|
| ID 唯一性 | 所有 mxCell ID 必须唯一 |
| 边引用 | 边的 source/target 必须引用已存在的 cell ID |
| 根节点 | 根节点（id=0、id=1）必须存在 |

验证错误输出到 stderr，进程以退出码 1 结束。

## 复杂度护栏

| 模式 | 节点 | 边 | 行为 |
|------|------|-----|------|
| 默认 | >20 警告 | >30 警告 | 打印警告，继续转换 |
| `--strict` | >30 错误 | >50 错误 | 进程报错退出 |

## 相关文档

- [规格格式](./specification.md) - YAML 规格参考
- [设计系统](./design-system.md) - 主题和形状
- [导出与保存](./export.md) - 导出选项（含 SVG）
