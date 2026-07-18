import test from 'node:test'
import assert from 'node:assert/strict'

import {
  ERROR_CODES,
  createCiIdentity,
  createCodeIdentity,
  createComposeIdentity,
  createEdgeIdentity,
  createGroupIdentity,
  createKubernetesIdentity,
  createOpenApiIdentity,
  createRendererId,
  createSqlIdentity,
  createTerraformIdentity,
  serializeIdentity
} from './identity.js'

test('domain identity factories produce canonical label-independent keys', () => {
  assert.deepEqual(createTerraformIdentity('module.api.aws_instance.web[0]'), {
    scheme: 'terraform-resource',
    key: 'module.api.aws_instance.web[0]'
  })
  assert.deepEqual(
    createKubernetesIdentity({ scope: 'prod', namespace: '', kind: 'Deployment', name: 'api', namespaced: true }),
    { scheme: 'kubernetes-object', key: 'prod/default/Deployment/api' }
  )
  assert.deepEqual(
    createKubernetesIdentity({ scope: 'prod', kind: 'Namespace', name: 'payments', namespaced: false }),
    { scheme: 'kubernetes-object', key: 'prod/_cluster/Namespace/payments' }
  )
  assert.deepEqual(createComposeIdentity({ project: 'shop', service: 'api' }), {
    scheme: 'compose-service',
    key: 'shop/api'
  })
  assert.deepEqual(createCodeIdentity({ language: 'typescript', modulePath: './src\\api\\index.ts' }), {
    scheme: 'code-module',
    key: 'typescript/src/api/index.ts'
  })
  assert.deepEqual(createOpenApiIdentity({ method: 'get', path: '  v1//Pets/{id}/ ' }), {
    scheme: 'openapi-operation',
    key: 'GET /v1/Pets/{id}'
  })
  assert.deepEqual(
    createCiIdentity({ provider: 'github-actions', workflow: '.github/workflows/ci.yml', job: 'test' }),
    { scheme: 'ci-job', key: 'github-actions/.github%2Fworkflows%2Fci.yml/test' }
  )
  assert.deepEqual(createSqlIdentity({ dialect: 'postgres', schema: 'public', table: 'users' }), {
    scheme: 'sql-table',
    key: 'postgres/public/users'
  })
  assert.deepEqual(createGroupIdentity({ domain: 'terraform', key: 'module.api' }), {
    scheme: 'terraform-group',
    key: 'module.api'
  })
})

test('renderer ids are stable, safe, and independent from display metadata', () => {
  const identity = createCodeIdentity({ language: 'typescript', modulePath: 'src/api.ts' })
  const first = createRendererId(identity, { kind: 'node' })
  const second = createRendererId({ ...identity }, { kind: 'node' })

  assert.equal(first, second)
  assert.match(first, /^n-[a-f0-9]{20}$/)
  assert.equal(serializeIdentity(identity), 'code-module\0typescript/src/api.ts')
})

test('edge identity uses a persisted control-character-free canonical tuple', () => {
  const from = createComposeIdentity({ project: 'shop', service: 'api' })
  const to = createComposeIdentity({ project: 'shop', service: 'db' })
  const identity = createEdgeIdentity({ from, to, relation: 'depends-on', discriminator: 'service:db' })

  assert.equal(identity.scheme, 'graph-edge')
  assert.deepEqual(JSON.parse(identity.key), [
    'depends-on',
    'compose-service\u0000shop/api',
    'compose-service\u0000shop/db',
    'service:db'
  ])
  assert.doesNotMatch(identity.key, /[\u0000-\u001f\u007f]/)
})

test('identity factories reject ambiguous or unsafe inputs with stable codes', () => {
  assert.throws(
    () => createCodeIdentity({ language: 'typescript', modulePath: '../outside.ts' }),
    (error) => error.code === ERROR_CODES.IDENTITY_INVALID && /project root/.test(error.message)
  )
  assert.throws(
    () => createCodeIdentity({ language: 'typescript', modulePath: 'C:outside.ts' }),
    (error) => error.code === ERROR_CODES.IDENTITY_INVALID && /project root/.test(error.message)
  )
  assert.throws(
    () => createTerraformIdentity('web'),
    (error) => error.code === ERROR_CODES.IDENTITY_INVALID && /Terraform/.test(error.message)
  )
  assert.throws(
    () => createKubernetesIdentity({ scope: 'prod', kind: 'Widget', name: 'x' }),
    (error) => error.code === ERROR_CODES.IDENTITY_INVALID && /namespaced/.test(error.message)
  )
  assert.throws(
    () => createOpenApiIdentity({ method: 'get', path: '/pets with space' }),
    (error) => error.code === ERROR_CODES.IDENTITY_INVALID && /whitespace/.test(error.message)
  )
  assert.throws(
    () => createKubernetesIdentity({ scope: 'prod', namespace: 0, kind: 'Deployment', name: 'api', namespaced: true }),
    (error) => error.code === ERROR_CODES.IDENTITY_INVALID && /namespace/.test(error.message)
  )
  assert.throws(
    () => createSqlIdentity({ dialect: 42, table: 'users' }),
    (error) => error.code === ERROR_CODES.IDENTITY_INVALID && /dialect/.test(error.message)
  )
  assert.throws(
    () => createRendererId(createCodeIdentity({ language: 'typescript', modulePath: 'src/api.ts' }), { hash: 'sha256' }),
    (error) => error.code === ERROR_CODES.IDENTITY_INVALID && /hash must be a function/.test(error.message)
  )
})
