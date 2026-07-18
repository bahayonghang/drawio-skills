import test from 'node:test'
import assert from 'node:assert/strict'

import { resolveImageIconStyle } from './icon-resolver.js'
import { loadAiIconCatalog } from './ai-icon-catalog.js'

test('AI icon resolver preserves full-name compatibility before exact and slug aliases', () => {
  const openai = resolveImageIconStyle('lobe.openai')
  for (const identifier of [
    'brand.openai',
    'openai',
    'lobe.chatgpt',
    'ai.chatgpt',
    'lobe.open-ai',
    'ai.open-ai',
    'lobe.open_ai',
    'ai.open_ai'
  ]) {
    assert.equal(resolveImageIconStyle(identifier), openai, identifier)
  }

  assert.equal(resolveImageIconStyle('ai.anthropic'), resolveImageIconStyle('lobe.claude'))
  assert.notEqual(resolveImageIconStyle('lobe.anthropic'), resolveImageIconStyle('ai.anthropic'))
})

test('AI icon resolver exposes the full offline catalog without changing Redis or Lucide', () => {
  for (const identifier of ['lobe.mistral', 'ai.deepseek', 'lobe.cybercut', 'ai.antigravity']) {
    const style = resolveImageIconStyle(identifier)
    assert.match(style, /^shape=image;.*image=data:image\/svg\+xml,/)
    assert.doesNotMatch(style, /https?:\/\//)
  }
  assert.match(resolveImageIconStyle('brand.redis'), /data:image\/svg\+xml,/)
  assert.match(resolveImageIconStyle('lucide.bot'), /data:image\/svg\+xml,/)
  assert.equal(resolveImageIconStyle('lobe.definitely-not-real'), null)
})

test('all 309 canonical slugs resolve in both namespaces with the documented exception', () => {
  const claude = resolveImageIconStyle('lobe.claude')
  for (const { slug } of loadAiIconCatalog().icons) {
    const lobe = resolveImageIconStyle(`lobe.${slug}`)
    const ai = resolveImageIconStyle(`ai.${slug}`)
    assert.match(lobe, /^shape=image;.*image=data:image\/svg\+xml,/, `lobe.${slug}`)
    assert.doesNotMatch(lobe, /https?:\/\//, `lobe.${slug}`)
    assert.equal(ai, slug === 'anthropic' ? claude : lobe, `ai.${slug}`)
  }
})

test('Redis, Lucide, and ordinary icons do not consult the AI catalog', () => {
  let lookups = 0
  const options = {
    lookupAiIcon: () => {
      lookups++
      throw new Error('unexpected AI catalog lookup')
    }
  }
  assert.match(resolveImageIconStyle('brand.redis', options), /data:image\/svg\+xml,/)
  assert.match(resolveImageIconStyle('lucide.bot', options), /data:image\/svg\+xml,/)
  assert.equal(resolveImageIconStyle('customShape', options), null)
  assert.equal(lookups, 0)
  assert.throws(() => resolveImageIconStyle('lobe.openai', options), /unexpected AI catalog lookup/)
  assert.equal(lookups, 1)
})
