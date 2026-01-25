# 样式预设（Draw.io Style 字符串）

本页提供可直接复制粘贴的 style 字符串预设，用于让图表更一致、更“专业”。可用于：

- 生成 draw.io XML（写入 cell 的 `style="..."`）
- 通过 `edit_diagram` 更新节点/连线样式

## 默认配色

- 主流程填充：`#dae8fc`
- 主流程描边：`#6c8ebf`
- 成功填充：`#d5e8d4`
- 成功描边：`#82b366`
- 提示填充：`#fff2cc`
- 提示描边：`#d6b656`
- 容器填充：`#f5f5f5`
- 容器描边：`#999999`

## 节点预设

### 主节点（服务/组件）

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=14;fontColor=#000000;
spacingLeft=10;spacingRight=10;spacingTop=6;spacingBottom=6
```

### 数据/结果（绿色）

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#d5e8d4;strokeColor=#82b366;fontSize=14;fontColor=#000000;
spacingLeft=10;spacingRight=10;spacingTop=6;spacingBottom=6
```

### 备注/约束（黄色）

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#fff2cc;strokeColor=#d6b656;fontSize=13;fontColor=#000000;
spacingLeft=10;spacingRight=10;spacingTop=6;spacingBottom=6
```

### 公式节点（更友好）

```
rounded=1;html=1;whiteSpace=wrap;align=left;verticalAlign=middle;
fillColor=#ffffff;strokeColor=#6c8ebf;fontSize=16;fontColor=#000000;
spacingLeft=12;spacingRight=12;spacingTop=8;spacingBottom=8
```

## 连线预设

### 主流程（正交）

```
edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;
endArrow=block;endFill=1;strokeColor=#333333;strokeWidth=2;html=1
```

### 数据流（虚线）

```
edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;
endArrow=block;endFill=1;strokeColor=#333333;strokeWidth=2;dashed=1;dashPattern=6 4;html=1
```

## 快速排版规则

- 同一层级节点尽量统一宽度
- 节点间距保持均匀（约 40–80px）
- 技术类图优先使用正交连线并避免交叉

