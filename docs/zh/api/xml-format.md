# XML 格式参考

Draw.io XML 格式的技术参考。

## 基本结构

### 根元素

```xml
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <!-- 图表内容在这里 -->
  </root>
</mxGraphModel>
```

## 单元格（顶点）

### 基本矩形

```xml
<mxCell id="2" value="处理" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
  <mxGeometry x="160" y="120" width="120" height="60" as="geometry"/>
</mxCell>
```

### 圆角矩形

```xml
<mxCell id="3" value="开始" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
  <mxGeometry x="160" y="40" width="120" height="60" as="geometry"/>
</mxCell>
```

### 菱形（决策）

```xml
<mxCell id="4" value="决策？" style="diamond;whiteSpace=wrap;html=1;" vertex="1" parent="1">
  <mxGeometry x="160" y="200" width="120" height="80" as="geometry"/>
</mxCell>
```

## 样式

### 填充颜色

```xml
<style>...fillColor=#dae8fc;...</style>
```

### 边框颜色

```xml
<style>...strokeColor=#6c8ebf;...</style>
```

### 字体样式

```xml
<style>...fontSize=14;fontStyle=1;...</style>
```

`fontStyle=1` = 粗体
`fontStyle=2` = 斜体

## 边（连接）

### 基本箭头

```xml
<mxCell id="5" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="2" target="3">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

### 带标签的边

```xml
<mxCell id="6" value="是" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="4" target="5">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

## 常用样式属性

### 形状

- `rounded=0/1` - 圆角
- `ellipse=1` - 椭圆/圆形
- `diamond=1` - 菱形
- `swimlane` - 泳道容器

### 对齐

- `align=left/center/right` - 水平对齐
- `verticalAlign=top/middle/bottom` - 垂直对齐

### 边框

- `strokeWidth=2` - 边框粗细
- `dashed=1` - 虚线边框

### 阴影

- `shadow=1` - 投影效果

## 完整示例

```xml
<mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="开始" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
      <mxGeometry x="160" y="40" width="120" height="60" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="处理" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
      <mxGeometry x="160" y="140" width="120" height="60" as="geometry"/>
    </mxCell>
    <mxCell id="4" value="结束" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1">
      <mxGeometry x="160" y="240" width="120" height="60" as="geometry"/>
    </mxCell>
    <mxCell id="5" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="2" target="3">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="6" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="3" target="4">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>
```

## 手动编辑技巧

1. **验证 XML**：确保 XML 结构良好
2. **唯一 ID**：每个单元格必须有唯一 ID
3. **父引用**：为分层结构指定父级
4. **几何**：始终为顶点包含几何信息

## 了解更多

- [Draw.io 文档](https://www.diagrams.net/doc/faq/svg-export)
- [示例](../examples/)
