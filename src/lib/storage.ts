// src/lib/storage.ts (場所はお好み)
class Storage {
  async get<T = unknown>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get([key], (result) => {
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

  async set<T = unknown>(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set({ [key]: value }, () => {
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
        chrome.storage.local.remove(key, () => {
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

  /**
   * Plasmo の storage.watch(キー, コールバック)っぽい簡易版
   * 戻り値は unsubscribe 関数にしておく
   */
  watch<T = unknown>(key: string, cb: (value: T | null) => void): () => void {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: chrome.storage.AreaName
    ) => {
      if (areaName !== "local") return
      if (!changes[key]) return
      cb((changes[key].newValue ?? null) as T | null)
    }

    chrome.storage.onChanged.addListener(listener)

    // 解除用
    return () => {
      chrome.storage.onChanged.removeListener(listener)
    }
  }
}

export const storage = new Storage()
