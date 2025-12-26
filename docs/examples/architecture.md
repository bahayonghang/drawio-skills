# Architecture Diagram Examples

Example prompts for creating architecture diagrams.

## Three-Tier Architecture

> "Draw a three-tier web application architecture:
> - Client Tier: Web browsers and mobile apps
> - Application Tier: Load balancer, web servers, API servers
> - Data Tier: Primary database, read replicas, cache"

## Microservices Architecture

> "Create a microservices architecture with:
> - API Gateway at the top
> - Auth Service, User Service, Order Service, Payment Service
> - Each service has its own database
> - All services connect through the API Gateway"

## CI/CD Pipeline

> "Draw a CI/CD pipeline architecture:
> - Developer commits code
> - Git repository
> - Build server compiles code
> - Automated tests run
> - If tests pass: Deploy to staging
> - Manual approval
> - Deploy to production"

## Cloud Infrastructure

> "Create a cloud infrastructure diagram:
> - Internet → Load Balancer
> - Web Server (Auto-scaling group)
> - Application Server (Auto-scaling group)
> - Database (Primary + Standby)
> - CDN for static content"

## Event-Driven Architecture

> "Draw an event-driven architecture:
> - Event producers: Web API, Scheduled Jobs
> - Message Broker (Kafka/RabbitMQ)
> - Event consumers: Email Service, Analytics Service, Notification Service
> - Data Warehouse"

## Kubernetes Deployment

> "Create a Kubernetes deployment architecture:
> - Ingress Controller
> - Services: Frontend, Backend, Database
> - Pods: Multiple instances of each service
> - Persistent Volumes for data
> - ConfigMaps and Secrets"

## Tips for Architecture Diagrams

- **Use hierarchical structure**: Describe layers or tiers clearly
- **Show data flow**: Indicate how data moves between components
- **Label connections**: Describe what protocols or APIs are used
- **Group related components**: Use containers or boundaries

## Try It Yourself

Copy any of these prompts into Claude Code and see the results!

## Related Examples

- [Flowcharts](./flowchart)
- [Creating Diagrams Guide](../guide/creating-diagrams)
