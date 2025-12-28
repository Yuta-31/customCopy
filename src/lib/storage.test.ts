// 

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { storage } from './storage'
import type { StorageKey } from '@/types'

// Mock the logger module
vi.mock('@/lib/logger', () => ({
  storageLogger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Storage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
    
    // Reset chrome.runtime.lastError
    if (global.chrome && global.chrome.runtime) {
      global.chrome.runtime.lastError = undefined
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('get', () => {
    it('should retrieve value from storage', async () => {
      const testKey: StorageKey = 'contextMenus'
      const testValue = [{ id: '1', title: 'Test' }]

      vi.mocked(chrome.storage.sync.get).mockImplementation((keys: string[], callback: (items: { [key: string]: unknown }) => void) => {
        callback({ [testKey]: testValue })
      })

      const result = await storage.get(testKey)
      expect(result).toEqual(testValue)
      expect(chrome.storage.sync.get).toHaveBeenCalledWith([testKey], expect.any(Function))
    })

    it('should handle storage errors', async () => {
      const testKey: StorageKey = 'contextMenus'
      const testError = new Error('Storage error')

      vi.mocked(chrome.storage.sync.get).mockImplementation((keys: string[], callback: (items: { [key: string]: unknown }) => void) => {
        chrome.runtime.lastError = testError as chrome.runtime.LastError
        callback({})
      })

      await expect(storage.get(testKey)).rejects.toThrow()
    })

    it('should handle exceptions during get', async () => {
      const testKey: StorageKey = 'contextMenus'

      vi.mocked(chrome.storage.sync.get).mockImplementation(() => {
        throw new Error('Exception during get')
      })

      await expect(storage.get(testKey)).rejects.toThrow('Exception during get')
    })

    it('should return undefined for non-existent key', async () => {
      const testKey: StorageKey = 'contextMenus'

      vi.mocked(chrome.storage.sync.get).mockImplementation((keys: string[], callback: (items: { [key: string]: unknown }) => void) => {
        callback({})
      })

      const result = await storage.get(testKey)
      expect(result).toBeUndefined()
    })
  })

  describe('set', () => {
    it('should save value to storage', async () => {
      const testKey: StorageKey = 'contextMenus'
      const testValue = [{ id: '1', title: 'Test' }]

      vi.mocked(chrome.storage.sync.set).mockImplementation((items: { [key: string]: unknown }, callback: () => void) => {
        callback()
      })

      await storage.set(testKey, testValue)
      expect(chrome.storage.sync.set).toHaveBeenCalledWith(
        { [testKey]: testValue },
        expect.any(Function)
      )
    })

    it('should handle storage errors during set', async () => {
      const testKey: StorageKey = 'contextMenus'
      const testValue = [{ id: '1', title: 'Test' }]
      const testError = new Error('Storage quota exceeded')

      vi.mocked(chrome.storage.sync.set).mockImplementation((items: { [key: string]: unknown }, callback: () => void) => {
        chrome.runtime.lastError = testError as chrome.runtime.LastError
        callback()
      })

      await expect(storage.set(testKey, testValue)).rejects.toThrow()
    })

    it('should handle exceptions during set', async () => {
      const testKey: StorageKey = 'contextMenus'
      const testValue = [{ id: '1', title: 'Test' }]

      vi.mocked(chrome.storage.sync.set).mockImplementation(() => {
        throw new Error('Exception during set')
      })

      await expect(storage.set(testKey, testValue)).rejects.toThrow('Exception during set')
    })
  })

  describe('remove', () => {
    it('should remove single key from storage', async () => {
      const testKey = 'contextMenus'

      vi.mocked(chrome.storage.sync.remove).mockImplementation((key: string | string[], callback: () => void) => {
        callback()
      })

      await storage.remove(testKey)
      expect(chrome.storage.sync.remove).toHaveBeenCalledWith(testKey, expect.any(Function))
    })

    it('should remove multiple keys from storage', async () => {
      const testKeys = ['contextMenus', 'transformRules']

      vi.mocked(chrome.storage.sync.remove).mockImplementation((keys: string | string[], callback: () => void) => {
        callback()
      })

      await storage.remove(testKeys)
      expect(chrome.storage.sync.remove).toHaveBeenCalledWith(testKeys, expect.any(Function))
    })

    it('should handle storage errors during remove', async () => {
      const testKey = 'contextMenus'
      const testError = new Error('Storage error')

      vi.mocked(chrome.storage.sync.remove).mockImplementation((key: string | string[], callback: () => void) => {
        chrome.runtime.lastError = testError as chrome.runtime.LastError
        callback()
      })

      await expect(storage.remove(testKey)).rejects.toThrow()
    })

    it('should handle exceptions during remove', async () => {
      const testKey = 'contextMenus'

      vi.mocked(chrome.storage.sync.remove).mockImplementation(() => {
        throw new Error('Exception during remove')
      })

      await expect(storage.remove(testKey)).rejects.toThrow('Exception during remove')
    })
  })

  describe('watch', () => {
    it('should watch storage changes', () => {
      const testKey: StorageKey = 'contextMenus'
      const callback = vi.fn()

      const unwatch = storage.watch(testKey, callback)

      expect(chrome.storage.onChanged.addListener).toHaveBeenCalled()
      expect(typeof unwatch).toBe('function')
    })

    it('should invoke callback on storage change', () => {
      const testKey: StorageKey = 'contextMenus'
      const testValue = [{ id: '1', title: 'Updated' }]
      const callback = vi.fn()

      let storageListener: ((changes: { [key: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => void) | null = null
      vi.mocked(chrome.storage.onChanged.addListener).mockImplementation((listener: (changes: { [key: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => void) => {
        storageListener = listener
      })

      storage.watch(testKey, callback)

      // Simulate storage change
      const changes = {
        [testKey]: {
          newValue: testValue,
          oldValue: null,
        },
      }
      storageListener?.(changes, 'sync')

      expect(callback).toHaveBeenCalledWith(testValue)
    })

    it('should not invoke callback for different key', () => {
      const testKey: StorageKey = 'contextMenus'
      const callback = vi.fn()

      let storageListener: ((changes: { [key: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => void) | null = null
      vi.mocked(chrome.storage.onChanged.addListener).mockImplementation((listener: (changes: { [key: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => void) => {
        storageListener = listener
      })

      storage.watch(testKey, callback)

      // Simulate storage change for different key
      const changes = {
        differentKey: {
          newValue: 'value',
          oldValue: null,
        },
      }
      storageListener?.(changes, 'sync')

      expect(callback).not.toHaveBeenCalled()
    })

    it('should not invoke callback for non-sync area', () => {
      const testKey: StorageKey = 'contextMenus'
      const testValue = [{ id: '1', title: 'Updated' }]
      const callback = vi.fn()

      let storageListener: ((changes: { [key: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => void) | null = null
      vi.mocked(chrome.storage.onChanged.addListener).mockImplementation((listener: (changes: { [key: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => void) => {
        storageListener = listener
      })

      storage.watch(testKey, callback)

      // Simulate storage change in local area (not sync)
      const changes = {
        [testKey]: {
          newValue: testValue,
          oldValue: null,
        },
      }
      storageListener?.(changes, 'local')

      expect(callback).not.toHaveBeenCalled()
    })

    it('should invoke callback with null when value is removed', () => {
      const testKey: StorageKey = 'contextMenus'
      const callback = vi.fn()

      let storageListener: ((changes: { [key: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => void) | null = null
      vi.mocked(chrome.storage.onChanged.addListener).mockImplementation((listener: (changes: { [key: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => void) => {
        storageListener = listener
      })

      storage.watch(testKey, callback)

      // Simulate storage removal
      const changes = {
        [testKey]: {
          newValue: undefined,
          oldValue: ['old value'],
        },
      }
      storageListener?.(changes, 'sync')

      expect(callback).toHaveBeenCalledWith(null)
    })

    it('should unsubscribe from storage changes', () => {
      const testKey: StorageKey = 'contextMenus'
      const callback = vi.fn()

      const unwatch = storage.watch(testKey, callback)
      unwatch()

      expect(chrome.storage.onChanged.removeListener).toHaveBeenCalled()
    })
  })
})
