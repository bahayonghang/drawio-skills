import assert from 'node:assert/strict'
import test from 'node:test'
import { ahToDrawioXml } from './ah-to-drawio.js'

const MINIMAL_INPUT =
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

test('ahToDrawioXml emits numeric mxCell ids and numeric edge references', () => {
  const xml = ahToDrawioXml(MINIMAL_INPUT)

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

test('ahToDrawioXml uses gridSize=8 by default', () => {
  const xml = ahToDrawioXml(MINIMAL_INPUT)
  assert.match(xml, /gridSize="8"/, 'gridSize should be 8 (Design System grid)')
})

test('ahToDrawioXml applies theme colors when theme is passed', () => {
  const customTheme = {
    node: {
      default: {
        fillColor: '#FF0000',
        strokeColor: '#00FF00',
        fontColor: '#0000FF',
        fontSize: 13
      }
    },
    module: {
      fillColor: '#AABBCC',
      strokeColor: '#112233',
      labelFontColor: '#334455',
      labelFontSize: 11
    },
    connector: {
      primary: { strokeColor: '#CCCCCC', strokeWidth: 1 },
      data: { strokeColor: '#DDDDDD', strokeWidth: 1, dashPattern: '4 2' }
    },
    canvas: { gridSize: 8 }
  }

  const xml = ahToDrawioXml(MINIMAL_INPUT, { theme: customTheme })

  assert.match(xml, /fillColor=#FF0000/, 'node fill should come from theme')
  assert.match(xml, /strokeColor=#00FF00/, 'node stroke should come from theme')
  assert.match(xml, /fontColor=#0000FF/, 'node font color should come from theme')
  assert.match(xml, /fillColor=#AABBCC/, 'container fill should come from theme')
})
