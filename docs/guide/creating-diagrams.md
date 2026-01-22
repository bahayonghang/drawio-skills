# Creating Diagrams

Learn how to create various types of diagrams using natural language with Draw.io Skill.

## Basic Workflow

Creating a diagram follows this simple workflow:

1. **Start a Session**: Claude calls `start_session` to open a browser window
2. **Describe Your Diagram**: Tell Claude what you want in natural language
3. **View in Real-time**: The diagram appears instantly in your browser
4. **Iterate**: Make changes by describing what you want to modify

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

## Next Steps

- [Editing Diagrams](./editing-diagrams.md) - Learn how to modify existing diagrams
- [Export & Save](./export.md) - Learn how to save your diagrams
- [Examples](/examples/) - Browse more examples
- [XML Format](/api/xml-format.md) - Understand the underlying format
