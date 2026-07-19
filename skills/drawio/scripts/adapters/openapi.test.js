import test from 'node:test'
import assert from 'node:assert/strict'

import { parseOpenApiDocument } from './openapi.js'

const document = `
openapi: 3.1.0
paths:
  /Pets/{id}:
    get:
      operationId: getPet
      summary: Fetch pet
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Pet' }
  /external:
    post:
      responses:
        '200': { $ref: 'common.yaml#/responses/Ok' }
components:
  schemas:
    Pet:
      type: object
`

test('parseOpenApiDocument preserves method/path identity and component refs', () => {
  const projection = parseOpenApiDocument(document, { locator: 'api/openapi.yaml' })
  const operation = projection.nodes.find((node) => node.identity.scheme === 'openapi-operation')

  assert.equal(operation.identity.key, 'GET /Pets/{id}')
  assert.equal(projection.edges[0].relation, 'uses-schema')
  assert.ok(projection.diagnostics.some((diagnostic) => diagnostic.code === 'OPENAPI_EXTERNAL_REF'))
})

test('OpenAPI summary and operationId changes do not change operation identity', () => {
  const first = parseOpenApiDocument(document, { locator: 'api/openapi.yaml' })
  const changed = parseOpenApiDocument(document.replace('getPet', 'renamed').replace('Fetch pet', 'Changed label'), {
    locator: 'api/openapi.yaml'
  })
  assert.deepEqual(
    first.nodes.map((node) => node.identity),
    changed.nodes.map((node) => node.identity)
  )
})
