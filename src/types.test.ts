import { describe, it, expect } from 'vitest'
import {
  generateSnippetId,
  generateRuleId,
  toCustomCopySnippet,
  isRuleEqual,
  isSnippetEqual,
  type CustomCopySnippet,
  type CustomCopySnippetContextMenu,
  type URLTransformRule,
} from './types'

describe('generateSnippetId', () => {
  it('should generate a unique ID with correct prefix', () => {
    const id = generateSnippetId()
    expect(id).toMatch(/^custom-copy-\d+-[a-z0-9]+$/)
  })

  it('should generate different IDs on consecutive calls', () => {
    const id1 = generateSnippetId()
    const id2 = generateSnippetId()
    expect(id1).not.toBe(id2)
  })
})

describe('generateRuleId', () => {
  it('should generate a unique ID with correct prefix', () => {
    const id = generateRuleId()
    expect(id).toMatch(/^rule-\d+-[a-z0-9]+$/)
  })

  it('should generate different IDs on consecutive calls', () => {
    const id1 = generateRuleId()
    const id2 = generateRuleId()
    expect(id1).not.toBe(id2)
  })
})

describe('toCustomCopySnippet', () => {
  it('should convert CustomCopySnippetContextMenu to CustomCopySnippet', () => {
    const contextMenuSnippet: CustomCopySnippetContextMenu = {
      id: 'test-id',
      title: 'Test Snippet',
      clipboardText: '${title} - ${url}',
      deleteQuery: true,
      enabledRuleIds: ['rule1', 'rule2'],
      contexts: ['selection'],
    }

    const result = toCustomCopySnippet(contextMenuSnippet)

    expect(result).toEqual({
      id: 'test-id',
      title: 'Test Snippet',
      clipboardText: '${title} - ${url}',
      deleteQuery: true,
      enabledRuleIds: ['rule1', 'rule2'],
      contexts: ['selection'],
    })
  })

  it('should handle optional fields correctly', () => {
    const contextMenuSnippet: CustomCopySnippetContextMenu = {
      id: 'test-id',
      title: 'Simple Snippet',
      clipboardText: '${selectionText}',
    }

    const result = toCustomCopySnippet(contextMenuSnippet)

    expect(result).toEqual({
      id: 'test-id',
      title: 'Simple Snippet',
      clipboardText: '${selectionText}',
      deleteQuery: undefined,
      enabledRuleIds: undefined,
      contexts: undefined,
    })
  })
})

describe('isRuleEqual', () => {
  const baseRule: URLTransformRule = {
    id: 'rule1',
    title: 'Test Rule',
    domain: 'example.com',
    pattern: 'https://',
    replacement: 'http://',
  }

  it('should return true for identical rules', () => {
    const rule1 = { ...baseRule }
    const rule2 = { ...baseRule, id: 'different-id' } // Different ID should not matter
    expect(isRuleEqual(rule1, rule2)).toBe(true)
  })

  it('should return false when title differs', () => {
    const rule1 = { ...baseRule }
    const rule2 = { ...baseRule, title: 'Different Title' }
    expect(isRuleEqual(rule1, rule2)).toBe(false)
  })

  it('should return false when domain differs', () => {
    const rule1 = { ...baseRule }
    const rule2 = { ...baseRule, domain: 'different.com' }
    expect(isRuleEqual(rule1, rule2)).toBe(false)
  })

  it('should return false when pattern differs', () => {
    const rule1 = { ...baseRule }
    const rule2 = { ...baseRule, pattern: 'http://' }
    expect(isRuleEqual(rule1, rule2)).toBe(false)
  })

  it('should return false when replacement differs', () => {
    const rule1 = { ...baseRule }
    const rule2 = { ...baseRule, replacement: 'https://' }
    expect(isRuleEqual(rule1, rule2)).toBe(false)
  })

  it('should handle undefined domain correctly', () => {
    const rule1: URLTransformRule = {
      id: 'rule1',
      title: 'Test Rule',
      pattern: 'https://',
      replacement: 'http://',
    }
    const rule2: URLTransformRule = {
      id: 'rule2',
      title: 'Test Rule',
      pattern: 'https://',
      replacement: 'http://',
    }
    expect(isRuleEqual(rule1, rule2)).toBe(true)
  })
})

