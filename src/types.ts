// Todo: make the type name more specific
export type Message = {
  type: "relay" | "contextMenu"
  command: string
  data?: any
}

export type CustomCopySnippet = chrome.contextMenus.CreateProperties & {
  clipboardText: string
  deleteQuery?: boolean | undefined
}

export type StorageKey = 'contextMenus'