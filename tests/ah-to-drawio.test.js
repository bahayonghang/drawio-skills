import test from 'node:test'
import assert from 'node:assert/strict'

import { ahToDrawioXml } from '../skills/drawio/src/dsl/ah-to-drawio.js'

test('ahToDrawioXml generates draw.io XML with nodes, edges, and math enabled', () => {
  const ah = `
A 总体布局：画布比例16:9；主流程方向左→右
B 模块设置：
模块1：计算
模块2：评估
C 节点清单：
模块1-步骤1
ID: N1
Label: 线性模型 \\(y=Wx+b\\)
模块1-步骤2
ID: N2
Label: 特征 \\(x \\in \\mathbb{R}^d\\)
模块2-步骤1
ID: N3
Label: $$\\mathcal{L}=\\sum_i (y_i-\\hat y_i)^2$$
D 连线关系：
N2→N1；关系：因果；线型：实线箭头
N1→N3；关系：因果；线型：虚线箭头
E 分组与阶段：未提及
F 方法与标签：未提及
G 视觉规范：未提及
H 导出建议：drawio
  `.trim()

  const xml = ahToDrawioXml(ah)
  assert.match(xml, /^<mxGraphModel/)
  assert.match(xml, /math="1"/)
  assert.match(xml, /data-id="N1"/)
  assert.match(xml, /data-id="N2"/)
  assert.match(xml, /data-id="N3"/)
  assert.match(xml, /data-id="edge_N2_N1"/)
  assert.match(xml, /data-id="edge_N1_N3"/)
  assert.match(xml, /dashed=1/)
})

test('ahToDrawioXml rejects unbalanced math delimiters', () => {
  const ah = `
A 总体布局：画布比例16:9
B 模块设置：
模块1：计算
C 节点清单：
模块1-步骤1
ID: N1
Label: \\(y=Wx+b
D 连线关系：
E 分组与阶段：未提及
F 方法与标签：未提及
G 视觉规范：未提及
H 导出建议：drawio
  `.trim()

  assert.throws(() => ahToDrawioXml(ah), /Unbalanced LaTeX inline delimiters/)
})
