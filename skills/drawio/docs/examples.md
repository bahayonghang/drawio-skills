# Diagram Examples

This document provides example prompts and their corresponding diagram types.

For structured A–H format diagram extraction (from text or images), see:
- `structured-diagram-prompts.md` - Universal template with domain configurations
- `structured-diagram-quality.md` - Validation rules and regression examples

For math equations in labels (LaTeX/AsciiMath), see:
- `math-typesetting.md`

For consistent visual styling, see:
- `style-presets.md`

For converting structured A–H specs into starter draw.io XML, see:
- `ah-to-xml.md`

## Math Typesetting

### Scientific Diagram with Equations

**Prompt:**
```
Create a diagram for linear regression with three nodes:
1) "Input" with label: \(x \in \mathbb{R}^d\)
2) "Model" with label: \(y = Wx + b\)
3) "Loss" with label: $$\mathcal{L}=\sum_i (y_i-\hat y_i)^2$$
Use readable sizes and ensure the math renders.
```

**Notes:**
- Enable `Extras > Mathematical Typesetting` in draw.io if equations are not rendered.
- If the text looks clipped, set Text Overflow to `Block` or `Width` and resize the shape.

### IEEE Paper: Neural Network Architecture

**Prompt:**
```
Create an IEEE-style block diagram for a convolutional neural network:
1) Input layer: \(x \in \mathbb{R}^{H \times W \times C}\)
2) Conv layers: \(f_i = \sigma(W_i * f_{i-1} + b_i)\)
3) Pooling: \(\text{MaxPool}_{2 \times 2}\)
4) FC layer: \(y = \text{softmax}(W_{fc} \cdot h + b_{fc})\)
Use grayscale-compatible styling. Add caption: "Fig. 1. Architecture of the proposed CNN model."
```

**Notes:**
- Use solid black borders with white fill for B&W compatibility
- Export as PDF for vector quality in LaTeX documents

### IEEE Paper: Signal Processing Pipeline

**Prompt:**
```
Create a signal processing block diagram for IEEE publication:
1) "ADC" with label: \(x[n]\)
2) "FFT" with label: \(X[k] = \sum_{n=0}^{N-1} x[n] e^{-j2\pi kn/N}\)
3) "Filter" with label: \(H(z) = \frac{b_0 + b_1 z^{-1}}{1 + a_1 z^{-1}}\)
4) "IFFT" with label: \(y[n]\)
Use orthogonal connectors with arrows. Black and white style.
```

### IEEE Paper: Control System Block Diagram

**Prompt:**
```
Create a feedback control system diagram for IEEE paper:
- Reference input: \(r(t)\)
- Error signal: \(e(t) = r(t) - y(t)\)
- PID Controller: \(u(t) = K_p e + K_i \int e \, dt + K_d \frac{de}{dt}\)
- Plant: \(G(s) = \frac{K}{s(Ts+1)}\)
- Output: \(y(t)\)
Include feedback loop with negative sign at summing junction.
Add caption: "Fig. 2. Closed-loop control system with PID controller."
```

### IEEE Paper: Communication System

**Prompt:**
```
Create an IEEE-style communication system block diagram:
1) Source: \(m(t)\)
2) Modulator: \(s(t) = A_c \cos(2\pi f_c t + \phi(t))\)
3) Channel: \(r(t) = s(t) + n(t)\), where \(n(t) \sim \mathcal{N}(0, \sigma^2)\)
4) Demodulator with matched filter
5) Detector: \(\hat{m}\)
Show noise entering at channel. Use dashed lines for optional paths.
```

### IEEE Paper: Machine Learning Pipeline

