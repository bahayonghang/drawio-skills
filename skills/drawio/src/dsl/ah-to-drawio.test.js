import assert from 'node:assert/strict'
import test from 'node:test'
import { ahToDrawioXml } from './ah-to-drawio.js'

test('ahToDrawioXml emits numeric mxCell ids and numeric edge references', () => {
  const input =
    'A 总体布局：16:9；左→右\n' +
    'B 模块设置：\n' +
    '模块1：计算\n' +
    '模块2：评估\n' +
    'C 节点清单：\n' +
    '模块1-步骤1\n' +
    'ID: N1\n' +
    'Label: 线性模型 \\(y=Wx+b\\)\n' +
    '模块2-步骤1\n' +
    'ID: N2\n' +
    'Label: $$\\mathcal{L}=\\sum_i (y_i-\\hat y_i)^2$$\n' +
    'D 连线关系：\n' +
    'N1→N2；关系：因果；线型：实线箭头\n'

  const xml = ahToDrawioXml(input)

  const ids = [...xml.matchAll(/<mxCell id="([^"]+)"/g)].map((m) => m[1])
  assert.ok(ids.length > 0)
  assert.deepEqual(
    ids.filter((id) => !/^\d+$/.test(id)),
    [],
    'all mxCell ids should be numeric'
  )

  const edgeRefs = [...xml.matchAll(/source="([^"]+)" target="([^"]+)"/g)].flatMap((m) => [
    m[1],
    m[2]
  ])
  assert.ok(edgeRefs.length > 0)
  assert.deepEqual(
    edgeRefs.filter((v) => !/^\d+$/.test(v)),
    [],
    'edge source/target should be numeric'
  )

  assert.match(xml, /data-id="N1"/)
  assert.match(xml, /data-id="N2"/)
})