describe('isSnippetEqual', () => {
  const baseSnippet: CustomCopySnippet = {
    id: 'snippet1',
    title: 'Test Snippet',
    clipboardText: '[${title}](${url})',
    deleteQuery: true,
    enabledRuleIds: ['rule1', 'rule2'],
    contexts: ['selection'],
  }

  it('should return true for identical snippets', () => {
    const snippet1 = { ...baseSnippet }
    const snippet2 = { ...baseSnippet, id: 'different-id' } // Different ID should not matter
    expect(isSnippetEqual(snippet1, snippet2)).toBe(true)
  })

  it('should return false when title differs', () => {
    const snippet1 = { ...baseSnippet }
    const snippet2 = { ...baseSnippet, title: 'Different Title' }
    expect(isSnippetEqual(snippet1, snippet2)).toBe(false)
  })

  it('should return false when clipboardText differs', () => {
    const snippet1 = { ...baseSnippet }
    const snippet2 = { ...baseSnippet, clipboardText: 'Different text' }
    expect(isSnippetEqual(snippet1, snippet2)).toBe(false)
  })

  it('should return false when deleteQuery differs', () => {
    const snippet1 = { ...baseSnippet }
    const snippet2 = { ...baseSnippet, deleteQuery: false }
    expect(isSnippetEqual(snippet1, snippet2)).toBe(false)
  })

  it('should handle undefined enabledRuleIds', () => {
    const snippet1: CustomCopySnippet = {
      id: 'snippet1',
      title: 'Test',
      clipboardText: 'text',
    }
    const snippet2: CustomCopySnippet = {
      id: 'snippet2',
      title: 'Test',
      clipboardText: 'text',
    }
    expect(isSnippetEqual(snippet1, snippet2)).toBe(true)
  })

  it('should return false when one has enabledRuleIds and other does not', () => {
    const snippet1: CustomCopySnippet = {
      id: 'snippet1',
      title: 'Test',
      clipboardText: 'text',
      enabledRuleIds: ['rule1'],
    }
    const snippet2: CustomCopySnippet = {
      id: 'snippet2',
      title: 'Test',
      clipboardText: 'text',
    }
    expect(isSnippetEqual(snippet1, snippet2)).toBe(false)
  })

  it('should return false when enabledRuleIds have different lengths', () => {
    const snippet1 = { ...baseSnippet }
    const snippet2 = { ...baseSnippet, enabledRuleIds: ['rule1'] }
    expect(isSnippetEqual(snippet1, snippet2)).toBe(false)
  })

  it('should return false when enabledRuleIds have different values', () => {
    const snippet1 = { ...baseSnippet }
    const snippet2 = { ...baseSnippet, enabledRuleIds: ['rule1', 'rule3'] }
    expect(isSnippetEqual(snippet1, snippet2)).toBe(false)
  })

  it('should return false when enabledRuleIds are in different order', () => {
    const snippet1 = { ...baseSnippet, enabledRuleIds: ['rule1', 'rule2'] }
    const snippet2 = { ...baseSnippet, enabledRuleIds: ['rule2', 'rule1'] }
    expect(isSnippetEqual(snippet1, snippet2)).toBe(false)
  })

  it('should handle undefined contexts', () => {
    const snippet1: CustomCopySnippet = {
      id: 'snippet1',
      title: 'Test',
      clipboardText: 'text',
    }
    const snippet2: CustomCopySnippet = {
      id: 'snippet2',
      title: 'Test',
      clipboardText: 'text',
    }
    expect(isSnippetEqual(snippet1, snippet2)).toBe(true)
  })

  it('should return false when one has contexts and other does not', () => {
    const snippet1: CustomCopySnippet = {
      id: 'snippet1',
      title: 'Test',
      clipboardText: 'text',
      contexts: ['selection'],
    }
    const snippet2: CustomCopySnippet = {
      id: 'snippet2',
      title: 'Test',
      clipboardText: 'text',
    }
    expect(isSnippetEqual(snippet1, snippet2)).toBe(false)
  })

  it('should return false when contexts have different lengths', () => {
    const snippet1 = { ...baseSnippet, contexts: ['selection'] }
    const snippet2 = { ...baseSnippet, contexts: ['selection', 'link'] }
    expect(isSnippetEqual(snippet1, snippet2 as CustomCopySnippet)).toBe(false)
  })

  it('should return false when contexts have different values', () => {
    const snippet1 = { ...baseSnippet, contexts: ['selection'] }
    const snippet2 = { ...baseSnippet, contexts: ['link'] }
    expect(isSnippetEqual(snippet1, snippet2 as CustomCopySnippet)).toBe(false)
  })
})
