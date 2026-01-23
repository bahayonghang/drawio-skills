import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Draw.io Skill for Claude Code',
  description: 'AI-powered diagram creation and editing with real-time browser preview',

  // GitHub Pages base URL (uncomment if deploying to a subdirectory)
  // base: '/drawio-skills/',

  lastUpdated: true,
  cleanUrls: true,

  // Head tags for better SEO and social sharing
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'Draw.io Skill for Claude Code' }],
    ['meta', { property: 'og:site_name', content: 'Draw.io Skill' }],
    ['meta', { property: 'og:url', content: 'https://bahayonghang.github.io/drawio-skills/' }],
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en-US'
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      title: 'Draw.io 技能 - Claude Code',
      description: 'AI 驱动的图表创建与编辑，提供实时浏览器预览'
    }
  },

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/mcp-tools' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'GitHub',
        link: 'https://github.com/bahayonghang/drawio-skills'
      }
    ],

    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Draw.io Skill?', link: '/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' }
          ]
        },
        {
          text: 'Guide',
          items: [
            { text: 'Creating Diagrams', link: '/guide/creating-diagrams' },
            { text: 'Editing Diagrams', link: '/guide/editing-diagrams' },
            { text: 'Export & Save', link: '/guide/export' },
            { text: 'Scientific Workflows', link: '/guide/scientific-workflows' }
          ]
        },
        {
          text: 'API Reference',
          items: [
            { text: 'MCP Tools', link: '/api/mcp-tools' },
            { text: 'XML Format', link: '/api/xml-format' }
          ]
        },
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Flowchart', link: '/examples/flowchart' },
            { text: 'Architecture Diagram', link: '/examples/architecture' }
          ]
        }
      ],
      '/zh/': [
        {
          text: '介绍',
          items: [
            { text: '什么是 Draw.io 技能？', link: '/zh/' },
            { text: '快速开始', link: '/zh/guide/getting-started' },
            { text: '安装', link: '/zh/guide/installation' }
          ]
        },
        {
          text: '使用指南',
          items: [
            { text: '创建图表', link: '/zh/guide/creating-diagrams' },
            { text: '编辑图表', link: '/zh/guide/editing-diagrams' },
            { text: '导出与保存', link: '/zh/guide/export' },
            { text: '科研工作流', link: '/zh/guide/scientific-workflows' }
          ]
        },
        {
          text: 'API 参考',
          items: [
            { text: 'MCP 工具', link: '/zh/api/mcp-tools' },
            { text: 'XML 格式', link: '/zh/api/xml-format' }
          ]
        },
        {
          text: '示例',
          items: [
            { text: '概览', link: '/zh/examples/' },
            { text: '流程图', link: '/zh/examples/flowchart' },
            { text: '架构图', link: '/zh/examples/architecture' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/bahayonghang/drawio-skills' }
    ],

    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright © 2024-present'
    }
  }
})
