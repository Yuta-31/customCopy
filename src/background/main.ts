import { storage } from "@/lib/storage"
import { stripQuery } from "@/lib/url"
import { handleContextMenu } from "./messages/contextMenu"
import type { CustomCopyContextMenu, Message } from "@/types"

// add message listener
chrome.runtime.onMessage.addListener(
  (message: Message) => {
    switch (message.type) {
      case "contextMenu":
        handleContextMenu(message)
        return
      case "relay":
        return
      default:
        return
    }
  }
)

// add contextMenu event
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab) return;
  ;(async () => {
    const contextMenus: Array<CustomCopyContextMenu> =
      await storage.get("contextMenus")
    if (!contextMenus || !Array.isArray(contextMenus)) return;
    contextMenus.forEach((element) => {
      if (element.id === info.menuItemId) {
        // replace text
        const url = (() => {
          if (element.deleteQuery) return stripQuery(tab.url ?? "")
          return tab.url ?? ""
        })()
        console.log(element.deleteQuery, url)
        const replacedText = element.clipboardText
          .replace("${title}", tab.title ?? "")
          .replace("${url}", url)
          .replace("${selectionText}", info.selectionText ?? "")
        // TODO: handle error
        if (!tab.id) return;
        chrome.tabs.sendMessage(tab.id, {
          type: "contextMenu",
          command: "on-click",
          data: {
            replacedText: replacedText
          }
        })
      }
    })
  })()
})
