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
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('get', () => {
    it('should retrieve value from storage', async () => {
      const testKey: StorageKey = 'contextMenus'
      const testValue = [{ id: '1', title: 'Test' }]

      vi.mocked(chrome.storage.local.get).mockImplementation((keys, callback) => {
        callback({ [testKey]: testValue })
      })

      const result = await storage.get(testKey)
      expect(result).toEqual(testValue)
      expect(chrome.storage.local.get).toHaveBeenCalledWith([testKey], expect.any(Function))
    })

    it('should handle storage errors', async () => {
      const testKey: StorageKey = 'contextMenus'
      const testError = { message: 'Storage error' }

      vi.mocked(chrome.storage.local.get).mockImplementation((keys, callback) => {
        // Simulate lastError by making it available in the callback
        Object.defineProperty(chrome.runtime, 'lastError', {
          get: () => testError,
          configurable: true,
        })
        callback({})
      })

      await expect(storage.get(testKey)).rejects.toEqual(testError)
      
      // Clean up
      Object.defineProperty(chrome.runtime, 'lastError', {
        get: () => undefined,
        configurable: true,
      })
    })

    it('should handle exceptions during get', async () => {
      const testKey: StorageKey = 'contextMenus'

      vi.mocked(chrome.storage.local.get).mockImplementation(() => {
        throw new Error('Exception during get')
      })

      await expect(storage.get(testKey)).rejects.toThrow('Exception during get')
    })

    it('should return undefined for non-existent key', async () => {
      const testKey: StorageKey = 'contextMenus'

      vi.mocked(chrome.storage.local.get).mockImplementation((keys, callback) => {
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

      vi.mocked(chrome.storage.local.set).mockImplementation((items, callback) => {
        callback()
      })

      await storage.set(testKey, testValue)
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        { [testKey]: testValue },
        expect.any(Function)
      )
    })

    it('should handle storage errors during set', async () => {
      const testKey: StorageKey = 'contextMenus'
      const testValue = [{ id: '1', title: 'Test' }]
      const testError = { message: 'Storage quota exceeded' }

      vi.mocked(chrome.storage.local.set).mockImplementation((items, callback) => {
        Object.defineProperty(chrome.runtime, 'lastError', {
          get: () => testError,
          configurable: true,
        })
        callback()
      })

      await expect(storage.set(testKey, testValue)).rejects.toEqual(testError)
      
      // Clean up
      Object.defineProperty(chrome.runtime, 'lastError', {
        get: () => undefined,
        configurable: true,
      })
    })

    it('should handle exceptions during set', async () => {
      const testKey: StorageKey = 'contextMenus'
      const testValue = [{ id: '1', title: 'Test' }]

      vi.mocked(chrome.storage.local.set).mockImplementation(() => {
        throw new Error('Exception during set')
      })

      await expect(storage.set(testKey, testValue)).rejects.toThrow('Exception during set')
    })
  })

  describe('remove', () => {
    it('should remove single key from storage', async () => {
      const testKey = 'contextMenus'

      vi.mocked(chrome.storage.local.remove).mockImplementation((key, callback) => {
        callback()
      })

      await storage.remove(testKey)
      expect(chrome.storage.local.remove).toHaveBeenCalledWith(testKey, expect.any(Function))
    })

    it('should remove multiple keys from storage', async () => {
      const testKeys = ['contextMenus', 'transformRules']

      vi.mocked(chrome.storage.local.remove).mockImplementation((keys, callback) => {
        callback()
      })

      await storage.remove(testKeys)
      expect(chrome.storage.local.remove).toHaveBeenCalledWith(testKeys, expect.any(Function))
    })

    it('should handle storage errors during remove', async () => {
      const testKey = 'contextMenus'
      const testError = { message: 'Storage error' }

      vi.mocked(chrome.storage.local.remove).mockImplementation((key, callback) => {
        Object.defineProperty(chrome.runtime, 'lastError', {
          get: () => testError,
          configurable: true,
        })
        callback()
      })

      await expect(storage.remove(testKey)).rejects.toEqual(testError)
      
      // Clean up
      Object.defineProperty(chrome.runtime, 'lastError', {
        get: () => undefined,
        configurable: true,
      })
    })

    it('should handle exceptions during remove', async () => {
      const testKey = 'contextMenus'

      vi.mocked(chrome.storage.local.remove).mockImplementation(() => {
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

      let storageListener: ((changes: { [key: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => void) | undefined
      vi.mocked(chrome.storage.onChanged.addListener).mockImplementation((listener) => {
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
      storageListener?.(changes, 'local')

      expect(callback).toHaveBeenCalledWith(testValue)
    })

    it('should not invoke callback for different key', () => {
      const testKey: StorageKey = 'contextMenus'
      const callback = vi.fn()

      let storageListener: ((changes: { [key: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => void) | undefined
      vi.mocked(chrome.storage.onChanged.addListener).mockImplementation((listener) => {
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
      storageListener?.(changes, 'local')

      expect(callback).not.toHaveBeenCalled()
    })

    it('should not invoke callback for non-local area', () => {
      const testKey: StorageKey = 'contextMenus'
      const testValue = [{ id: '1', title: 'Updated' }]
      const callback = vi.fn()

      let storageListener: ((changes: { [key: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => void) | undefined
      vi.mocked(chrome.storage.onChanged.addListener).mockImplementation((listener) => {
        storageListener = listener
      })

      storage.watch(testKey, callback)

      // Simulate storage change in sync area (not local)
      const changes = {
        [testKey]: {
          newValue: testValue,
          oldValue: null,
        },
      }
      storageListener?.(changes, 'sync')

      expect(callback).not.toHaveBeenCalled()
    })

    it('should invoke callback with null when value is removed', () => {
      const testKey: StorageKey = 'contextMenus'
      const callback = vi.fn()

      let storageListener: ((changes: { [key: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => void) | undefined
      vi.mocked(chrome.storage.onChanged.addListener).mockImplementation((listener) => {
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
      storageListener?.(changes, 'local')

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
