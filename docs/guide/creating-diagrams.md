# Creating Diagrams (`/drawio create`)

Learn how to create various types of diagrams using natural language with the Design System 2.0.

## Quick Start

```
/drawio create
A login flowchart with validation and error handling
```

With theme selection:

```
/drawio create with tech-blue theme
A microservices architecture with API Gateway, User Service, and PostgreSQL
```

## Basic Workflow

Creating a diagram follows this workflow:

1. **Trigger**: Use `/drawio create` command or keywords like "create", "generate", "make"
2. **Start Session**: Claude calls `start_session` to open browser
3. **Generate Specification**: Claude creates YAML spec with Design System styling
4. **Convert to XML**: Specification converted via `spec-to-drawio.js`
5. **Real-time Preview**: Diagram appears in browser instantly
6. **Iterate**: Use `/drawio edit` for modifications

## Design System Support

### Theme Selection

| Theme | Use Case | Command |
|-------|----------|---------|
| `tech-blue` (default) | Software architecture, DevOps | No flag needed |
| `academic-color` ⭐ | Academic papers, research (color) | "with academic-color theme" |
| `academic` | IEEE grayscale print only | "with academic theme" |
| `nature` | Environmental, lifecycle | "with nature theme" |
| `dark` | Presentations, slides | "with dark theme" |

> ⭐ **Recommended for academic**: Use `academic-color` for digital documents. Use `academic` only for strict grayscale.

### Semantic Node Types

Shapes are auto-detected from labels or explicitly specified:

| Type | Shape | Auto-detection Keywords |
|------|-------|-------------------------|
| `service` | Rounded rect | API, service, gateway, backend |
| `database` | Cylinder | DB, SQL, storage, redis, mongo |
| `decision` | Diamond | if, check, condition, or labels with `?` |
| `terminal` | Stadium | start, end, begin, finish |
| `queue` | Parallelogram | queue, buffer, kafka, stream |
| `user` | Circle | user, actor, client, customer |
| `document` | Wave rect | doc, file, report, document |
| `formula` | White rect | equation, formula, `$$` |

### Connector Types

| Type | Style | Use Case |
|------|-------|----------|
| `primary` | Solid 2px, filled arrow | Main flow (default) |
| `data` | Dashed 2px, filled arrow | Data/async flow |
| `optional` | Dotted 1px, open arrow | Weak relations |
| `dependency` | Solid 1px, diamond arrow | Dependencies |
| `bidirectional` | Solid 1.5px, no arrow | Associations |

### 8px Grid System

All positions snap to 8px increments:
- Node spacing: 32px (4 units)
- Module padding: 24px (3 units)
- Canvas padding: 32px (4 units)

## Flowcharts

Flowcharts are perfect for visualizing processes, workflows, and decision trees.

### Simple Process Flow

**Prompt:**
```
Create a flowchart showing a user login process with username/password input,
validation, and success/error paths
```

**What you get:**
- Start node
- Input fields (username, password)
- Validation decision
- Success path → Dashboard
- Error path → Error message → Back to login

### CI/CD Pipeline

**Prompt:**
```
Create a flowchart showing the CI/CD pipeline: code commit -> build ->
test -> staging deploy -> production deploy with approval gates
```

**What you get:**
- Sequential process flow
- Decision nodes for test results and approval
- Parallel paths for different environments
- Error handling and rollback paths

## Architecture Diagrams

Architecture diagrams help visualize system design and component relationships.

### AWS Serverless Architecture

**Prompt:**
```
Generate an AWS architecture diagram with Lambda, API Gateway, DynamoDB,
and S3 for a serverless REST API. Use AWS icons.
```

**Components:**
- API Gateway (entry point)
- Lambda functions (business logic)
- DynamoDB (database)
- S3 (file storage)
- CloudWatch (monitoring)

::: tip
Always mention "Use AWS icons" to get official AWS service icons in your diagram.
:::

### GCP Microservices

**Prompt:**
```
Generate a GCP architecture diagram with Cloud Run, Cloud SQL, and
Cloud Storage for a web application. Use GCP icons.
```

**Components:**
- Cloud Run (containerized services)
- Cloud SQL (managed database)
- Cloud Storage (object storage)
- Cloud Load Balancing
- Cloud Monitoring

### Azure Web Application

**Prompt:**
```
Generate an Azure architecture diagram with App Service, SQL Database,
and Blob Storage. Use Azure icons.
```

**Components:**
- App Service (web hosting)
- SQL Database (relational data)
- Blob Storage (files and media)
- Application Insights (monitoring)
- Azure CDN (content delivery)

## Sequence Diagrams

Sequence diagrams show interactions between different actors or components over time.

### OAuth 2.0 Flow

**Prompt:**
```
Create a sequence diagram showing OAuth 2.0 authorization code flow
between user, client app, auth server, and resource server
```

**Participants:**
- User (browser)
- Client Application
- Authorization Server
- Resource Server

**Flow:**
1. User requests protected resource
2. Client redirects to auth server
3. User authenticates
4. Auth server returns authorization code
5. Client exchanges code for access token
6. Client accesses resource with token

### Payment Processing

