import { storageLogger } from "@/lib/logger"
import type { StorageKey } from "@/types"

class Storage {
  async get<T = unknown>(key: StorageKey): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get([key], (result) => {
          if (chrome.runtime.lastError) {
            storageLogger.error(`Failed to get storage key: ${key}`, chrome.runtime.lastError)
            reject(chrome.runtime.lastError)
            return
          }
          storageLogger.debug(`Retrieved storage key: ${key}`, result[key])
          resolve(result[key] as T)
        })
      } catch (e) {
        storageLogger.error(`Exception getting storage key: ${key}`, e)
        reject(e)
      }
    })
  }

  async set<T = unknown>(key: StorageKey, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            storageLogger.error(`Failed to set storage key: ${key}`, chrome.runtime.lastError)
            reject(chrome.runtime.lastError)
            return
          }
          storageLogger.debug(`Saved storage key: ${key}`, value)
          resolve()
        })
      } catch (e) {
        storageLogger.error(`Exception setting storage key: ${key}`, e)
        reject(e)
      }
    })
  }

  async remove(key: string | string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.remove(key, () => {
          if (chrome.runtime.lastError) {
            storageLogger.error(`Failed to remove storage key: ${key}`, chrome.runtime.lastError)
            reject(chrome.runtime.lastError)
            return
          }
          storageLogger.debug(`Removed storage key: ${key}`)
          resolve()
        })
      } catch (e) {
        storageLogger.error(`Exception removing storage key: ${key}`, e)
        reject(e)
      }
    })
  }

  watch<T = unknown>(key: StorageKey, cb: (value: T | null) => void): () => void {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: chrome.storage.AreaName
    ) => {
      if (areaName !== "local") return
      if (!changes[key]) return
      storageLogger.debug(`Storage key changed: ${key}`, changes[key].newValue)
      cb((changes[key].newValue ?? null) as T | null)
    }

    chrome.storage.onChanged.addListener(listener)
    storageLogger.debug(`Started watching storage key: ${key}`)

    return () => {
      chrome.storage.onChanged.removeListener(listener)
      storageLogger.debug(`Stopped watching storage key: ${key}`)
    }
  }
}

export const storage = new Storage()