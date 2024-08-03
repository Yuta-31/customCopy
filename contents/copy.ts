import type { Message } from "~types"

export {}

const create_reference_for_mail = (title, url, selectionText) => {
  return `
Title: ${title}
URL: ${url}
該当部分:
${selectionText}  
`
}

const create_reference_for_markdown = (title, url, selectionText) => {
  return `
[${title}](${url})
> ${selectionText}
`
}

window.addEventListener("load", () => {
  chrome.runtime.onMessage.addListener(
    (message: Message, sender, sendResponse) => {
      console.log(message)
      if (message.type !== "contextMenu") return
      if (message.command !== "on-click") return
      const result = message.data.replacedText
      navigator.clipboard.writeText(result)
    }
  )
  chrome.runtime.sendMessage({
    type: "contextMenu",
    command: "on-load"
  })
})