**Prompt:**
```
Create a sequence diagram for an e-commerce payment flow with customer,
frontend, backend, payment gateway, and database
```

**Participants:**
- Customer
- Frontend (web/mobile)
- Backend API
- Payment Gateway
- Database

## Network Diagrams

Network diagrams visualize network topology and infrastructure.

### Corporate Network

**Prompt:**
```
Create a network diagram showing corporate network with DMZ, internal network,
firewalls, and VPN access
```

**Zones:**
- Internet
- DMZ (web servers, mail servers)
- Internal Network (workstations, file servers)
- Database Zone (database servers)

**Security:**
- Firewalls between zones
- VPN gateway for remote access
- IDS/IPS systems

### Cloud VPC Architecture

**Prompt:**
```
Create an AWS VPC diagram with public and private subnets, NAT gateway,
and internet gateway
```

**Components:**
- VPC (virtual private cloud)
- Public Subnets (web tier)
- Private Subnets (app tier, database tier)
- Internet Gateway
- NAT Gateway
- Route Tables
- Security Groups

## UML Diagrams

UML diagrams help model software systems and their relationships.

### Class Diagram

**Prompt:**
```
Create a class diagram for a library management system with Book, Member,
Loan, and Librarian classes
```

**Classes:**
- Book (title, author, ISBN)
- Member (name, memberID, email)
- Loan (loanDate, returnDate, status)
- Librarian (employeeID, name)

**Relationships:**
- Member borrows Book (many-to-many via Loan)
- Librarian manages Loan (one-to-many)

### State Diagram

**Prompt:**
```
Create a state diagram for an order lifecycle: pending, confirmed,
shipped, delivered, cancelled
```

**States:**
- Pending (initial state)
- Confirmed (payment received)
- Shipped (in transit)
- Delivered (final state)
- Cancelled (terminal state)

## Animated Connectors

Add visual interest with animated connectors that show data flow.

**Prompt:**
```
Give me an animated connector diagram of transformer's architecture
with encoder and decoder stacks
```

**Features:**
- Animated connectors showing data flow
- Layer normalization
- Residual connections

::: tip
Mention "animated connectors" or "animated" in your prompt to enable flow animations.
:::

## Tips for Better Diagrams

### Be Specific

Instead of:
```
Create an architecture diagram
```

Use:
```
Create an AWS architecture diagram with Lambda, API Gateway, and DynamoDB
for a serverless REST API. Use AWS icons.
```

### Mention Visual Elements

- Specify if you want official cloud icons (AWS, GCP, Azure)
- Request animated connectors for data flow
- Specify colors or themes if desired

### Describe Relationships

- Explain how components connect
- Describe data flow direction
- Mention security boundaries or zones

### Iterate

Start with a basic diagram and refine:
```
1. "Create a basic microservices architecture"
2. "Add a message queue between services"
3. "Add a cache layer in front of the database"
4. "Add monitoring and logging components"
```

## Common Patterns

### Three-Tier Architecture

```
Presentation Tier (Web/Mobile)
    ↓
Application Tier (Business Logic)
    ↓
Data Tier (Database)
```

### Microservices Pattern

```
API Gateway
    ↓
Service Mesh
    ↓
Individual Services (each with own database)
    ↓
Message Queue (async communication)
```

### Event-Driven Pattern

```
Event Producers
    ↓
Event Bus
    ↓
Event Consumers
    ↓
Event Store
```

## YAML Specification Format

For complex diagrams, use explicit YAML specification with `--structured`:

```yaml
meta:
  theme: tech-blue
  layout: horizontal

modules:
  - id: frontend
    label: Frontend Layer
  - id: backend
    label: Backend Services

nodes:
  - id: web
    label: Web App
    type: service
    module: frontend
  - id: api
    label: API Gateway
    type: service
    module: backend
  - id: db
    label: PostgreSQL
    type: database
    module: backend

edges:
  - from: web
    to: api
    type: primary
  - from: api
    to: db
    type: data
    label: Query
```

Request structured format:
```
/drawio create with structured format
Create a microservices architecture...
```

## Complexity Guardrails

| Metric | Warning | Error |
|--------|---------|-------|
| Nodes | >20 | >30 |
| Edges | >30 | >50 |
| Modules | >5 | - |
| Label length | >14 chars | - |

When thresholds are exceeded, Claude will suggest splitting into sub-diagrams.

## Best Practices

1. **Content in Components** - Prefer embedding text and formulas in nodes (shapes) rather than standalone text boxes
2. **Specify theme** - Use "with [theme] theme" for consistent styling across diagrams
3. **Use semantic types** - Let the design system choose shapes automatically
4. **Keep it simple** - Aim for ≤20 nodes per diagram
5. **Use modules** - Group related components for better organization

## Next Steps

- [Replicate Diagrams](./scientific-workflows.md) - `/drawio replicate` workflow
- [Editing Diagrams](./editing-diagrams.md) - `/drawio edit` workflow
- [Design System](./design-system.md) - Themes, shapes, connectors reference
- [Specification Format](./specification.md) - YAML spec reference
- [Export & Save](./export.md) - Save your diagrams
- [Examples](/examples/) - Browse more examples
