import test from 'node:test'
import assert from 'node:assert/strict'

import { ERROR_CODES } from './identity.js'
import { KUBERNETES_ATTRIBUTE_ALLOWLIST, parseKubernetesManifests } from './kubernetes.js'

const manifests = `
apiVersion: apps/v1
kind: Deployment
metadata: { name: api, namespace: shop }
spec:
  replicas: 2
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          envFrom:
            - configMapRef: { name: api-config }
---
apiVersion: v1
kind: Service
metadata: { name: api, namespace: shop }
spec:
  selector: { app: api }
---
apiVersion: v1
kind: ConfigMap
metadata: { name: api-config, namespace: shop }
data: { PASSWORD: should-not-cross }
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: public, namespace: shop }
spec:
  rules:
    - http:
        paths:
          - backend: { service: { name: api, port: { number: 80 } } }
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: api, namespace: shop }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: api }
`

test('parseKubernetesManifests extracts stable objects and declared relations', () => {
  const projection = parseKubernetesManifests(manifests, { scope: 'prod', locator: 'k8s/app.yaml' })

  assert.equal(projection.nodes.length, 5)
  assert.deepEqual(
    new Set(projection.edges.map((edge) => edge.relation)),
    new Set(['selects', 'references', 'routes-to', 'scales'])
  )
  assert.ok(projection.nodes.every((node) => node.identity.key.startsWith('prod/')))
  const config = projection.nodes.find((node) => node.label === 'api-config')
  assert.equal('data' in config.attributes, false)
  assert.deepEqual(KUBERNETES_ATTRIBUTE_ALLOWLIST.node, ['apiVersion', 'kind', 'namespace', 'replicas'])
})

test('parseKubernetesManifests rejects unknown kind scope without an override', () => {
  assert.throws(
    () =>
      parseKubernetesManifests('apiVersion: example/v1\nkind: Widget\nmetadata: { name: demo }', {
        scope: 'prod',
        locator: 'k8s/widget.yaml'
      }),
    (error) => error.code === ERROR_CODES.ADAPTER_UNSUPPORTED && /scope/.test(error.message)
  )
})

test('parseKubernetesManifests supports explicit CRD scope overrides', () => {
  const projection = parseKubernetesManifests('apiVersion: example/v1\nkind: Widget\nmetadata: { name: demo }', {
    scope: 'prod',
    locator: 'k8s/widget.yaml',
    kindScopes: { Widget: true }
  })
  assert.equal(projection.nodes[0].identity.key, 'prod/default/Widget/demo')
})
