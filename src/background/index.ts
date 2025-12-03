import { Storage } from "@plasmohq/storage"

import type { CustomCopyContextMenu, Message } from "@/types"

import { handleContextMenu } from "./messages/contextMenu"

// create storage
export const storage = new Storage()
;(async () => {
  // await storage.set("contextMenus", [
  //   {
  //     id: "copy-for-reference-in-mail",
  //     title: "mail",
  //     type: "normal",
  //     contexts: ["selection"],
  //     clipboardText:
  //       "<参考情報> \nTitle: ${title} \nURL: ${url} \n該当部分: \n${selectionText} \n---"
  //   },
  //   {
  //     id: "copy-for-reference-in-markdown",
  //     title: "markdown",
  //     type: "normal",
  //     contexts: ["selection"],
  //     clipboardText: "[${title}](${url}) \n> ${selectionText}"
  //   }
  // ])
})()

// add message listener
chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendResponse) => {
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
  ;(async () => {
    const contextMenus: Array<CustomCopyContextMenu> =
      await storage.get("contextMenus")
    contextMenus.forEach((element) => {
      if (element.id === info.menuItemId) {
        const replacedText = element.clipboardText
          .replace("${title}", tab.title)
          .replace("${url}", tab.url)
          .replace("${selectionText}", info.selectionText)
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
