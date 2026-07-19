import test from 'node:test'
import assert from 'node:assert/strict'

import { applyAutoLayout } from '../dsl/auto-layout.js'
import { specToDrawioXml, validateSpec, validateXml } from '../dsl/spec-to-drawio.js'
import { parseCiWorkflow } from './ci.js'
import { parseComposeConfig } from './compose.js'
import { parseKubernetesManifests } from './kubernetes.js'
import { parseOpenApiDocument } from './openapi.js'
import { projectGraphToSpec } from './projection-to-spec.js'
import { parseSqlDdl } from './sql-ddl.js'
import { parseTerraformConfig } from './terraform-config.js'

const projections = [
  parseTerraformConfig('x', {
    locator: 'infra/main.tf',
    runParser: () => ({
      resources: [
        { address: 'aws_instance.api', resourceType: 'aws_instance', provider: 'aws', references: ['aws_security_group.web'], dependsOn: [] },
        { address: 'aws_security_group.web', resourceType: 'aws_security_group', provider: 'aws', references: [], dependsOn: [] }
      ],
      diagnostics: []
    })
  }),
  parseKubernetesManifests(
    'apiVersion: apps/v1\nkind: Deployment\nmetadata: { name: api }\n---\napiVersion: v1\nkind: Service\nmetadata: { name: api }\nspec: { selector: { app: api } }',
    { scope: 'test', locator: 'k8s/app.yaml' }
  ),
  parseComposeConfig('name: shop\nservices: { api: { depends_on: [db] }, db: { image: postgres:16 } }', {
    locator: 'compose.yaml'
  }),
  parseSqlDdl('x', {
    dialect: 'postgres',
    locator: 'db/schema.sql',
    runParser: () => ({
      tables: [{ schema: 'public', name: 'users', columns: [{ name: 'id', type: 'INT', primaryKey: true, nullable: false }], foreignKeys: [] }],
      diagnostics: []
    })
  }),
  parseOpenApiDocument('openapi: 3.1.0\npaths:\n  /health:\n    get: { responses: { "200": { description: ok } } }', {
    locator: 'api/openapi.yaml'
  }),
  parseCiWorkflow('jobs: { build: { runs-on: ubuntu-latest }, test: { needs: build, runs-on: ubuntu-latest } }', {
    provider: 'github-actions',
    workflow: '.github/workflows/ci.yml'
  })
]

test('all config adapters use the canonical spec, JavaScript ELK, and renderer pipeline', async () => {
  for (const projection of projections) {
    const spec = projectGraphToSpec(projection)
    validateSpec(spec)
    const layout = await applyAutoLayout(spec)
    assert.equal(layout.applied, true, projection.source.adapter)
    const xml = specToDrawioXml(layout.spec)
    assert.deepEqual(validateXml(xml), { valid: true, errors: [], warnings: [] })
  }
})
