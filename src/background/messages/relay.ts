import { backgroundLogger } from "@/background/lib/logger"
import type { Message } from "@/types"

const handleRelay = (message: Message) => {
  if (message.type !== "relay") return
  ;(async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      })
      const msg: Message = {
        type: "relay",
        command: message.command,
        data: message.data
      }
      if (!tab.id) {
        backgroundLogger.warn("Tab ID is undefined")
        return
      }
      const result = await chrome.tabs.sendMessage(tab.id, msg)
      backgroundLogger.debug("Relay message sent", { result })
    } catch (error) {
      backgroundLogger.error("Failed to relay message", error)
    }
  })()
}

export default handleRelay