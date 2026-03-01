# 导出与保存

学习如何保存图表。

## 基本导出

```
"将此图表导出为 'my-architecture.drawio'"
```

## SVG 导出

除了 `.drawio` 格式外，您还可以将图表转换为独立的 SVG 文件。

### 编程方式 SVG 转换

使用 JavaScript SVG 转换器（零外部依赖）：

```javascript
import { drawioToSvg } from './src/svg/drawio-to-svg.js'

const svg = drawioToSvg(drawioXmlString)
// 返回独立 SVG 标记
```

### 通过 CLI 工具

```bash
node cli.js input.yaml output.svg
node cli.js input.yaml output.svg --theme academic
```

### 支持的 SVG 特性

| 特性 | 详情 |
|------|------|
| 形状 | 8 种类型：圆角矩形、胶囊形、圆柱体、菱形、椭圆、平行四边形、文档形、云形 |
| 箭头 | 4 种标记：block、open、classic、diamond |
| 方向 | 同时支持 startArrow 和 endArrow |
| 文本 | 带字体系列、大小和颜色的标签 |
| 描边 | 实线和虚线模式 |
| 双向编辑 | 原始 XML 以 base64 `data-drawio` 属性嵌入 |

### 双向编辑

转换器生成的 SVG 文件将原始 draw.io XML 以 base64 编码嵌入 `data-drawio` 属性中。这意味着您可以：

1. 导出为 SVG 嵌入网页或文档
2. 将 SVG 重新导入 draw.io 继续编辑
3. 在任何兼容 SVG 的工具中使用，同时保留源文件

## 指定保存位置

## 下一步

- [创建图表](./creating-diagrams.md)
