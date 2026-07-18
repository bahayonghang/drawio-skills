import { ERROR_CODES, createGroupIdentity, createTerraformIdentity } from './identity.js'
import {
  adapterError,
  diagnostic,
  finalizeConfigProjection,
  isRecord,
  parseJsonDocument,
  pushUniqueEdge
} from './config-common.js'
import {
  TERRAFORM_ATTRIBUTE_ALLOWLIST,
  buildTerraformIdentityInput,
  buildTerraformNodeAttributes,
  terraformResourceLabel
} from './terraform-config.js'

const ADAPTER = 'terraform-state'

function collectResources(module, resources, state) {
  if (!isRecord(module)) {
    adapterError(ERROR_CODES.ADAPTER_PARSE, 'Terraform root_module and child_modules must be objects', {
      adapter: ADAPTER
    })
  }
  for (const resource of Array.isArray(module.resources) ? module.resources : []) {
    if (!isRecord(resource)) {
      adapterError(ERROR_CODES.ADAPTER_PARSE, 'Terraform state resource must be an object', { adapter: ADAPTER })
    }
    if (resource.mode === 'data') {
      state.dataSources++
      continue
    }
    if (resource.mode != null && resource.mode !== 'managed') {
      adapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Terraform state resource mode is unsupported', {
        adapter: ADAPTER
      })
    }
    if (
      typeof resource.address !== 'string' ||
      typeof resource.type !== 'string' ||
      !Array.isArray(resource.depends_on || []) ||
      !(resource.depends_on || []).every((value) => typeof value === 'string')
    ) {
      adapterError(ERROR_CODES.ADAPTER_PARSE, 'Terraform state resource requires address, type, and string depends_on', {
        adapter: ADAPTER
      })
    }
    if (resource.address.includes('[')) state.instances++
    resources.push({
      address: resource.address,
      resourceType: resource.type,
      provider: resource.type.split('_', 1)[0],
      dependsOn: resource.depends_on || []
    })
  }
  for (const child of Array.isArray(module.child_modules) ? module.child_modules : []) {
    collectResources(child, resources, state)
  }
}

function dependencyTargets(dependency, addresses) {
  if (addresses.has(dependency)) return [dependency]
  return [...addresses].filter((address) => address.startsWith(`${dependency}[`)).sort()
}

export function parseTerraformStateSnapshot(source, { locator = 'terraform-state.json' } = {}) {
  const document = parseJsonDocument(source, { adapter: ADAPTER })
  if (!isRecord(document)) {
    adapterError(ERROR_CODES.ADAPTER_PARSE, 'Terraform state snapshot must be a JSON object', { adapter: ADAPTER })
  }
  if (typeof document.format_version !== 'string' || !/^1\.\d+$/.test(document.format_version)) {
    adapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Terraform state format_version must be supported 1.x JSON', {
      adapter: ADAPTER
    })
  }
  const values = document.values || document.planned_values
  if (!isRecord(values) || !isRecord(values.root_module)) {
    adapterError(ERROR_CODES.ADAPTER_PARSE, 'Terraform state snapshot requires values.root_module or planned_values.root_module', {
      adapter: ADAPTER
    })
  }

  const resources = []
  const state = { dataSources: 0, instances: 0 }
  collectResources(values.root_module, resources, state)
  if (resources.length === 0) {
    adapterError(ERROR_CODES.ADAPTER_UNSUPPORTED, 'Terraform state snapshot contains no managed resources', {
      adapter: ADAPTER
    })
  }

  const identities = new Map()
  const moduleIdentities = new Map()
  const nodes = resources.map((resource) => {
    const identity = createTerraformIdentity(buildTerraformIdentityInput(resource))
    identities.set(resource.address, identity)
    const attributes = buildTerraformNodeAttributes(resource)
    if (!moduleIdentities.has(attributes.module)) {
      moduleIdentities.set(attributes.module, createGroupIdentity({ domain: 'terraform', key: attributes.module }))
    }
    return {
      identity,
      label: terraformResourceLabel(resource.address),
      semanticType:
        resource.resourceType.includes('database') || resource.resourceType.includes('db_') ? 'database' : 'service',
      moduleIdentity: moduleIdentities.get(attributes.module),
      attributes
    }
  })
  const modules = [...moduleIdentities].map(([path, identity]) => ({
    identity,
    label: path === '_root' ? 'root' : path,
    attributes: { path }
  }))
  const addresses = new Set(identities.keys())
  const edges = []
  const edgeKeys = new Set()
  const diagnostics = []

  for (const resource of resources) {
    for (const dependency of resource.dependsOn) {
      const targets = dependencyTargets(dependency, addresses)
      if (targets.length === 0) {
        diagnostics.push(
          diagnostic('TERRAFORM_EXTERNAL_REF', 'Terraform resource references a managed resource outside the snapshot.', identities.get(resource.address))
        )
        continue
      }
      for (const target of targets) {
        if (target === resource.address) continue
        pushUniqueEdge(edges, edgeKeys, {
          from: identities.get(resource.address),
          to: identities.get(target),
          relation: 'depends-on',
          discriminator: `depends-on:${target}`,
          attributes: {}
        })
      }
    }
  }
  if (state.dataSources > 0) {
    diagnostics.push(diagnostic('TERRAFORM_DATA_EXCLUDED', `Terraform data sources were excluded. Count: ${state.dataSources}.`))
  }
  if (state.instances > 0) {
    diagnostics.push(
      diagnostic(
        'TERRAFORM_INSTANCE_GRANULARITY',
        `Terraform instance addresses remain exact and are not aggregated. Count: ${state.instances}.`
      )
    )
  }

  return finalizeConfigProjection(
    { adapter: ADAPTER, domain: 'terraform', mode: 'live', locator, nodes, edges, modules, diagnostics },
    TERRAFORM_ATTRIBUTE_ALLOWLIST
  )
}
