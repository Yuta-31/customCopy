import { storage } from "~background"
import type { Message } from "~types"

export const handleContextMenu = (message: Message) => {
  if (message.type !== "contextMenu") return
  switch (message.command) {
    case "on-load":
      console.log("contextMenu on-load")
      ;(async () => {
        const contextMenus = await storage.get("contextMenus")
        chrome.contextMenus.removeAll()
        if (Array.isArray(contextMenus)) {
          contextMenus.forEach((element) => {
            chrome.contextMenus.create(element)
          })
        }
      })()
  }
}
