# Color Scheme Selection Guide

配色方案选择指南 — 帮助你在 3 步内为图表选出最合适的主题。

---

## 决策树（3 步选对主题）

```
Step 1: 最终用途？
  ├── 印刷 / 出版
  │   ├── 彩色印刷 / 数字 PDF → academic-color ⭐
  │   └── 严格灰度（IEEE 投稿）→ academic
  └── 数字 / 屏幕展示 → 继续 Step 2

Step 2: 目标受众？
  ├── 技术 / 工程受众 → tech-blue（默认）
  ├── 学术 / 研究受众 → academic-color
  ├── 演讲 / 汇报观众 → dark
  └── 环保 / 生态主题 → nature

Step 3: 特殊要求？
  ├── 需要高对比度（无障碍）→ academic 或 tech-blue
  ├── 深色背景投影仪 → dark
  └── 其他 → 沿用 Step 2 结果
```

---

## 主题速查表

| 主题 | Primary | Secondary | Background | 最适合 |
|------|---------|-----------|------------|--------|
| **tech-blue** | `#2563EB` | `#059669` | `#FFFFFF` | 架构图、DevOps、系统设计、API 文档 |
| **academic-color** | `#2563EB` | `#059669` | `#FFFFFF` | 论文插图、研究报告（彩印）、深度学习图 |
| **academic** | `#1E1E1E` | `#1E1E1E` | `#FFFFFF` | IEEE 论文、灰度打印、正式出版物 |
| **dark** | `#60A5FA` | `#34D399` | `#0F172A` | 演讲 PPT、屏幕展示、夜间模式 |
| **nature** | `#059669` | `#84CC16` | `#FFFFFF` | 生命周期流程、环境系统、绿色主题 |

---

## 语义颜色含义（跨主题约定）

不同节点类型在各主题中遵循统一的语义含义，即便具体颜色有差异：

| 节点类型 | 语义含义 | tech-blue Fill | 说明 |
|---------|---------|----------------|------|
| `service` | 主流程 / API 处理 | `#DBEAFE`（浅蓝） | 主要处理单元，最常用 |
| `database` | 持久化存储 | `#D1FAE5`（浅绿） | 数据持久层，区别于服务节点 |
| `decision` | 条件判断 / 分支 | `#FEF3C7`（浅琥珀） | 菱形，流程控制关键点 |
| `queue` | 异步 / 消息队列 | `#EDE9FE`（浅紫） | 解耦通信，非同步处理 |
| `terminal` | 流程起始 / 终止 | `#F1F5F9`（浅灰） | 标记流程边界 |
| `user` | 外部主体 / 角色 | `#E0F2FE`（浅天蓝） | 人或外部系统，与 service 区分 |
| `document` | 文件 / 报告 | `#FFFBEB`（浅黄） | 输出产物，非处理单元 |
| `cloud` | 外部网络 / SaaS | `#F0FDF4`（浅绿） | 第三方或网络服务 |

---

## 颜色覆盖规范

### 优先使用主题 Token（强烈推荐）

Token 与主题切换自动兼容，硬编码 hex 会在切换主题后失效：

```yaml
# ✅ 推荐：使用 Token
nodes:
  - id: api
    style:
      fillColor: $primaryLight      # 随主题自动调整
      strokeColor: $primary
      fontColor: $text

# ❌ 避免：硬编码 hex
nodes:
  - id: api
    style:
      fillColor: "#DBEAFE"          # 切换到 dark 主题后不协调
```

### Token 完整列表

```
颜色基础:
  $primary          主色（蓝/绿/深色等，随主题变化）
  $primaryLight     主色浅版（填充色推荐）
  $secondary        辅助色（数据库节点默认）
  $secondaryLight   辅助色浅版
  $accent           强调色（决策节点默认）
  $accentLight      强调色浅版
  $background       画布背景色
  $surface          卡片/模块背景色
  $surfaceAlt       交替背景色

文字与边框:
  $text             主要文字颜色
  $textMuted        次要文字颜色
  $textInverse      反色文字（深色背景上使用）
  $border           标准边框颜色
  $borderStrong     加粗边框颜色

语义颜色:
  $success          成功状态（绿色系）
  $successLight     成功浅色
  $warning          警告状态（黄/橙色系）
  $warningLight     警告浅色
  $error            错误状态（红色系）
  $errorLight       错误浅色
  $info             信息提示（蓝色系）
  $infoLight        信息浅色
```

---

## 连接线配色规范

| 连接类型 | 线型 | 推荐用途 |
|---------|------|---------|
| `primary` | 实线 2px，实心箭头 | 主流程，默认选择 |
| `data` | 虚线 2px（6 4），实心箭头 | 数据传输、异步通信 |
| `optional` | 点线 1px（2 2），空心箭头 | 可选路径、回退逻辑 |
| `dependency` | 实线 1px，菱形箭头 | 依赖关系、组合关系 |
| `bidirectional` | 实线 1.5px，无箭头 | 双向关联、通信通道 |

> 连接线颜色自动继承 `$text`（深色），无需手动设置除非有特殊语义标注需求。

---

## 配色一致性检查清单

生成 YAML spec 前，请逐项确认：

```
□ 主题已明确选择（meta.theme 已设置）
□ 所有自定义 fillColor 使用 Token 或有效 hex（#RGB 或 #RRGGBB）
□ strokeColor 与 fillColor 使用同类型的深/浅 Token 组合
  例：fillColor: $primaryLight + strokeColor: $primary ✅
  例：fillColor: $primaryLight + strokeColor: $error ❌（语义混乱）
□ 决策节点（decision）使用 $accentLight / $accent 以视觉区分主流程
□ 连接线颜色未覆盖，保持默认 $text 颜色
□ 深色主题（dark）下确认 fontColor 使用 $textInverse 保证对比度
□ 模块（modules）背景色使用 $surface 而非 $background（层次区分）
```

---

## 常见配色错误与修正

| 错误模式 | 问题 | 修正方案 |
|---------|------|---------|
| 所有节点用同一颜色 | 无法区分节点类型 | 利用语义类型自动配色，不要手动统一覆盖 |
| decision 节点用蓝色填充 | 与 service 节点混淆 | 改用 `$accentLight`（琥珀/黄色）填充 |
| 深色主题下黑色文字 | 对比度不足 | 添加 `fontColor: $textInverse` |
| 全部使用硬编码 hex | 主题切换后样式崩坏 | 改为 Token 引用 |
| 连接线覆盖为彩色 | 视觉噪音，分散注意力 | 仅在有特殊语义时才覆盖连接线颜色 |
