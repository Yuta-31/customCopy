import type { Message } from "@/types"

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
