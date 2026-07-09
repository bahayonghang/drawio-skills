# -*- coding: utf-8 -*-
# Patch 2: vertical fit allowance + test updates + new font-system tests
import io

# ---------- spec-to-drawio.js: vertical allowance +4 ----------
path = "skills/drawio/scripts/dsl/spec-to-drawio.js"
src = io.open(path, encoding="utf-8", newline="").read()


def rep(text, old, new, count=1):
    found = text.count(old)
    assert found == count, "expected %d occurrence(s), found %d: %r" % (
        count,
        found,
        old[:90],
    )
    return text.replace(old, new)


src = rep(
    src,
    "  const heightFit = (bounds.height - 8) / (lines.length * 1.4)",
    "  const heightFit = (bounds.height - 4) / (lines.length * 1.4)",
)

src = rep(
    src,
    """    const fontSize = node.style?.fontSize ?? FONT_LADDER.node
    const extent = measureLabelExtent(node.label, fontSize, 8)
    if (extent.width > bounds.width || extent.height > bounds.height) {
      warnings.push(
        `Node "${node.id}" label needs ~${extent.width}x${extent.height}px at fontSize ${fontSize} but bounds are ` +
          `${bounds.width}x${bounds.height}. Widen the box, shorten the label, or lower style.fontSize.`
      )
    }""",
    """    const fontSize = node.style?.fontSize ?? FONT_LADDER.node
    const extent = measureLabelExtent(node.label, fontSize, 0)
    const neededWidth = extent.width + 8
    const neededHeight = extent.height + 4
    if (neededWidth > bounds.width || neededHeight > bounds.height) {
      warnings.push(
        `Node "${node.id}" label needs ~${neededWidth}x${neededHeight}px at fontSize ${fontSize} but bounds are ` +
          `${bounds.width}x${bounds.height}. Widen the box, shorten the label, or lower style.fontSize.`
      )
    }""",
)

io.open(path, "w", encoding="utf-8", newline="").write(src)
print("spec-to-drawio.js allowance patched OK")

# ---------- spec-to-drawio.test.js updates ----------
tpath = "skills/drawio/scripts/dsl/spec-to-drawio.test.js"
tsrc = io.open(tpath, encoding="utf-8", newline="").read()

# Content-aware growth changes the grown width of the position-centered node.
tsrc = rep(
    tsrc,
    "    assert.strictEqual(pos.x, 40, 'x should be snapped to 40 (center - width/2)')",
    "    assert.strictEqual(pos.x, 24, 'x should be snapped to 24 (center - grown width/2)')",
)

tsrc = rep(
    tsrc,
    """  it('should use Simsun fallback only for academic-paper Chinese text when meta.font is absent', () => {
    const spec = {
      meta: {
        theme: 'academic',
        title: 'Test Figure',
        description: 'Test description',
        figureType: 'architecture'
      },
      modules: [{ id: 'm1', label: '中文模块' }],
      nodes: [
        { id: 'n1', label: '中文标签', module: 'm1' },
        { id: 'n2', label: 'English Label' }
      ],
      edges: [{ from: 'n1', to: 'n2', label: '中文连线' }]
    }

    const xml = specToDrawioXml(spec)
    assert.ok(xml.includes('fontFamily=Simsun'), 'academic Chinese surfaces should fall back to Simsun')
    assert.ok(xml.includes('fontFamily=Times New Roman'), 'non-CJK academic surfaces should still use Times New Roman')
  })""",
    """  it('should fall back to a Times New Roman + SimSun stack for Chinese text when meta.font is absent', () => {
    const spec = {
      meta: {
        theme: 'academic',
        title: 'Test Figure',
        description: 'Test description',
        figureType: 'architecture'
      },
      modules: [{ id: 'm1', label: '中文模块' }],
      nodes: [
        { id: 'n1', label: '中文标签', module: 'm1' },
        { id: 'n2', label: 'English Label' }
      ],
      edges: [{ from: 'n1', to: 'n2', label: '中文连线' }]
    }

    const xml = specToDrawioXml(spec)
    assert.ok(
      xml.includes('fontFamily=Times New Roman, SimSun'),
      'academic Chinese surfaces should use the theme Times New Roman + SimSun stack'
    )
    assert.ok(
      xml.includes('fontFamily=Times New Roman, Georgia, serif'),
      'non-CJK academic surfaces should keep the theme serif stack'
    )

    const generalXml = specToDrawioXml({
      meta: { theme: 'tech-blue' },
      nodes: [{ id: 'n1', label: '中文标签' }],
      edges: []
    })
    assert.ok(
      generalXml.includes('fontFamily=Times New Roman,SimSun'),
      'general-profile Chinese text should use the built-in Times New Roman,SimSun policy'
    )
  })""",
)

