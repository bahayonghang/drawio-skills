# YAML 示例

展示设计系统 2.0 功能的实际 YAML 规格示例。这些示例位于 `skills/drawio/references/examples/` 目录中，可使用 CLI 工具转换。

## 微服务架构

**主题：** tech-blue | **布局：** horizontal | **特性：** 3 个模块，类型化连接器

```yaml
meta:
  theme: tech-blue
  layout: horizontal
  title: E-Commerce Microservices

modules:
  - id: gateway
    label: API Layer
  - id: services
    label: Business Services
  - id: data
    label: Data Layer

nodes:
  - id: api
    label: API Gateway
    type: service
    module: gateway
  - id: auth
    label: Auth Service
    type: service
    module: services
  - id: order
    label: Order Service
    type: service
    module: services
  - id: product
    label: Product Service
    type: service
    module: services
  - id: postgres
    label: PostgreSQL
    type: database
    module: data
  - id: redis
    label: Redis Cache
    type: database
    module: data

edges:
  - from: api
    to: auth
    type: primary
    label: Auth
  - from: api
    to: order
    type: primary
    label: Orders
  - from: api
    to: product
    type: primary
    label: Products
  - from: auth
    to: postgres
    type: data
  - from: order
    to: postgres
    type: data
  - from: product
    to: redis
    type: data
    label: Cache
```

### 使用 CLI 转换

```bash
node cli.js examples/microservices.yaml microservices.drawio
node cli.js examples/microservices.yaml microservices.svg
```

## 登录流程

**主题：** nature | **布局：** vertical | **特性：** 决策节点，终端节点

```yaml
meta:
  theme: nature
  layout: vertical
  title: User Login Flow

nodes:
  - id: start
    label: Start
    type: terminal
  - id: input
    label: Enter Credentials
    type: service
  - id: validate
    label: Valid?
    type: decision
  - id: check_2fa
    label: 2FA Enabled?
    type: decision
  - id: verify_2fa
    label: Verify 2FA Code
    type: service
  - id: success
    label: Login Success
    type: terminal
  - id: failure
    label: Login Failed
    type: terminal

edges:
  - from: start
    to: input
    type: primary
  - from: input
    to: validate
    type: primary
  - from: validate
    to: check_2fa
    type: primary
    label: "Yes"
  - from: validate
    to: failure
    type: optional
    label: "No"
  - from: check_2fa
    to: verify_2fa
    type: primary
    label: "Yes"
  - from: check_2fa
    to: success
    type: primary
    label: "No"
  - from: verify_2fa
    to: success
    type: primary
    label: Valid
  - from: verify_2fa
    to: failure
    type: optional
    label: Invalid
```

## 神经网络（学术版）

**主题：** academic | **布局：** horizontal | **特性：** 数学标签，模块，学术样式

```yaml
meta:
  theme: academic
  layout: horizontal
  title: Encoder-Decoder Architecture

modules:
  - id: encoder
    label: Encoder
  - id: decoder
    label: Decoder

nodes:
  - id: input
    label: "$$\\mathbf{x} \\in \\mathbb{R}^n$$"
    type: formula
    module: encoder
  - id: enc_layer
    label: "$$f_{\\theta}(\\mathbf{x})$$"
    type: service
    module: encoder
  - id: latent
    label: "$$\\mathbf{z} = \\mu + \\sigma \\odot \\epsilon$$"
    type: formula
  - id: dec_layer
    label: "$$g_{\\phi}(\\mathbf{z})$$"
    type: service
    module: decoder
  - id: output
    label: "$$\\hat{\\mathbf{x}} \\in \\mathbb{R}^n$$"
    type: formula
    module: decoder

edges:
  - from: input
    to: enc_layer
    type: primary
  - from: enc_layer
    to: latent
    type: data
    label: "$$\\mu, \\sigma$$"
  - from: latent
    to: dec_layer
    type: primary
  - from: dec_layer
    to: output
    type: primary
```

## 使用示例

### 快速开始

1. 进入示例目录：`cd skills/drawio/references/examples/`
2. 运行 CLI 工具：`node ../src/cli.js microservices.yaml output.drawio`
3. 在 draw.io 中打开 `output.drawio`

### 自定义示例

- 修改 `meta.theme` 尝试不同的视觉风格
- 增减节点以适应您的架构
- 修改边类型以反映您的数据流模式

## 相关文档

- [CLI 工具](../guide/cli.md) - 命令行转换
- [规格格式](../guide/specification.md) - YAML 规格参考
- [设计系统](../guide/design-system.md) - 主题和形状
