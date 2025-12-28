import { storage } from "@/lib/storage"
import { backgroundLogger } from "@/background/lib/logger"
import type { Message } from "@/types"

export const handleContextMenu = (message: Message) => {
  if (message.type !== "contextMenu") return
  switch (message.command) {
    case "on-load":
      backgroundLogger.info("Context menu loading")
      ;(async () => {
        const contextMenus = await storage.get("contextMenus")
        chrome.contextMenus.removeAll(() => {
          if (Array.isArray(contextMenus)) {
            contextMenus.forEach((element) => {
              if (!element.id) {
                backgroundLogger.warn("Context menu item missing id, skipping", { element })
                return;
              }
              const context = { 
                id: element.id, 
                title: element.title,
                type: element.type,
                contexts: element.contexts 
              };
              backgroundLogger.debug("Context menu creating", context);
              const res = chrome.contextMenus.create(context);
              backgroundLogger.debug("Context menu created", { id: element.id, result: res })
            })
          }
        })
      })()
  }
}