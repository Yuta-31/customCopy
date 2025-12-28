import { contentLogger } from "./lib/logger"
import type { Message } from "@/types"

window.addEventListener("load", () => {
  contentLogger.info("Window loaded")
  chrome.runtime.onMessage.addListener(
    (message: Message) => {
      contentLogger.info("Received message", message)
      if (message.type !== "contextMenu") return
      if (message.command !== "on-click") return
      const result = message.data.replacedText
      navigator.clipboard.writeText(result)
        .then(() => {
          contentLogger.info("Text copied to clipboard", { text: result })
        })
        .catch((error) => {
          contentLogger.error("Failed to copy text to clipboard", error)
        })
    }
  )
  chrome.runtime.sendMessage({
    type: "contextMenu",
    command: "on-load"
  })
  contentLogger.info("Content script loaded")
})