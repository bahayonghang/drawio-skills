import test from 'node:test'
import assert from 'node:assert/strict'

import { ERROR_CODES } from './identity.js'
import { parseTerraformConfig, TERRAFORM_ATTRIBUTE_ALLOWLIST } from './terraform-config.js'

const records = {
  resources: [
    {
      address: 'module.api.aws_instance.web',
      resourceType: 'aws_instance',
      provider: 'aws',
      references: ['module.net.aws_security_group.web'],
      dependsOn: []
    },
    {
      address: 'module.net.aws_security_group.web',
      resourceType: 'aws_security_group',
      provider: 'aws',
      references: [],
      dependsOn: []
    }
  ],
  diagnostics: []
}

test('parseTerraformConfig uses worker records and shared Terraform identities', () => {
  const projection = parseTerraformConfig('resource "aws_instance" "web" {}', {
    locator: 'infra/main.tf',
    runParser: () => records
  })

  assert.equal(projection.source.adapter, 'terraform-config')
  assert.deepEqual(projection.nodes.map((node) => node.identity.key), [
    'module.api.aws_instance.web',
    'module.net.aws_security_group.web'
  ])
  assert.equal(projection.edges[0].relation, 'references')
  assert.equal(projection.nodes[0].attributes.resourceType, 'aws_instance')
  assert.deepEqual(TERRAFORM_ATTRIBUTE_ALLOWLIST.node, ['module', 'provider', 'resourceType'])
})

test('parseTerraformConfig keeps identity stable across labels and record order', () => {
  const reversed = { ...records, resources: [...records.resources].reverse() }
  const first = parseTerraformConfig('x', { locator: 'infra/main.tf', runParser: () => records })
  const second = parseTerraformConfig('x', { locator: 'other/main.tf', runParser: () => reversed })

  assert.deepEqual(
    first.nodes.map((node) => node.identity),
    second.nodes.map((node) => node.identity)
  )
})

test('parseTerraformConfig preserves optional dependency errors', () => {
  assert.throws(
    () =>
      parseTerraformConfig('x', {
        locator: 'infra/main.tf',
        runParser: () => {
          const error = new Error('python-hcl2 is unavailable')
          error.code = ERROR_CODES.OPTIONAL_DEPENDENCY_MISSING
          throw error
        }
      }),
    (error) => error.code === ERROR_CODES.OPTIONAL_DEPENDENCY_MISSING
  )
})
