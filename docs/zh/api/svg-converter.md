# SVG 转换器 API

SVG 转换器可在无额外运行时依赖的前提下，把 draw.io `mxGraphModel` XML 转成独立 SVG。

## 导入

从仓库根目录导入：

```javascript
import { drawioToSvg } from './skills/drawio/scripts/svg/drawio-to-svg.js'
```

## `drawioToSvg(xmlString)`

把 draw.io XML 转成独立 SVG。

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `xmlString` | `string` | draw.io `mxGraphModel` XML |

### 返回值

返回最终 SVG 字符串。

### 异常

当输入为空、只有空白字符，或不是字符串时抛出 `Error`。

## 能力

- 渲染内置语义节点家族对应的形状
- 支持常见箭头 marker
- 从 draw.io 样式串中提取文本样式
- 在 `data-drawio` 中嵌入原始 XML，支持 round-trip recovery

## 典型用法

```javascript
import { drawioToSvg } from './skills/drawio/scripts/svg/drawio-to-svg.js'

const svg = drawioToSvg(xmlString)
```

## 相关

- [导出与保存](../guide/export.md)
- [CLI 工具](../guide/cli.md)
- [XML 格式](./xml-format.md)
