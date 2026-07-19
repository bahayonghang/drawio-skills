import test from 'node:test'
import assert from 'node:assert/strict'

import { ERROR_CODES } from './identity.js'
import { parseSqlDdl, SQL_ATTRIBUTE_ALLOWLIST } from './sql-ddl.js'

const records = {
  tables: [
    {
      schema: 'public',
      name: 'users',
      columns: [{ name: 'id', type: 'INT', primaryKey: true, nullable: false }],
      foreignKeys: []
    },
    {
      schema: 'sales',
      name: 'orders',
      columns: [
        { name: 'id', type: 'INT', primaryKey: true, nullable: false },
        { name: 'user_id', type: 'INT', primaryKey: false, nullable: false }
      ],
      foreignKeys: [
        {
          name: 'orders_user_fk',
          columns: ['user_id'],
          targetSchema: 'public',
          targetTable: 'users',
          targetColumns: ['id']
        }
      ]
    }
  ],
  diagnostics: []
}

test('parseSqlDdl projects schema-qualified tables and stable foreign keys', () => {
  const projection = parseSqlDdl('CREATE TABLE ...', {
    dialect: 'postgres',
    locator: 'db/schema.sql',
    runParser: () => records
  })

  assert.deepEqual(projection.nodes.map((node) => node.identity.key), ['postgres/public/users', 'postgres/sales/orders'])
  assert.equal(projection.edges[0].relation, 'foreign-key')
  assert.equal(projection.edges[0].discriminator, 'orders_user_fk:user_id->id')
  assert.equal(projection.nodes[1].attributes.columns[0], 'id:INT:pk:required')
  assert.deepEqual(SQL_ATTRIBUTE_ALLOWLIST.node, ['columnCount', 'columns', 'dialect', 'schema'])
})

test('parseSqlDdl rejects foreign keys whose target table is absent', () => {
  const incomplete = { ...records, tables: [records.tables[1]] }
  assert.throws(
    () => parseSqlDdl('x', { dialect: 'postgres', locator: 'db/schema.sql', runParser: () => incomplete }),
    (error) => error.code === ERROR_CODES.ADAPTER_UNSUPPORTED && /target table/.test(error.message)
  )
})
