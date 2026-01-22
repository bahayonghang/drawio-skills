# Architecture Diagram Examples

Architecture diagrams help visualize system design and component relationships.

## AWS Serverless Architecture

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

**Use Cases:**
- Serverless application design
- API architecture documentation
- Cloud migration planning

## GCP Microservices

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

**Use Cases:**
- Microservices architecture
- Container-based deployments
- GCP infrastructure planning

## Azure Web Application

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

**Use Cases:**
- Web application architecture
- Azure deployment planning
- Enterprise application design

## Tips for Architecture Diagrams

### Use Official Icons

Always mention the cloud provider and request official icons:
- "Use AWS icons"
- "Use GCP icons"
- "Use Azure icons"

### Show Data Flow

Indicate the direction of data flow with arrows and labels:
- "User requests flow through API Gateway to Lambda"
- "Data is stored in DynamoDB and cached in ElastiCache"

### Group Related Components

Organize components into logical groups:
- Frontend tier
- Application tier
- Data tier
- Security layer

### Include Monitoring

Don't forget observability components:
- CloudWatch (AWS)
- Cloud Monitoring (GCP)
- Application Insights (Azure)

## Next Steps

- [Flowchart Examples](./flowchart.md)
- [Creating Diagrams](/guide/creating-diagrams.md)
- [Examples Overview](./index.md)
