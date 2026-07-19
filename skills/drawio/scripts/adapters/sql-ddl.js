import {
  AdapterContractError,
  ERROR_CODES,
  createGroupIdentity,
  createSqlIdentity
} from './identity.js'
import {
  adapterError,
  assertSourceText,
  diagnostic,
  finalizeConfigProjection,
  isRecord,
  pushUniqueEdge
} from './config-common.js'
import { runOptionalPythonParser } from './optional-python.js'

const ADAPTER = 'sql-ddl'

export const SQL_ATTRIBUTE_ALLOWLIST = Object.freeze({
  node: ['columnCount', 'columns', 'dialect', 'schema'],
  edge: ['columns', 'targetColumns'],
  module: ['dialect', 'schema']
})

function validateWorkerResult(result) {
  if (!isRecord(result) || !Array.isArray(result.tables) || !Array.isArray(result.diagnostics || [])) {
    adapterError(ERROR_CODES.ADAPTER_PARSE, 'SQL parser returned an invalid record set', { adapter: ADAPTER })
  }
  return result
}

function columnSummary(column) {
  if (!isRecord(column) || typeof column.name !== 'string' || typeof column.type !== 'string') {
    adapterError(ERROR_CODES.ADAPTER_PARSE, 'SQL parser returned an invalid column record', { adapter: ADAPTER })
  }
  return [column.name, column.type, column.primaryKey ? 'pk' : 'column', column.nullable === false ? 'required' : 'nullable'].join(':')
}

export function parseSqlDdl(
  source,
  { dialect = 'postgres', defaultSchema = '_default', locator = 'schema.sql', runParser = runOptionalPythonParser } = {}
) {
  assertSourceText(source, ADAPTER)
  let result
  try {
    result = validateWorkerResult(runParser({ adapter: 'sql', source, dialect, defaultSchema }))
  } catch (error) {
    if (error instanceof AdapterContractError || error?.code) throw error
    adapterError(ERROR_CODES.ADAPTER_PARSE, 'SQL parser failed', { adapter: ADAPTER }, error)
  }

  const identities = new Map()
  const moduleIdentities = new Map()
  const nodes = result.tables.map((table) => {
    if (!isRecord(table) || typeof table.schema !== 'string' || typeof table.name !== 'string' || !Array.isArray(table.columns)) {
      adapterError(ERROR_CODES.ADAPTER_PARSE, 'SQL parser returned an invalid table record', { adapter: ADAPTER })
    }
    const identity = createSqlIdentity({ dialect, schema: table.schema, table: table.name })
    identities.set(`${table.schema}\0${table.name}`, identity)
    if (!moduleIdentities.has(table.schema)) {
      moduleIdentities.set(table.schema, createGroupIdentity({ domain: 'sql-schema', key: `${dialect}/${table.schema}` }))
    }
    const columns = table.columns.map(columnSummary)
    return {
      identity,
      label: `${table.schema}.${table.name}`,
      semanticType: 'database',
      moduleIdentity: moduleIdentities.get(table.schema),
      attributes: { dialect, schema: table.schema, columnCount: columns.length, columns }
    }
  })
  const modules = [...moduleIdentities].map(([schema, identity]) => ({
    identity,
    label: schema,
    attributes: { dialect, schema }
  }))
  const edges = []
  const edgeKeys = new Set()
  const diagnostics = (result.diagnostics || []).map((entry) =>
    diagnostic(
      typeof entry?.code === 'string' ? entry.code : 'SQL_DIAGNOSTIC',
      typeof entry?.message === 'string' ? entry.message : 'SQL parser emitted a diagnostic.'
    )
  )

  for (const table of result.tables) {
    const from = identities.get(`${table.schema}\0${table.name}`)
    for (const foreignKey of Array.isArray(table.foreignKeys) ? table.foreignKeys : []) {
      if (!isRecord(foreignKey) || typeof foreignKey.targetSchema !== 'string' || typeof foreignKey.targetTable !== 'string') {
        adapterError(ERROR_CODES.ADAPTER_PARSE, 'SQL parser returned an invalid foreign-key record', { adapter: ADAPTER })
      }
      const to = identities.get(`${foreignKey.targetSchema}\0${foreignKey.targetTable}`)
      if (!to) {
        adapterError(
          ERROR_CODES.ADAPTER_UNSUPPORTED,
          `SQL foreign key target table ${foreignKey.targetSchema}.${foreignKey.targetTable} is not present`,
          { adapter: ADAPTER }
        )
      }
      const columns = Array.isArray(foreignKey.columns) ? foreignKey.columns.map(String) : []
      const targetColumns = Array.isArray(foreignKey.targetColumns) ? foreignKey.targetColumns.map(String) : []
      const sourceName = foreignKey.name || 'fk'
      const discriminator = `${sourceName}:${columns.join(',')}->${targetColumns.join(',')}`
      pushUniqueEdge(edges, edgeKeys, {
        from,
        to,
        relation: 'foreign-key',
        discriminator,
        attributes: { columns, targetColumns }
      })
    }
  }

  return finalizeConfigProjection(
    { adapter: ADAPTER, domain: 'sql', locator, nodes, edges, modules, diagnostics },
    SQL_ATTRIBUTE_ALLOWLIST
  )
}
