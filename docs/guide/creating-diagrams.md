# Creating Diagrams

Learn how to create various types of diagrams with natural language.

## Supported Diagram Types

### Flowcharts

Describe the process steps and decision points:

> "Create a flowchart for an e-commerce checkout process:
> - User adds items to cart
> - User proceeds to checkout
> - User enters shipping information
> - User selects payment method
> - Payment is processed
> - Order confirmed or payment failed"

### Architecture Diagrams

Describe system components and their relationships:

> "Draw a three-tier web application architecture:
> - Client layer: Web browsers and mobile apps
> - Application layer: Load balancer, web servers, API servers
> - Data layer: Primary database, read replicas, cache"

### Sequence Diagrams

Describe interactions between components over time:

> "Create a sequence diagram for user authentication:
> - User -> Login page: Enter credentials
> - Login page -> Auth service: Validate credentials
> - Auth service -> Database: Query user
> - Database -> Auth service: Return user data
> - Auth service -> Login page: Return authentication token
> - Login page -> User: Redirect to dashboard"

## Best Practices

### Be Specific

Provide clear, detailed descriptions:

**Good**:
> "Create a flowchart with 5 steps: start, validate input, process data, save result, end"

**Less Effective**:
> "Draw a flowchart"

### Use Structured Lists

Break down complex diagrams into steps or components:

> "Create a microservices architecture with:
> - API Gateway
> - Auth Service
> - User Service
> - Order Service
> - Payment Service
> - Notification Service
> - Each service connects to the API Gateway"

### Specify Visual Properties

You can request specific styling:

> "Create a flowchart where:
> - Start/End nodes use rounded rectangles with green fill
> - Process nodes use rectangles with blue fill
> - Decision nodes use diamonds with yellow fill"

## Tips for Better Results

1. **Start Simple**: Begin with basic diagrams, then add complexity
2. **Iterate**: Refine your diagram through multiple prompts
3. **Use Examples**: Reference existing diagram patterns
4. **Be Explicit**: Clearly state the number of nodes and their relationships

## Next Steps

- Learn how to [Edit Diagrams](./editing-diagrams)
- Explore [XML Format Reference](../api/xml-format)
- Browse [Examples](../examples/)
