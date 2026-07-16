# Reusable YAML Examples

Indexed catalog of the base skill's example specs. Each renders standalone:

```bash
node <base-skill-dir>/scripts/cli.js <example>.yaml out.drawio --validate
```

| File                                | Diagram type           | Theme / layout           | Shows                                                                    | When to load                                                  |
| ----------------------------------- | ---------------------- | ------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `agentic-rag.yaml`                  | AI agent architecture  | arch-dark / horizontal   | Agent + RAG loop: user → agent → vector store → LLM with tool calls      | Agent/RAG requests needing `agent`/`vector_store`/`llm` types |
| `arch-dark-aws-serverless.yaml`     | Cloud architecture     | arch-dark / manual       | AWS serverless map: cloud entry, services, queue, database in one module | Dark-style AWS/serverless service maps                        |
| `arch-dark-microservices.yaml`      | Architecture           | arch-dark / manual       | Two-module microservices with queues, databases, role-based coloring     | Dark microservice maps with module grouping                   |
| `arch-dark-web-app.yaml`            | Architecture           | arch-dark / manual       | Minimal client → service → database web app                              | Smallest arch-dark starter                                    |
| `auto-layout-workflow.yaml`         | Workflow               | tech-blue / hierarchical | Branching review pipeline laid out automatically (no manual bounds)      | Hierarchical auto-layout reference                            |
| `aws-vpc-topology.yaml`             | Network topology       | tech-blue / star         | Internet ingress → load balancer → app servers → private subnet          | VPC/star topologies with subnet containers                    |
| `campus-lan-topology.yaml`          | Network topology       | tech-blue / hierarchical | Core/distribution/access/wireless segments with structured link metadata | Campus LAN maps with labeled links                            |
| `cloud-reference-architecture.yaml` | Architecture           | tech-blue / hierarchical | Four-node gateway → compute → queue → storage skeleton                   | Tiny cloud-reference starter                                  |
| `e-commerce.yaml`                   | Architecture           | tech-blue / horizontal   | Four-module business platform: services, queues, per-service databases   | Multi-module business platform maps                           |
| `login-flow.yaml`                   | Flowchart              | nature / vertical        | Login decision flow with success/error paths                             | Simple vertical decision flowcharts                           |
| `mem0-memory-layer.yaml`            | AI agent architecture  | arch-dark / horizontal   | Memory layer: agent, vector store, database, and `memory` node type      | Memory-layer / stateful-agent diagrams                        |
| `microservices.yaml`                | Architecture           | tech-blue / horizontal   | Minimal three-module services + database map                             | Smallest module-grouping starter                              |
| `multi-agent-orchestration.yaml`    | AI agent architecture  | arch-dark / horizontal   | Orchestrator + worker agents with shared text annotations                | Multi-agent orchestration patterns                            |
| `neural-network.yaml`               | Academic-style diagram | academic / horizontal    | Encoder-decoder CNN drawn with standard node types only                  | `academic` theme demo in the base (non-publication)           |
| `onprem-dmz-topology.yaml`          | Network topology       | tech-blue / mesh         | Firewall, DMZ services, and internal app/database tiers in two modules   | DMZ segmentation and `mesh` layout                            |
| `rag-pipeline.yaml`                 | AI pipeline            | arch-dark / horizontal   | Linear ingest → embed → store → retrieve → LLM answer path               | Linear RAG pipeline requests                                  |
| `replicated-brand-flow.yaml`        | Replicated flowchart   | tech-blue / vertical     | Redraw that preserves the source brand palette via `meta.replication`    | Replicate-mode output shape reference                         |
| `swimlane-engineering-review.yaml`  | Swimlane process map   | tech-blue / vertical     | Three-swimlane review/remediation sequence                               | Swimlane / process-map requests                               |
| `tiered-network-topology.yaml`      | Network topology       | tech-blue / tiered       | Internet edge to server farm in classic North-South three-tier rows      | `tiered` layout from `network.tier` roles                     |
| `tool-call-loop.yaml`               | AI agent diagram       | arch-dark / horizontal   | LLM tool-call cycle with text annotations                                | Tool-use loop diagrams                                        |
| `vendor-device-mapping.yaml`        | Network topology       | tech-blue / star         | Vendor/device metadata mapped to documented provider and Cisco stencils  | Provider-icon mapping driven by network metadata              |

Palette swatch catalog and previews: `palettes/README.md`.
