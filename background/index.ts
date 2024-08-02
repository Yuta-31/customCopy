import { Storage } from "@plasmohq/storage"

import type { Message } from "~types"

import { handleContextMenu } from "./messages/contextMenu"

// create storage
export const storage = new Storage()
;(async () => {
  await storage.set("contextMenus", [
    {
      id: "copy-for-reference-in-mail",
      title: "mail",
      type: "normal",
      contexts: ["selection"]
    },
    {
      id: "copy-for-reference-in-markdown",
      title: "markdown",
      type: "normal",
      contexts: ["selection"]
    }
  ])
  // add contextMenu
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
    chrome.tabs.sendMessage(tab.id, {
      command: info.menuItemId,
      title: tab.title,
      url: tab.url
    })
  })()
})
