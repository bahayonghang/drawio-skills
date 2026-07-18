import test from 'node:test'
import assert from 'node:assert/strict'

import { parseCiWorkflow } from './ci.js'

test('parseCiWorkflow uses GitHub workflow path and job keys for identity', () => {
  const source = `
name: Display name
on: [push]
jobs:
  build: { runs-on: ubuntu-latest, steps: [] }
  test: { name: Mutable label, needs: build, runs-on: ubuntu-latest, steps: [] }
`
  const first = parseCiWorkflow(source, {
    provider: 'github-actions',
    workflow: '.github/workflows/ci.yml'
  })
  const second = parseCiWorkflow(source.replace('Mutable label', 'Renamed'), {
    provider: 'github-actions',
    workflow: '.github/workflows/ci.yml'
  })

  assert.deepEqual(first.nodes.map((node) => node.identity), second.nodes.map((node) => node.identity))
  assert.equal(first.edges[0].relation, 'needs')
})

test('parseCiWorkflow supports GitLab jobs and stage modules', () => {
  const source = `
stages: [build, test]
build-job: { stage: build, script: echo build }
test-job: { stage: test, needs: [build-job], script: echo test }
`
  const projection = parseCiWorkflow(source, {
    provider: 'gitlab-ci',
    workflow: '.gitlab-ci.yml'
  })

  assert.equal(projection.nodes.length, 2)
  assert.equal(projection.modules.length, 2)
  assert.equal(projection.edges[0].relation, 'needs')
})
