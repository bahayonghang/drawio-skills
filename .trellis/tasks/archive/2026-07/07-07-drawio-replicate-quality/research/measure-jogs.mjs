// Measure absolute exit/entry misalignment (jogs) of bound edges in a .drawio file.
import fs from 'node:fs'

const xml = fs.readFileSync(process.argv[2], 'utf8')
const attr = (s, k) => {
  const m = new RegExp(k + '="([^"]*)"').exec(s)
  return m ? m[1] : undefined
}

const verts = new Map()
const pairRe = /<mxCell ([^>]*vertex="1"[^>]*)><mxGeometry ([^>]*)\/>/g
let m
while ((m = pairRe.exec(xml))) {
  const a = m[1]
  const g = m[2]
  verts.set(attr(a, 'id'), {
    x: +(attr(g, 'x') ?? 0),
    y: +(attr(g, 'y') ?? 0),
    w: +(attr(g, 'width') ?? 0),
    h: +(attr(g, 'height') ?? 0),
    parent: attr(a, 'parent'),
    label: (attr(a, 'value') || '').replace(/&#?\w+;/g, '').slice(0, 10)
  })
}
const abs = (id) => {
  const v = verts.get(id)
  if (!v) return null
  let { x, y } = v
  let p = v.parent
  while (p && p !== '1' && verts.has(p)) {
    x += verts.get(p).x
    y += verts.get(p).y
    p = verts.get(p).parent
  }
  return { x, y, w: v.w, h: v.h, label: v.label }
}

const edgeRe = /<mxCell ([^>]*edge="1"[^>]*)>/g
let jogs = 0
const lines = []
while ((m = edgeRe.exec(xml))) {
  const a = m[1]
  const style = attr(a, 'style') || ''
  const sv = abs(attr(a, 'source'))
  const tv = abs(attr(a, 'target'))
  if (!sv || !tv) continue
  const get = (k) => {
    const mm = new RegExp(k + '=(-?[0-9.]+)').exec(style)
    return mm ? +mm[1] : undefined
  }
  const exitX = get('exitX')
  const exitY = get('exitY')
  const entryX = get('entryX')
  const entryY = get('entryY')
  if (exitX === undefined || entryX === undefined) {
    lines.push(`${sv.label}->${tv.label}: waypoints/no explicit cp`)
    continue
  }
  const absExitX = sv.x + exitX * sv.w
  const absExitY = sv.y + exitY * sv.h
  const absEntryX = tv.x + entryX * tv.w
  const absEntryY = tv.y + entryY * tv.h
  const vertical = exitY === 0 || exitY === 1
  const delta = vertical ? Math.abs(absExitX - absEntryX) : Math.abs(absExitY - absEntryY)
  if (delta > 0.5) jogs++
  lines.push(
    `${sv.label}->${tv.label} ${vertical ? 'V' : 'H'} delta=${Math.round(delta)}px exit(${Math.round(absExitX)},${Math.round(absExitY)}) entry(${Math.round(absEntryX)},${Math.round(absEntryY)})`
  )
}
console.log(lines.join('\n'))
console.log('---')
console.log('edges with jog (delta>0.5px):', jogs)
