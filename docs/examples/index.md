# Examples

Browse examples of different diagram types you can create with Draw.io Skill.

## Overview

This section provides ready-to-use examples for various diagram types. Each example includes:

- **Prompt**: The natural language description to use
- **Description**: What the diagram will contain
- **Use Cases**: When to use this type of diagram

## Quick Links

- [Flowcharts](#flowcharts) - Process flows, workflows, decision trees
- [Architecture Diagrams](#architecture-diagrams) - System design, cloud architecture
- [Sequence Diagrams](#sequence-diagrams) - Interaction flows, API calls
- [Network Diagrams](#network-diagrams) - Network topology, VPC architecture
- [UML Diagrams](#uml-diagrams) - Class diagrams, state diagrams
- [Data Flow Diagrams](#data-flow-diagrams) - Data pipelines, ETL processes
- [Academic & Scientific Diagrams](#academic--scientific-diagrams) - IEEE papers, math equations

## Flowcharts

Perfect for visualizing processes, workflows, and decision trees.

### Simple Process Flow

**Prompt:**
```
Create a flowchart showing a user login process with username/password input,
validation, and success/error paths
```

**Use Cases:**
- User authentication flows
- Business process documentation
- Algorithm visualization

[Learn more about flowcharts →](./flowchart.md)

### CI/CD Pipeline

**Prompt:**
```
Create a flowchart showing the CI/CD pipeline: code commit -> build ->
test -> staging deploy -> production deploy with approval gates
```

**Use Cases:**
- DevOps pipeline documentation
- Deployment process visualization
- Workflow automation

## Architecture Diagrams

Visualize system design and component relationships.

### AWS Serverless

**Prompt:**
```
Generate an AWS architecture diagram with Lambda, API Gateway, DynamoDB,
and S3 for a serverless REST API. Use AWS icons.
```

**Use Cases:**
- Cloud architecture documentation
- System design proposals
- Technical presentations

[Learn more about architecture diagrams →](./architecture.md)

### GCP Microservices

**Prompt:**
```
Generate a GCP architecture diagram with Cloud Run, Cloud SQL, and
Cloud Storage for a web application. Use GCP icons.
```

**Use Cases:**
- Microservices architecture
- Cloud migration planning
- Infrastructure documentation

### Azure Web Application

**Prompt:**
```
Generate an Azure architecture diagram with App Service, SQL Database,
and Blob Storage. Use Azure icons.
```

**Use Cases:**
- Web application architecture
- Azure deployment planning
- System integration documentation

## Sequence Diagrams

Show interactions between different actors or components over time.

### OAuth 2.0 Flow

**Prompt:**
```
Create a sequence diagram showing OAuth 2.0 authorization code flow
between user, client app, auth server, and resource server
```

**Use Cases:**
- Authentication flow documentation
- API integration guides
- Security protocol visualization

### Payment Processing

**Prompt:**
```
Create a sequence diagram for an e-commerce payment flow with customer,
frontend, backend, payment gateway, and database
```

**Use Cases:**
- Payment flow documentation
- E-commerce system design
- Transaction process visualization

## Network Diagrams

Visualize network topology and infrastructure.

### Corporate Network

**Prompt:**
```
Create a network diagram showing corporate network with DMZ, internal network,
firewalls, and VPN access
```

**Use Cases:**
- Network infrastructure documentation
- Security architecture planning
- IT infrastructure visualization

### Cloud VPC

**Prompt:**
```
Create an AWS VPC diagram with public and private subnets, NAT gateway,
and internet gateway
```

**Use Cases:**
- Cloud network design
- VPC architecture documentation
- Security zone planning

## UML Diagrams

Model software systems and their relationships.

### Class Diagram

**Prompt:**
```
Create a class diagram for a library management system with Book, Member,
Loan, and Librarian classes
```

**Use Cases:**
- Object-oriented design
- Database schema planning
- Software architecture documentation

### State Diagram

**Prompt:**
```
Create a state diagram for an order lifecycle: pending, confirmed,
shipped, delivered, cancelled
```

**Use Cases:**
- State machine documentation
- Workflow modeling
- Business process states

## Data Flow Diagrams

Visualize data movement and processing.

### Data Pipeline

**Prompt:**
```
Create a data pipeline diagram showing data ingestion, processing,
storage, and analytics
```

**Use Cases:**
- Data architecture documentation
- ETL process visualization
- Analytics pipeline design

### Real-time Analytics

**Prompt:**
```
Create a real-time analytics architecture with Kafka, Spark Streaming,
and visualization dashboard
```

**Use Cases:**
- Streaming architecture
- Real-time data processing
- Analytics system design

## Academic & Scientific Diagrams

Create publication-ready diagrams with mathematical equations for IEEE, ACM, and other academic journals.

### Neural Network Architecture

**Prompt:**
```
Create an IEEE-style neural network architecture diagram:
1) Input layer: \(x \in \mathbb{R}^{H \times W \times C}\)
2) Conv layer: \(f = \sigma(W * x + b)\)
3) FC layer: \(y = \text{softmax}(Wh + b)\)
Use grayscale-compatible styling. Add caption: Fig. 1. CNN architecture.
```

**Use Cases:**
- Deep learning paper figures
- Model architecture documentation
- IEEE/ACM paper submissions

### Signal Processing Pipeline

**Prompt:**
```
Create a signal processing pipeline diagram:
1) Input signal: \(x(t)\)
2) FFT: \(X(f) = \mathcal{F}\{x(t)\}\)
3) Filter: \(H(f)\)
4) Output: \(Y(f) = X(f) \cdot H(f)\)
Use IEEE figure style with grayscale colors.
```

**Use Cases:**
- DSP paper illustrations
- Communication systems documentation
- Signal analysis workflows

### Control System Block Diagram

**Prompt:**
```
Create a control system block diagram:
- Reference: \(r(t)\)
- Error: \(e(t) = r(t) - y(t)\)
- Controller: \(G_c(s) = K_p + \frac{K_i}{s}\)
- Plant: \(G_p(s)\)
- Feedback loop with sensor \(H(s)\)
Use IEEE-compliant styling.
```

**Use Cases:**
- Control theory papers
- Automation system documentation
- Academic thesis figures

### Machine Learning Pipeline

**Prompt:**
```
Create an ML pipeline diagram for IEEE paper:
1) Data: \(\mathcal{D} = \{(x_i, y_i)\}_{i=1}^N\)
2) Loss: \(\mathcal{L} = -\sum y \log \hat{y}\)
3) Optimization: \(\theta \leftarrow \theta - \eta \nabla \mathcal{L}\)
4) Evaluation: Accuracy, F1, AUC
Use grayscale, add "Fig. 2. Training pipeline."
```

**Use Cases:**
- Machine learning papers
- Training workflow documentation
- Model development guides

[Learn more about math typesetting →](/guide/math-typesetting.md)

## Tips for Using Examples

### Customize for Your Needs

Start with an example and modify it:

```
"Create a flowchart like the login example, but for user registration
with email verification"
```

### Combine Patterns

Mix different diagram types:

```
"Create an architecture diagram showing the system components,
and add a sequence diagram showing the authentication flow"
```

### Add Details

Enhance examples with specific details:

```
"Create an AWS architecture like the serverless example,
but add CloudFront CDN and Route 53 DNS"
```

## Next Steps

- [Flowchart Examples](./flowchart.md) - Detailed flowchart examples
- [Architecture Examples](./architecture.md) - Detailed architecture examples
- [Math Typesetting](/guide/math-typesetting.md) - LaTeX/AsciiMath equations for academic papers
- [Creating Diagrams](/guide/creating-diagrams.md) - Learn how to create diagrams
- [API Reference](/api/mcp-tools.md) - Explore available tools
