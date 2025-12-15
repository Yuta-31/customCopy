import type { StorageKey } from "@/types"

class Storage {
  async get<T = unknown>(key: StorageKey): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get([key], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
            return
          }
          resolve(result[key] as T)
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  async set<T = unknown>(key: StorageKey, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
            return
          }
          resolve()
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  async remove(key: string | string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.remove(key, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
            return
          }
          resolve()
        })
      } catch (e) {
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
      cb((changes[key].newValue ?? null) as T | null)
    }

    chrome.storage.onChanged.addListener(listener)

    return () => {
      chrome.storage.onChanged.removeListener(listener)
    }
  }
}

export const storage = new Storage()
