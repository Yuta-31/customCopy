import type { Message } from "@/types"

const handleRelay = (message: Message) => {
  if (message.type !== "relay") return
  ;(async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    })
    const msg: Message = {
      type: "relay",
      command: message.command,
      data: message.data
    }
    // TODO: tab.id might be undefined
    // TODO: handle log and result
    const result = await chrome.tabs.sendMessage(tab.id!, msg)
    console.log("result", result)
  })()
}

export default handleRelay
