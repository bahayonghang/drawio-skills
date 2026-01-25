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
- [学术与科研图表](#学术与科研图表) - IEEE 论文、数学公式

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

## 学术与科研图表

创建符合 IEEE、ACM 等学术期刊标准的专业图表，支持数学公式。

### 神经网络架构图

**Prompt:**
```
创建一个 IEEE 风格的神经网络架构图：
1) 输入层：\(x \in \mathbb{R}^{H \times W \times C}\)
2) 卷积层：\(f = \sigma(W * x + b)\)
3) 全连接层：\(y = \text{softmax}(Wh + b)\)
使用灰度兼容样式。添加标题：Fig. 1. CNN 架构。
```

**Use Cases:**
- 深度学习论文配图
- 模型架构文档
- IEEE/ACM 论文投稿

### 信号处理流水线

**Prompt:**
```
创建一个信号处理流水线图：
1) 输入信号：\(x(t)\)
2) FFT：\(X(f) = \mathcal{F}\{x(t)\}\)
3) 滤波器：\(H(f)\)
4) 输出：\(Y(f) = X(f) \cdot H(f)\)
使用 IEEE 图表风格，采用灰度配色。
```

**Use Cases:**
- 数字信号处理论文配图
- 通信系统文档
- 信号分析工作流

### 控制系统框图

**Prompt:**
```
创建一个控制系统框图：
- 参考输入：\(r(t)\)
- 误差：\(e(t) = r(t) - y(t)\)
- 控制器：\(G_c(s) = K_p + \frac{K_i}{s}\)
- 被控对象：\(G_p(s)\)
- 带传感器 \(H(s)\) 的反馈回路
使用 IEEE 规范样式。
```

**Use Cases:**
- 控制理论论文
- 自动化系统文档
- 学位论文配图

### 机器学习流水线

**Prompt:**
```
创建一个 IEEE 论文用的机器学习流水线图：
1) 数据：\(\mathcal{D} = \{(x_i, y_i)\}_{i=1}^N\)
2) 损失函数：\(\mathcal{L} = -\sum y \log \hat{y}\)
3) 优化：\(\theta \leftarrow \theta - \eta \nabla \mathcal{L}\)
4) 评估：Accuracy, F1, AUC
使用灰度配色，添加标题"Fig. 2. 训练流水线。"
```

**Use Cases:**
- 机器学习论文
- 训练流程文档
- 模型开发指南

[了解更多数学公式排版 →](/zh/guide/math-typesetting.md)

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
- [数学公式排版](/zh/guide/math-typesetting.md) - 学术论文 LaTeX/AsciiMath 公式
- [Creating Diagrams](/zh/guide/creating-diagrams.md) - Learn how to create diagrams
- [API Reference](/zh/api/mcp-tools.md) - Explore available tools
