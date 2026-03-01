# SVG 转换器 API

SVG 转换器将 draw.io mxGraphModel XML 转换为独立的 SVG 标记。零外部依赖，仅使用 Node.js 内置模块。

## 导入

```javascript
import { drawioToSvg } from './skills/drawio/scripts/svg/drawio-to-svg.js'
```

## `drawioToSvg(xmlString)`

将 draw.io XML 转换为独立 SVG。

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `xmlString` | `string` | draw.io mxGraphModel XML 内容 |

### 返回值

`string` — 完整的 SVG 标记，包含 `<svg>` 包装器、标记定义、形状、边和文本标签。

### 异常

`Error` — 如果输入为空、不是字符串或仅包含空白字符。

### 示例

```javascript
import { drawioToSvg } from './src/svg/drawio-to-svg.js'

const xml = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Hello" style="rounded=1;fillColor=#DBEAFE;strokeColor=#2563EB;"
            vertex="1" parent="1">
      <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`

const svg = drawioToSvg(xml)
// 返回包含蓝色圆角矩形和 "Hello" 文本的 SVG
```

## 支持的形状

| 形状 | 样式触发 | SVG 元素 |
|------|----------|----------|
| 矩形 | 默认 | `<rect>` |
| 圆角矩形 | `rounded=1` | `<rect rx="...">` |
| 胶囊形 | `rounded=1;arcSize>=50` | `<rect rx="height/2">` |
| 圆柱体 | `shape=cylinder3` | `<rect>` + `<ellipse>` × 2 |
| 菱形 | `rhombus` | `<polygon>` |
| 椭圆 | `ellipse` | `<ellipse>` |
| 平行四边形 | `shape=parallelogram` | `<polygon>` |
| 文档形 | `shape=document` | `<path>` 波浪底部 |
| 云形 | `shape=cloud` | `<path>` 云弧线 |

## 箭头标记

| 类型 | ID | 说明 |
|------|----|------|
| Block | `arrow-block` | 实心三角形 |
| Open | `arrow-open` | V 形（空心） |
| Classic | `arrow-classic` | 带缺口的实心箭头 |
| Diamond | `arrow-diamond` | 实心菱形 |

标记通过边 `<line>` 元素上的 `marker-start` 和 `marker-end` 属性引用。

## 样式属性

转换器从 mxCell 元素读取以下样式属性：

| 属性 | 默认值 | 说明 |
|------|--------|------|
| `fillColor` | `#FFFFFF` | 形状填充颜色 |
| `strokeColor` | `#000000` | 形状/边描边颜色 |
| `strokeWidth` | `1` | 描边宽度（像素） |
| `fontColor` | `#000000` | 文本颜色 |
| `fontSize` | `12`（顶点）/ `11`（边） | 字体大小 |
| `fontFamily` | `sans-serif` | 字体系列 |
| `dashed` | `0` | 启用虚线描边 |
| `dashPattern` | `3 3` | 虚线模式 |
| `endArrow` | `classic` | 终点箭头类型 |
| `startArrow` | （无） | 起点箭头类型 |

## 数据嵌入

生成的 SVG 在根 `<svg>` 元素上包含 `data-drawio` 属性，其中包含以 base64 编码的原始 draw.io XML：

```html
<svg xmlns="http://www.w3.org/2000/svg"
     width="800" height="600"
     viewBox="0 0 800 600"
     data-drawio="PG14R3JhcGhNb2RlbC4uLg==">
  ...
</svg>
```

这使得双向编辑成为可能：SVG 可以重新导入 draw.io，draw.io 会读取 `data-drawio` 属性来恢复原始图表。

## 相关文档

- [导出与保存](../guide/export.md) - 导出选项
- [CLI 工具](../guide/cli.md) - 命令行转换
- [XML 格式](./xml-format.md) - draw.io XML 结构
