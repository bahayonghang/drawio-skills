# YAML Examples

Real-world YAML specification examples that demonstrate the Design System 2.0 features. These examples are available in the `skills/drawio/references/examples/` directory and can be converted using the CLI tool.

## Microservices Architecture

**Theme:** tech-blue | **Layout:** horizontal | **Features:** 3 modules, typed connectors

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

### Convert with CLI

```bash
node cli.js examples/microservices.yaml microservices.drawio
node cli.js examples/microservices.yaml microservices.svg
```

## Login Flow

**Theme:** nature | **Layout:** vertical | **Features:** Decision nodes, terminal nodes

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

## Neural Network (Academic)

**Theme:** academic | **Layout:** horizontal | **Features:** Math labels, modules, academic styling

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

## Using Examples

### Quick Start

1. Navigate to the examples directory: `cd skills/drawio/references/examples/`
2. Run the CLI tool: `node ../src/cli.js microservices.yaml output.drawio`
3. Open `output.drawio` in draw.io

### Customizing Examples

- Change `meta.theme` to try different visual styles
- Add or remove nodes to fit your architecture
- Modify edge types to reflect your data flow patterns

## Related

- [CLI Tool](../guide/cli.md) - Command-line conversion
- [Specification Format](../guide/specification.md) - YAML spec reference
- [Design System](../guide/design-system.md) - Themes and shapes
