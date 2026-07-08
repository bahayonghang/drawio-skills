# Icon Libraries

The Design System provides integration with cloud provider icons and technical symbols for professional architecture diagrams.

---

## Cloud Provider Icons

### AWS (Amazon Web Services)

Icons use the `mxgraph.aws4.*` shape prefix.

#### Compute

| Service | Icon Reference | Shape |
|---------|---------------|-------|
| Lambda | `aws.lambda` | `mxgraph.aws4.lambda` |
| EC2 | `aws.ec2` | `mxgraph.aws4.ec2` |
| ECS | `aws.ecs` | `mxgraph.aws4.ecs` |
| EKS | `aws.eks` | `mxgraph.aws4.eks` |
| Fargate | `aws.fargate` | `mxgraph.aws4.fargate` |

#### Storage & Database

| Service | Icon Reference | Shape |
|---------|---------------|-------|
| S3 | `aws.s3` | `mxgraph.aws4.s3` |
| DynamoDB | `aws.dynamodb` | `mxgraph.aws4.dynamodb` |
| RDS | `aws.rds` | `mxgraph.aws4.rds` |
| ElastiCache | `aws.elasticache` | `mxgraph.aws4.elasticache` |

#### Networking

| Service | Icon Reference | Shape |
|---------|---------------|-------|
| API Gateway | `aws.api-gateway` | `mxgraph.aws4.api_gateway` |
| CloudFront | `aws.cloudfront` | `mxgraph.aws4.cloudfront` |
| Route 53 | `aws.route53` | `mxgraph.aws4.route_53` |
| VPC | `aws.vpc` | `mxgraph.aws4.vpc` |
| ALB | `aws.alb` | `mxgraph.aws4.application_load_balancer` |

#### Integration

| Service | Icon Reference | Shape |
|---------|---------------|-------|
| SQS | `aws.sqs` | `mxgraph.aws4.sqs` |
| SNS | `aws.sns` | `mxgraph.aws4.sns` |
| EventBridge | `aws.eventbridge` | `mxgraph.aws4.eventbridge` |
| Step Functions | `aws.step-functions` | `mxgraph.aws4.step_functions` |

---

### GCP (Google Cloud Platform)

Icons use the `mxgraph.gcp2.*` shape prefix.

#### Compute

| Service | Icon Reference | Shape |
|---------|---------------|-------|
| Cloud Run | `gcp.cloud-run` | `mxgraph.gcp2.cloud_run` |
| Cloud Functions | `gcp.functions` | `mxgraph.gcp2.cloud_functions` |
| Compute Engine | `gcp.compute` | `mxgraph.gcp2.compute_engine` |
| GKE | `gcp.gke` | `mxgraph.gcp2.kubernetes_engine` |

#### Storage & Database

| Service | Icon Reference | Shape |
|---------|---------------|-------|
| Cloud Storage | `gcp.storage` | `mxgraph.gcp2.cloud_storage` |
| Cloud SQL | `gcp.sql` | `mxgraph.gcp2.cloud_sql` |
| Firestore | `gcp.firestore` | `mxgraph.gcp2.firestore` |
| BigQuery | `gcp.bigquery` | `mxgraph.gcp2.bigquery` |

#### Networking

| Service | Icon Reference | Shape |
|---------|---------------|-------|
| Cloud Load Balancing | `gcp.lb` | `mxgraph.gcp2.cloud_load_balancing` |
| Cloud CDN | `gcp.cdn` | `mxgraph.gcp2.cloud_cdn` |
| Cloud DNS | `gcp.dns` | `mxgraph.gcp2.cloud_dns` |

---

### Azure (Microsoft Azure)

Icons use the `mxgraph.azure.*` shape prefix.

#### Compute

| Service | Icon Reference | Shape |
|---------|---------------|-------|
| Functions | `azure.functions` | `mxgraph.azure.functions` |
| App Service | `azure.app-service` | `mxgraph.azure.app_services` |
| AKS | `azure.aks` | `mxgraph.azure.kubernetes_services` |
| VM | `azure.vm` | `mxgraph.azure.virtual_machine` |

#### Storage & Database

| Service | Icon Reference | Shape |
|---------|---------------|-------|
| Blob Storage | `azure.blob` | `mxgraph.azure.blob_storage` |
| SQL Database | `azure.sql` | `mxgraph.azure.sql_database` |
| Cosmos DB | `azure.cosmos` | `mxgraph.azure.cosmos_db` |

---

## DevOps Icons

### Container & Orchestration

| Tool | Icon Reference | Shape |
|------|---------------|-------|
| Docker | `devops.docker` | `mxgraph.docker.docker` |
| Kubernetes | `devops.kubernetes` | `mxgraph.kubernetes.kubernetes` |
| Helm | `devops.helm` | Custom SVG |

### CI/CD

