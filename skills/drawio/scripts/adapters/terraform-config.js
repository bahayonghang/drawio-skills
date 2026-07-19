import {
  AdapterContractError,
  ERROR_CODES,
  createGroupIdentity,
  createTerraformIdentity
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

const ADAPTER = 'terraform-config'

export const TERRAFORM_ATTRIBUTE_ALLOWLIST = Object.freeze({
  node: ['module', 'provider', 'resourceType'],
  edge: [],
  module: ['path']
})

export function terraformModulePath(address) {
  const parts = address.split('.')
  return parts.length > 2 ? parts.slice(0, -2).join('.') : '_root'
}

export function terraformResourceLabel(address) {
  return address.split('.').slice(-2).join('.')
}

function validateWorkerResult(result) {
  if (!isRecord(result) || !Array.isArray(result.resources) || !Array.isArray(result.diagnostics || [])) {
    adapterError(ERROR_CODES.ADAPTER_PARSE, 'Terraform parser returned an invalid record set', { adapter: ADAPTER })
  }
  return result
}

export function buildTerraformIdentityInput(resource) {
  if (!isRecord(resource) || typeof resource.address !== 'string') {
    adapterError(ERROR_CODES.ADAPTER_PARSE, 'Terraform resource record requires an address', { adapter: ADAPTER })
  }
  return resource.address
}

export function buildTerraformNodeAttributes(resource) {
  if (
    !isRecord(resource) ||
    typeof resource.address !== 'string' ||
    typeof resource.resourceType !== 'string' ||
    typeof resource.provider !== 'string'
  ) {
    adapterError(ERROR_CODES.ADAPTER_PARSE, 'Terraform resource record requires address, resourceType, and provider', {
      adapter: ADAPTER
    })
  }
  return {
    module: terraformModulePath(resource.address),
    provider: resource.provider,
    resourceType: resource.resourceType
  }
}

export function parseTerraformConfig(
  source,
  { locator = 'main.tf', moduleAddress = '', runParser = runOptionalPythonParser } = {}
) {
  assertSourceText(source, ADAPTER)
  let result
  try {
    result = validateWorkerResult(runParser({ adapter: 'terraform', source, moduleAddress }))
  } catch (error) {
    if (error instanceof AdapterContractError || error?.code) throw error
    adapterError(ERROR_CODES.ADAPTER_PARSE, 'Terraform parser failed', { adapter: ADAPTER }, error)
  }

  const identities = new Map()
  const moduleIdentities = new Map()
  const nodes = result.resources.map((resource) => {
    if (!isRecord(resource) || typeof resource.resourceType !== 'string' || typeof resource.provider !== 'string') {
      adapterError(ERROR_CODES.ADAPTER_PARSE, 'Terraform parser returned an invalid resource record', { adapter: ADAPTER })
    }
    const identity = createTerraformIdentity(buildTerraformIdentityInput(resource))
    identities.set(resource.address, identity)
    const attributes = buildTerraformNodeAttributes(resource)
    const module = attributes.module
    if (!moduleIdentities.has(module)) {
      moduleIdentities.set(module, createGroupIdentity({ domain: 'terraform', key: module }))
    }
    return {
      identity,
      label: terraformResourceLabel(resource.address),
      semanticType: resource.resourceType.includes('database') || resource.resourceType.includes('db_') ? 'database' : 'service',
      moduleIdentity: moduleIdentities.get(module),
      attributes
    }
  })
  const modules = [...moduleIdentities].map(([path, identity]) => ({
    identity,
    label: path === '_root' ? 'root' : path,
    attributes: { path }
  }))
  const edges = []
  const edgeKeys = new Set()
  const diagnostics = (result.diagnostics || []).map((entry) =>
    diagnostic(
      typeof entry?.code === 'string' ? entry.code : 'TERRAFORM_DIAGNOSTIC',
      typeof entry?.message === 'string' ? entry.message : 'Terraform parser emitted a diagnostic.'
    )
  )

  for (const resource of result.resources) {
    const from = identities.get(resource.address)
    for (const [relation, references] of [
      ['depends-on', resource.dependsOn],
      ['references', resource.references]
    ]) {
      for (const targetAddress of Array.isArray(references) ? references : []) {
        const to = identities.get(targetAddress)
        if (!to) {
          diagnostics.push(diagnostic('TERRAFORM_EXTERNAL_REF', `${resource.address} references external resource ${targetAddress}.`, from))
          continue
        }
        pushUniqueEdge(edges, edgeKeys, {
          from,
          to,
          relation,
          discriminator: `${relation}:${targetAddress}`,
          attributes: {}
        })
      }
    }
  }

  return finalizeConfigProjection(
    { adapter: ADAPTER, domain: 'terraform', locator, nodes, edges, modules, diagnostics },
    TERRAFORM_ATTRIBUTE_ALLOWLIST
  )
}