**Prompt:**
```
Create an IEEE academic diagram for ML training pipeline:
1) Dataset: \(\mathcal{D} = \{(x_i, y_i)\}_{i=1}^N\)
2) Model: \(f_\theta(x)\)
3) Loss: \(\mathcal{L} = \frac{1}{N}\sum_{i=1}^{N} \ell(f_\theta(x_i), y_i)\)
4) Optimizer: \(\theta \leftarrow \theta - \eta \nabla_\theta \mathcal{L}\)
Show iteration loop from optimizer back to model.
Grayscale compatible. Caption: "Fig. 3. Training procedure of the proposed method."
```

## Flowcharts

### Simple Process Flow

**Prompt:**
```
Create a flowchart showing a user login process with username/password input,
validation, and success/error paths
```

**Description:**
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

**Description:**
- Sequential process flow
- Decision nodes for test results and approval
- Parallel paths for different environments
- Error handling and rollback paths

## Architecture Diagrams

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

**Flow:**
1. Customer initiates checkout
2. Frontend sends order to backend
3. Backend validates order
4. Backend calls payment gateway
5. Payment gateway processes payment
6. Backend updates database
7. Frontend shows confirmation

## System Design Diagrams

### Microservices E-commerce

**Prompt:**
```
Design a microservices e-commerce system with user service, product catalog,
shopping cart, order processing, and payment gateway
```

**Services:**
- User Service (authentication, profiles)
- Product Catalog (inventory, search)
- Shopping Cart (session management)
- Order Service (order processing)
- Payment Service (payment processing)
- Notification Service (emails, SMS)

**Infrastructure:**
- API Gateway
- Service mesh
- Message queue (async communication)
- Databases (per service)
- Cache layer

### Event-Driven Architecture

**Prompt:**
```
Create an event-driven architecture diagram with event producers,
event bus, event consumers, and data stores
```

**Components:**
- Event Producers (services generating events)
- Event Bus (message broker)
- Event Consumers (services processing events)
- Event Store (event sourcing)
- Read Models (CQRS)

## Network Diagrams

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

## Data Flow Diagrams

### Data Pipeline

**Prompt:**
```
Create a data pipeline diagram showing data ingestion, processing,
storage, and analytics
```

**Stages:**
1. Data Sources (APIs, databases, files)
2. Ingestion Layer (streaming, batch)
3. Processing Layer (ETL, transformation)
4. Storage Layer (data lake, data warehouse)
5. Analytics Layer (BI tools, ML models)

### Real-time Analytics

**Prompt:**
```
Create a real-time analytics architecture with Kafka, Spark Streaming,
and visualization dashboard
```

**Components:**
- Data Sources (IoT devices, applications)
- Kafka (message streaming)
- Spark Streaming (real-time processing)
- Time-series Database
- Visualization Dashboard

## UML Diagrams

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

**Transitions:**
- Pending → Confirmed (payment)
- Confirmed → Shipped (dispatch)
- Shipped → Delivered (arrival)
- Any → Cancelled (cancellation)

## Specialized Diagrams

### Transformer Architecture

**Prompt:**
```
Give me an animated connector diagram of transformer's architecture
with encoder and decoder stacks
```

**Components:**
- Input Embedding
- Positional Encoding
- Encoder Stack (multi-head attention, feed-forward)
- Decoder Stack (masked attention, cross-attention, feed-forward)
- Output Layer

**Features:**
- Animated connectors showing data flow
- Layer normalization
- Residual connections

### Database Schema

**Prompt:**
```
Create a database schema diagram for a blog platform with users, posts,
comments, and tags
```

**Tables:**
- Users (id, username, email, password)
- Posts (id, title, content, authorId, createdAt)
- Comments (id, content, postId, authorId, createdAt)
- Tags (id, name)
- PostTags (postId, tagId) - junction table

**Relationships:**
- Users → Posts (one-to-many)
- Users → Comments (one-to-many)
- Posts → Comments (one-to-many)
- Posts ↔ Tags (many-to-many via PostTags)

## Tips for Creating Diagrams

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

### CQRS Pattern

```
Commands → Write Model → Event Store
                            ↓
                        Event Bus
                            ↓
Queries ← Read Model ← Event Handlers
```
