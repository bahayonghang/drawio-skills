# Examples

Use these examples as prompt templates or as starting points for YAML-first authoring.

## How to Read the Examples

Each example is useful in one of two ways:

- **Prompt-first**: paste the prompt into your client and let the skill route it
- **Spec-first**: open the matching YAML file under `skills/drawio/references/examples/` and render it with the CLI

## Good Example Categories

- flowcharts
- architecture diagrams
- network diagrams
- sequence-style interaction diagrams
- academic and math-heavy figures
- replication-oriented redraws

## Prompt Examples

### Flowchart

```text
/drawio create a horizontal tech-blue login flow with validation and error handling
```

### Architecture

```text
/drawio create a tech-blue microservices architecture with API Gateway, User Service, Order Service, Redis, and PostgreSQL
```

### Academic figure

```text
/drawio create an IEEE-style research workflow figure in grayscale with one dedicated loss-function node
```

### Network topology

```text
/drawio create a campus network topology with an edge firewall, a core switch, distribution switches, wireless APs, and VLAN labels on the links
```

### Vendor-aware topology

```text
/drawio create an AWS VPC topology with internet gateway, application load balancer, EC2 app servers, and a private RDS subnet using provider icons
```

### Replication

```text
/drawio replicate
Color mode: preserve-original
[upload screenshot]
```

## YAML Example Files

Look in `skills/drawio/references/examples/` for reusable specs such as:

- `login-flow.yaml`
- `microservices.yaml`
- `research-pipeline.yaml`
- `ieee-network-paper.yaml`
- `campus-lan-topology.yaml`
- `aws-vpc-topology.yaml`
- `onprem-dmz-topology.yaml`
- `vendor-device-mapping.yaml`
- `replicated-brand-flow.yaml`

Render one directly:

```bash
node skills/drawio/scripts/cli.js skills/drawio/references/examples/login-flow.yaml output.drawio --validate --write-sidecars
node skills/drawio/scripts/cli.js skills/drawio/references/examples/vendor-device-mapping.yaml output.drawio --validate --write-sidecars
```

## Next Steps

- [Flowchart](./flowchart.md)
- [Architecture Diagram](./architecture.md)
- [YAML Examples](./yaml-examples.md)
- [Creating Diagrams](/guide/creating-diagrams.md)
