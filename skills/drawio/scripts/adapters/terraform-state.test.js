import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { parseTerraformConfig } from './terraform-config.js'
import { parseTerraformStateSnapshot } from './terraform-state.js'

const fixture = readFileSync(
  new URL('../../references/examples/importers/live/terraform-state.json', import.meta.url),
  'utf8'
)

test('Terraform state snapshot emits a finalized live projection without sensitive payloads', () => {
  const projection = parseTerraformStateSnapshot(fixture, { locator: 'snapshots/terraform-state.json' })

  assert.equal(projection.source.adapter, 'terraform-state')
  assert.equal(projection.source.mode, 'live')
  assert.deepEqual(projection.nodes.map((node) => node.identity.key), [
    'aws_instance.api',
    'aws_security_group.web',
    'module.workers.aws_instance.worker[0]',
    'module.workers.aws_instance.worker[1]'
  ])
  assert.equal(projection.edges[0].relation, 'depends-on')
  assert.ok(projection.diagnostics.some((entry) => entry.code === 'TERRAFORM_DATA_EXCLUDED'))
  assert.ok(projection.diagnostics.some((entry) => entry.code === 'TERRAFORM_INSTANCE_GRANULARITY'))

  const serialized = JSON.stringify(projection)
  for (const secret of [
    'terraform-secret-must-not-cross',
    'data-secret-must-not-cross',
    'output-secret-must-not-cross',
    'sensitive_values',
    'outputs'
  ]) {
    assert.equal(serialized.includes(secret), false, secret)
  }
})

test('Terraform declared/live exact addresses share identity and attributes', () => {
  const declared = parseTerraformConfig('x', {
    locator: 'infra/main.tf',
    runParser: () => ({
      resources: [
        {
          address: 'aws_instance.api',
          resourceType: 'aws_instance',
          provider: 'aws',
          references: [],
          dependsOn: []
        }
      ],
      diagnostics: []
    })
  })
  const live = parseTerraformStateSnapshot(fixture, { locator: 'snapshots/terraform-state.json' })
  const liveApi = live.nodes.find((node) => node.identity.key === 'aws_instance.api')

  assert.deepEqual(liveApi.identity, declared.nodes[0].identity)
  assert.deepEqual(liveApi.attributes, declared.nodes[0].attributes)
})

test('Terraform state snapshot rejects malformed and unsupported versions', () => {
  assert.throws(() => parseTerraformStateSnapshot('{', { locator: 'state.json' }), /ADAPTER_PARSE|parsed/i)
  assert.throws(
    () => parseTerraformStateSnapshot('{"format_version":"2.0","values":{}}', { locator: 'state.json' }),
    (error) => error.code === 'ADAPTER_UNSUPPORTED' && /format_version/.test(error.message)
  )
})