| Tool | Icon Reference | Shape |
|------|---------------|-------|
| GitHub Actions | `devops.github-actions` | Custom SVG |
| Jenkins | `devops.jenkins` | Custom SVG |
| GitLab CI | `devops.gitlab` | Custom SVG |
| ArgoCD | `devops.argocd` | Custom SVG |

---

## Brand and Lucide Image Icons

Use `brand.*` for non-cloud product identity icons that draw.io does not ship as
native stencils. These render as embedded SVG image cells, so the exported
`.drawio` remains self-contained and does not require network access at render
time.

| Brand | Icon Reference | Rendering |
|-------|---------------|-----------|
| OpenAI | `brand.openai` | Embedded SVG image |
| Redis | `brand.redis` | Embedded SVG image |

Use `lucide.*` for generic semantic fallback icons inspired by the Lucide icon
vocabulary. Lucide icons are intentionally not brand logos; they are best for
roles such as AI service, cache, document, server, workflow, and security.

| Need | Icon Reference |
|------|----------------|
| AI / LLM service | `lucide.brain-circuit`, `lucide.bot` |
| Cache / fast database | `lucide.database-zap` |
| Database | `lucide.database` |
| Document processing | `lucide.file-text` |
| Cloud service | `lucide.cloud` |
| Server / compute | `lucide.server`, `lucide.cpu` |
| Workflow / pipeline | `lucide.workflow` |
| Security boundary | `lucide.shield` |
| Network | `lucide.network` |

```yaml
nodes:
  - id: openai
    label: OpenAI document understanding
    icon: brand.openai

  - id: cache
    label: Semantic cache
    icon: lucide.database-zap
```

Resolution order for icon-heavy diagrams:

1. Prefer draw.io provider stencils for cloud/vendor infrastructure
   (`aws.*`, `gcp.*`, `azure.*`, `cisco.*`).
2. Use `brand.*` when product identity matters and no draw.io stencil exists.
3. Use `lucide.*` for generic semantic icons, not official logos.

---

## ML/AI Icons

### Neural Network Symbols

| Symbol | Icon Reference | Description |
|--------|---------------|-------------|
| Input Layer | `ml.input` | Circle with arrows in |
| Hidden Layer | `ml.hidden` | Stacked circles |
| Output Layer | `ml.output` | Circle with arrows out |
| Convolution | `ml.conv` | Grid pattern |
| Pooling | `ml.pool` | Shrinking grid |

### Data Pipeline

| Symbol | Icon Reference | Description |
|--------|---------------|-------------|
| Data Source | `ml.data-source` | Database with arrow |
| Transform | `ml.transform` | Gears |
| Model | `ml.model` | Brain/network icon |
| Prediction | `ml.predict` | Target/bullseye |

---

## Usage

### In Specification

```yaml
nodes:
  - id: lambda
    label: Order Handler
    icon: aws.lambda
    
  - id: db
    label: Orders DB
    icon: aws.dynamodb
```

### Icon Normalization

The system normalizes common variations:

| User Input | Resolved To |
|------------|-------------|
| `api-gateway` | `mxgraph.aws4.api_gateway` |
| `lambda` | `mxgraph.aws4.lambda` |
| `s3` | `mxgraph.aws4.s3` |
| `cloud-run` | `mxgraph.gcp2.cloud_run` |

### Icon with Custom Size

```yaml
nodes:
  - id: logo
    label: AWS Lambda
    icon: aws.lambda
    size: large  # 160×80 px with icon
```

---

## mxCell Style for Icons

```xml
<mxCell style="shape=mxgraph.aws4.lambda;
  verticalLabelPosition=bottom;align=center;
  outlineConnect=0;dashed=0;verticalAlign=top;
  fillColor=#F58536;strokeColor=#ffffff;
  html=1;" />
```

Key properties:

- `shape`: Icon shape reference
- `verticalLabelPosition`: Label below icon (`bottom`)
- `fillColor`: Icon fill (AWS orange for Lambda)

---

## Best Practices

### Consistency

- Use same cloud provider icons throughout diagram
- Don't mix AWS and GCP icons unless showing multi-cloud

### Labeling

- Place labels below icons
- Keep labels short (service name only)
- Use tooltips for additional details

### Size

- Standard icon size: 60×60 px
- With label: 80×90 px total
- Keep icons same size for visual balance

### Grouping

- Group related services in modules
- Use consistent spacing (32px between icons)
- Align icons to 8px grid

---

## Adding Custom Icons

For icons not in built-in libraries:

1. **Use SVG**: Import SVG as custom shape
2. **Use Image**: Embed as base64 image
3. **Use stencil**: Reference draw.io stencil library

```yaml
nodes:
  - id: custom
    label: Custom Service
    style:
      image: "data:image/svg+xml,..."
      shape: image
```
