import { defineConfig } from 'vitepress'

const englishNav = [
  { text: 'Start', link: '/guide/getting-started' },
  { text: 'Workflows', link: '/guide/workflows' },
  { text: 'Authoring', link: '/guide/design-system' },
  { text: 'CLI & Delivery', link: '/guide/cli' },
  { text: 'Examples', link: '/examples/' },
  { text: 'GitHub', link: 'https://github.com/bahayonghang/drawio-skills' },
]

const englishSidebar = [
  {
    text: 'Introduction',
    items: [
      { text: 'Overview', link: '/' },
      { text: 'Getting Started', link: '/guide/getting-started' },
      { text: 'Installation', link: '/guide/installation' },
    ],
  },
  {
    text: 'Workflows',
    items: [
      { text: 'Route Overview', link: '/guide/workflows' },
      { text: 'Create', link: '/guide/creating-diagrams' },
      { text: 'Edit and Import', link: '/guide/editing-diagrams' },
      { text: 'Replicate', link: '/guide/scientific-workflows' },
      { text: 'Academic Overlay', link: '/guide/academic-overlay' },
    ],
  },
  {
    text: 'Authoring',
    items: [
      { text: 'Specification', link: '/guide/specification' },
      { text: 'Design System', link: '/guide/design-system' },
      { text: 'Architecture Diagrams', link: '/guide/architecture-diagrams' },
      { text: 'Agent and Memory Diagrams', link: '/guide/agent-diagrams' },
      { text: 'Icons and Stencil Search', link: '/guide/icons-stencils' },
      { text: 'Themes and Presets', link: '/guide/themes-presets' },
      { text: 'Connectors and Edge Quality', link: '/guide/connectors' },
      { text: 'Math Typesetting', link: '/guide/math-typesetting' },
    ],
  },
  {
    text: 'CLI and Delivery',
    items: [
      { text: 'CLI Reference', link: '/guide/cli' },
      { text: 'Export and Artifacts', link: '/guide/export' },
    ],
  },
  {
    text: 'Reference',
    items: [
      { text: 'Optional MCP Tools', link: '/api/mcp-tools' },
      { text: 'XML Format', link: '/api/xml-format' },
      { text: 'SVG Converter', link: '/api/svg-converter' },
    ],
  },
  {
    text: 'Examples',
    items: [
      { text: 'Overview', link: '/examples/' },
      { text: 'Flowchart', link: '/examples/flowchart' },
      { text: 'Architecture Diagram', link: '/examples/architecture' },
      { text: 'YAML Examples', link: '/examples/yaml-examples' },
    ],
  },
]

const chineseNav = [
  { text: '开始', link: '/zh/guide/getting-started' },
  { text: '工作流', link: '/zh/guide/workflows' },
  { text: '图表编写', link: '/zh/guide/design-system' },
  { text: 'CLI 与交付', link: '/zh/guide/cli' },
  { text: '示例', link: '/zh/examples/' },
  { text: 'GitHub', link: 'https://github.com/bahayonghang/drawio-skills' },
]

const chineseSidebar = [
  {
    text: '简介',
    items: [
      { text: '概览', link: '/zh/' },
      { text: '快速开始', link: '/zh/guide/getting-started' },
      { text: '安装', link: '/zh/guide/installation' },
    ],
  },
  {
    text: '工作流',
    items: [
      { text: '路线概览', link: '/zh/guide/workflows' },
      { text: '创建', link: '/zh/guide/creating-diagrams' },
      { text: '编辑与导入', link: '/zh/guide/editing-diagrams' },
      { text: '复刻', link: '/zh/guide/scientific-workflows' },
      { text: '学术出版 Overlay', link: '/zh/guide/academic-overlay' },
    ],
  },
  {
    text: '图表编写',
    items: [
      { text: '规格格式', link: '/zh/guide/specification' },
      { text: '设计系统', link: '/zh/guide/design-system' },
      { text: '架构图', link: '/zh/guide/architecture-diagrams' },
      { text: 'Agent 与记忆图', link: '/zh/guide/agent-diagrams' },
      { text: '图标与 Stencil 搜索', link: '/zh/guide/icons-stencils' },
      { text: '主题与样式预设', link: '/zh/guide/themes-presets' },
      { text: '连接线与边质量', link: '/zh/guide/connectors' },
      { text: '数学公式排版', link: '/zh/guide/math-typesetting' },
    ],
  },
  {
    text: 'CLI 与交付',
    items: [
      { text: 'CLI 参考', link: '/zh/guide/cli' },
      { text: '导出与产物', link: '/zh/guide/export' },
    ],
  },
  {
    text: '参考',
    items: [
      { text: '可选 MCP 工具', link: '/zh/api/mcp-tools' },
      { text: 'XML 格式', link: '/zh/api/xml-format' },
      { text: 'SVG 转换器', link: '/zh/api/svg-converter' },
    ],
  },
  {
    text: '示例',
    items: [
      { text: '概览', link: '/zh/examples/' },
      { text: '流程图', link: '/zh/examples/flowchart' },
      { text: '架构图', link: '/zh/examples/architecture' },
      { text: 'YAML 示例', link: '/zh/examples/yaml-examples' },
    ],
  },
]

export default defineConfig({
  title: 'Draw.io Skill',
  description: 'YAML-first, offline-first draw.io authoring with a publication overlay.',
  base: '/drawio-skills/',
  lastUpdated: true,
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#2563EB' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'Draw.io Skill' }],
    ['meta', { property: 'og:site_name', content: 'Draw.io Skill' }],
    ['meta', { property: 'og:url', content: 'https://bahayonghang.github.io/drawio-skills/' }],
  ],
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      title: 'Draw.io Skill',
      description: 'YAML 优先、离线优先的 draw.io 图表工作流与学术出版 Overlay。',
    },
  },
  themeConfig: {
    locales: {
      root: {
        nav: englishNav,
        sidebar: englishSidebar,
      },
      zh: {
        nav: chineseNav,
        sidebar: chineseSidebar,
      },
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/bahayonghang/drawio-skills' },
    ],
    footer: {
      message: 'Draw.io Skill v2.6.0 documentation.',
      copyright: 'Copyright © 2024-present',
    },
  },
})
