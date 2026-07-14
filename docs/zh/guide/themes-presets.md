# 主题与样式预设

主题为 canvas、字体、节点、模块和 typed connector 提供一致 token。样式预设保存可复用覆盖。两者都优先于手写 raw XML style。

## Bundled Themes

| 主题 | 适用场景 |
|---|---|
| `tech-blue` | 通用浅色技术图 |
| `notion-clean` | 极简灰度文档、ER、sequence 和表格 |
| `blueprint` | 正式架构、UML、网络和数据流 |
| `arch-dark` | 按角色着色的云和服务架构 |
| `dark-terminal` | 开发者架构和 Agent 系统 |
| `dark-luxury` | 编辑式或 keynote 图表 |
| `nature` | 生命周期和自然主题 |
| `dark` | 通用深色演示图 |
| `high-contrast` | 最大可读性和无障碍 |
| `academic` | 灰度安全出版图 |
| `academic-color` | 允许彩色的出版图 |

学术请求仍应路由到 Academic Overlay；只选择 academic theme 并不会执行出版预检和质量门。

## 应用主题

```yaml
meta:
  theme: blueprint
```

也可以在命令行覆盖：

```bash
node skills/drawio/scripts/cli.js input.yaml output.drawio --theme blueprint --validate
```

Theme token 会自动变化。显式指定的节点或边颜色不会跟随之后的主题切换。

## 样式预设

`skills/drawio/styles/built-in/` 中的内置预设用于保存可复用样式决策。修改前应复制到用户目录，不能直接改 bundled preset。

Raw Draw.io style string 只用于很小的 XML patch 或精确 mxGraph handoff，不是主要编写契约。

## 选择规则

- 一张图使用一个主题，复刻带显式样式的源图除外。
- 显式配色应克制且有语义。
- 不能只用颜色表达含义，还应保留形状、标签和虚实线差异。
- 出版工作通过 Overlay 使用 `academic` 或 `academic-color`。
- 切换主题后验证对比度并检查导出产物。

## 相关内容

- [设计系统](./design-system.md)
- [架构图](./architecture-diagrams.md)
- [学术出版 Overlay](./academic-overlay.md)
