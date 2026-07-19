import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { parseSqlDdl } from './sql-ddl.js'
import { parseTerraformConfig } from './terraform-config.js'
import { runOptionalPythonParser } from './optional-python.js'

const pythonCommand = process.env.DRAWIO_TEST_PYTHON
const integrationTest = pythonCommand ? test : test.skip
const runParser = (request) => runOptionalPythonParser(request, { pythonCommand })
const fixture = (name) => readFileSync(new URL(`../../references/examples/importers/${name}`, import.meta.url), 'utf8')

integrationTest('optional Python worker parses pinned HCL and SQL packages', () => {
  const terraform = parseTerraformConfig(
    fixture('terraform.tf'),
    { locator: 'infra/main.tf', moduleAddress: 'module.app', runParser }
  )
  assert.deepEqual(terraform.nodes.map((node) => node.identity.key), [
    'module.app.aws_instance.api',
    'module.app.aws_security_group.web'
  ])
  assert.deepEqual(new Set(terraform.edges.map((edge) => edge.relation)), new Set(['depends-on', 'references']))
  assert.equal(terraform.diagnostics.length, 0)

  const sql = parseSqlDdl(
    fixture('schema.sql'),
    { dialect: 'postgres', defaultSchema: 'public', locator: 'db/schema.sql', runParser }
  )
  assert.equal(sql.edges.length, 1)
  assert.equal(sql.edges[0].discriminator, 'orders_user_fk:user_id->id')
})
