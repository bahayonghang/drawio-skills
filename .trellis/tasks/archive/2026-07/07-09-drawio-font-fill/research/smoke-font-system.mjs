import { specToDrawioXml, validateSpec } from '../../../../skills/drawio/scripts/dsl/spec-to-drawio.js'

// Case 1: create flow, academic profile, mixed CJK/Latin labels
const createSpec = {
  meta: { profile: 'academic-paper', figureType: 'architecture', theme: 'academic', title: 'T', description: 'D' },
  modules: [{ id: 'm1', label: '服务接口层' }],
  nodes: [
    { id: 'a', label: '训练服务\n独立子进程 · GPU绑定', type: 'service', module: 'm1' },
    { id: 'b', label: 'Training API', type: 'service', module: 'm1' }
  ],
  edges: [{ from: 'a', to: 'b', label: '操作请求' }]
}
const r1 = specToDrawioXml(createSpec, { returnWarnings: true, silent: true })
const styles = [...r1.xml.matchAll(/style="([^"]+)"/g)].map((m) => m[1])
console.log('--- case1 styles (fontFamily/fontSize fragments) ---')
for (const s of styles) {
  const frags = s.split(';').filter((p) => p.startsWith('fontSize=') || p.startsWith('fontFamily='))
  if (frags.length) console.log(frags.join(' | '))
}
console.log('case1 original spec untouched:', createSpec.nodes[0].style === undefined)

// Case 2: replicate flow, explicit narrow bounds -> class shrink
const shrinkSpec = {
  meta: { profile: 'academic-paper', figureType: 'architecture', theme: 'academic', title: 'T', description: 'D' },
  nodes: [
    { id: 'n1', label: '统一调度层核心组件', type: 'service', bounds: { x: 0, y: 0, width: 180, height: 48 } },
    { id: 'n2', label: '短标签', type: 'service', bounds: { x: 0, y: 100, width: 300, height: 48 } }
  ],
  edges: []
}
const r2 = specToDrawioXml(shrinkSpec, { returnWarnings: true, silent: true })
console.log('--- case2 shrunk sizes ---')
for (const m of r2.xml.matchAll(/fontSize=(\d+)/g)) console.log('fontSize', m[1])

// Case 3: bounds too small even at floor -> overflow warning
const overflowSpec = {
  meta: { profile: 'academic-paper', figureType: 'architecture', theme: 'academic', title: 'T', description: 'D' },
  nodes: [
    {
      id: 'x',
      label: '超长中文标签放不下这个盒子的情况',
      type: 'service',
      bounds: { x: 0, y: 0, width: 90, height: 30 }
    }
  ],
  edges: []
}
const r3 = specToDrawioXml(overflowSpec, { returnWarnings: true, silent: true })
console.log('--- case3 warnings ---')
console.log(
  r3.warnings
    .map((w) => w.message)
    .filter((m) => m.includes('label needs'))
    .join('\n') || 'NO OVERFLOW WARNING'
)

// Case 4: meta.print cn-thesis on a wide canvas -> print warning; no 8-10 warning anywhere
const printSpec = {
  meta: {
    profile: 'academic-paper',
    figureType: 'architecture',
    theme: 'academic',
    title: 'T',
    description: 'D',
    canvas: '1900x900',
    print: { target: 'cn-thesis' }
  },
  modules: [],
  nodes: [{ id: 'p1', label: '节点', type: 'service' }],
  edges: []
}
validateSpec(printSpec)
const r4 = specToDrawioXml(printSpec, { returnWarnings: true, silent: true })
console.log('--- case4 print warnings ---')
console.log(
  r4.warnings
    .map((w) => w.message)
    .filter((m) => m.includes('prints at'))
    .join('\n') || 'NO PRINT WARNING'
)
console.log('8-10 gate gone:', !r4.warnings.some((w) => String(w.message).includes('8-10pt')))

// Case 5: explicit user fontSize survives
const explicitSpec = {
  meta: { theme: 'tech-blue' },
  nodes: [{ id: 'e1', label: '固定字号', type: 'service', style: { fontSize: 9 } }],
  edges: []
}
const r5 = specToDrawioXml(explicitSpec, { returnWarnings: true, silent: true })
console.log('--- case5 explicit fontSize preserved ---')
console.log(/fontSize=9;/.test(r5.xml) ? 'fontSize=9 kept' : 'EXPLICIT OVERRIDE LOST')
