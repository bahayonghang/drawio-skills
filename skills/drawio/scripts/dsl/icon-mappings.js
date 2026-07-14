import { resolveImageIconStyle } from './icon-resolver.js'

const ICON_PREFIXES = {
  'aws.': 'mxgraph.aws4.',
  'gcp.': 'mxgraph.gcp2.',
  'azure.': 'mxgraph.azure.',
  'k8s.': 'mxgraph.kubernetes.icon2:prIcon=',
  'cisco.': 'mxgraph.cisco.',
  'cisco19.': 'mxgraph.cisco19.',
  'mxgraph.': 'mxgraph.'
}

const ICON_ALIASES = {
  'aws.alb': 'aws.application_load_balancer',
  'aws.app_lb': 'aws.application_load_balancer',
  'aws.internet-gateway': 'aws.internet_gateway',
  'aws.api-gateway': 'aws.api_gateway',
  'aws.igw': 'aws.internet_gateway',
  'aws.ec2_instance': 'aws.ec2',
  'aws.rds': 'aws.rds_instance',
  // kubernetes icon2 prIcon values are abbreviations; map the natural words
  'k8s.deployment': 'k8s.deploy',
  'k8s.service': 'k8s.svc',
  'k8s.ingress': 'k8s.ing',
  'k8s.statefulset': 'k8s.sts',
  'k8s.daemonset': 'k8s.ds',
  'k8s.replicaset': 'k8s.rs',
  'k8s.namespace': 'k8s.ns',
  'k8s.configmap': 'k8s.cm',
  'k8s.serviceaccount': 'k8s.sa',
  'k8s.endpoint': 'k8s.ep',
  'k8s.scheduler': 'k8s.sched',
  'k8s.volume': 'k8s.vol',
  'cisco.firewall': 'mxgraph.cisco.security.firewall',
  'cisco.ap': 'mxgraph.cisco.misc.access_point',
  'cisco.access-point': 'mxgraph.cisco.misc.access_point'
}

export function resolveIconShape(icon) {
  if (!icon) return null
  if (resolveImageIconStyle(icon)) return null
  const normalizedIcon = ICON_ALIASES[icon] || icon
  for (const [prefix, mxPrefix] of Object.entries(ICON_PREFIXES)) {
    if (normalizedIcon.startsWith(prefix)) return mxPrefix + normalizedIcon.slice(prefix.length)
  }
  if (!/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(normalizedIcon)) {
    console.warn(`[resolveIconShape] Invalid icon name '${normalizedIcon}'. Ignoring.`)
    return null
  }
  return normalizedIcon
}

export function specSyntaxFor(name, param = null, value = null) {
  const parameterized = /^(mxgraph\.kubernetes\.icon2):prIcon=(.+)$/.exec(name)
  if (parameterized) return `k8s.${parameterized[2]}`
  if (name === 'mxgraph.kubernetes.icon2' && param === 'prIcon') return `k8s.${value}`

  for (const [prefix, mxPrefix] of Object.entries(ICON_PREFIXES)) {
    if (prefix === 'mxgraph.' || mxPrefix.includes(':')) continue
    if (name.startsWith(mxPrefix)) return prefix + name.slice(mxPrefix.length)
  }
  return null
}

export { ICON_ALIASES, ICON_PREFIXES }