# ---------- new font-system test group ----------
tsrc += """
// ============================================================================
// Font ladder, content-aware sizing, class shrink, and print gate
// ============================================================================

describe('font ladder and fit system', () => {
  const academicMeta = {
    profile: 'academic-paper',
    figureType: 'architecture',
    theme: 'academic',
    title: 'T',
    description: 'D'
  }

  it('materializes the ladder (module 22 / node 20 / edge 18) and keeps author YAML untouched', () => {
    const spec = {
      meta: { ...academicMeta },
      modules: [{ id: 'm1', label: '服务接口层' }],
      nodes: [
        { id: 'a', label: '训练服务\\n独立子进程 · GPU绑定', type: 'service', module: 'm1' },
        { id: 'b', label: 'Training API', type: 'service', module: 'm1' }
      ],
      edges: [{ from: 'a', to: 'b', label: '操作请求' }]
    }
    const xml = specToDrawioXml(spec, { silent: true })
    assert.ok(xml.includes('fontSize=22'), 'module titles should use the 22px ladder value')
    assert.ok(xml.includes('fontSize=20'), 'node labels should use the 20px ladder value')
    assert.ok(xml.includes('fontSize=18'), 'edge labels should use the 18px ladder value')
    assert.strictEqual(spec.nodes[0].style, undefined, 'font planning must not mutate the author spec')
  })

  it('grows preset boxes to fit long labels only in content-aware mode', () => {
    const label = 'APScheduler 单实例（周期触发 · 任务登记 · 作业库持久化）'
    const grown = getNodeSize(null, 'service', label, { contentAware: true, fontSize: 20 })
    assert.ok(grown.width > 400, `long CJK label should grow the box, got ${grown.width}`)
    const legacy = getNodeSize(null, 'service', label)
    assert.deepStrictEqual(legacy, { width: 120, height: 60 }, 'without options the preset is unchanged')
    const operator = getNodeSize(null, 'operator', 'max', { contentAware: true, fontSize: 20 })
    assert.deepStrictEqual(operator, { width: 32, height: 32 }, 'operators keep their size-coded preset')
  })

  it('shrinks a class uniformly to the tightest explicit bounds', () => {
    const spec = {
      meta: { ...academicMeta },
      nodes: [
        { id: 'n1', label: '统一调度层核心组件', type: 'service', bounds: { x: 0, y: 0, width: 180, height: 48 } },
        { id: 'n2', label: '短标签', type: 'service', bounds: { x: 0, y: 100, width: 300, height: 48 } }
      ],
      edges: []
    }
    const xml = specToDrawioXml(spec, { silent: true })
    const sizes = [...xml.matchAll(/fontSize=(\\d+)/g)].map((m) => Number(m[1]))
    assert.deepStrictEqual(sizes, [18, 18], 'both class members should share the shrunk size')
  })

  it('clamps the shrink at the floor and reports the leftover overflow', () => {
    const spec = {
      meta: { ...academicMeta },
      nodes: [
        { id: 'x', label: '超长中文标签放不下这个盒子的情况', type: 'service', bounds: { x: 0, y: 0, width: 90, height: 30 } }
      ],
      edges: []
    }
    const { xml, warnings } = specToDrawioXml(spec, { returnWarnings: true, silent: true })
    assert.ok(xml.includes('fontSize=12'), 'shrink should stop at the 12px floor')
    assert.ok(
      warnings.some((w) => String(w.message).includes('label needs')),
      'validateLabelFit should report the overflow left at the floor'
    )
  })

  it('keeps explicit style.fontSize overrides on nodes and edges', () => {
    const spec = {
      meta: { theme: 'tech-blue' },
      nodes: [
        { id: 'e1', label: '固定字号', type: 'service', style: { fontSize: 9 } },
        { id: 'e2', label: 'B', type: 'service' }
      ],
      edges: [{ from: 'e1', to: 'e2', label: 'flow', style: { fontSize: 10 } }]
    }
    const xml = specToDrawioXml(spec, { silent: true })
    assert.ok(xml.includes('fontSize=9;'), 'node override should survive font planning')
    assert.ok(xml.includes('fontSize=10;'), 'edge override should survive font planning')
  })

  it('meta.print drives the print-readability warning', () => {
    const spec = {
      meta: { ...academicMeta, canvas: '1900x900', print: { target: 'cn-thesis' } },
      modules: [],
      nodes: [{ id: 'p1', label: '节点', type: 'service' }],
      edges: []
    }
    const { warnings } = specToDrawioXml(spec, { returnWarnings: true, silent: true })
    const printWarning = warnings.map((w) => String(w.message)).find((m) => m.includes('prints at'))
    assert.ok(printWarning, 'wide canvas with cn-thesis target should warn')
    assert.ok(printWarning.includes('440'), 'warning should use the cn-thesis 440pt width')
    assert.ok(printWarning.includes('9pt floor'), 'warning should use the cn-thesis 9pt floor')
  })

  it('validates meta.print shape', () => {
    const base = { nodes: [{ id: 'n1', label: 'Note' }], edges: [], modules: [] }
    assert.throws(
      () => validateSpec({ ...base, meta: { print: { target: 'a4' } } }),
      /Invalid meta\\.print\\.target/
    )
    assert.throws(
      () => validateSpec({ ...base, meta: { print: { target: 'cn-thesis', widthPt: -1 } } }),
      /meta\\.print\\.widthPt must be a positive number/
    )
    assert.throws(() => validateSpec({ ...base, meta: { print: {} } }), /meta\\.print requires target or widthPt/)
  })

  it('no longer warns about 8-10pt labels on the academic profile', () => {
    const spec = {
      meta: { ...academicMeta },
      modules: [],
      nodes: [{ id: 'n1', label: 'Node', type: 'service', style: { fontSize: 20 } }],
      edges: []
    }
    const { warnings } = specToDrawioXml(spec, { returnWarnings: true, silent: true })
    assert.ok(
      warnings.every((w) => !String(w.message).includes('8-10pt')),
      'the misleading 8-10pt gate should be gone'
    )
  })
})
"""

io.open(tpath, "w", encoding="utf-8", newline="").write(tsrc)
print("spec-to-drawio.test.js patched OK")
