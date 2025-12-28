import { contentLogger } from "./lib/logger"
import type { Message } from "@/types"

/**
 * Get section heading text from the current page by section ID
 * @param sectionId - The section ID (hash without '#')
 * @returns The text content of the heading element, or empty string if not found
 */
const getSectionHeadingText = (sectionId: string): string => {
  if (!sectionId) return ''
  
  try {
    // Try to find element by ID
    const element = document.getElementById(sectionId)
    if (element) {
      return element.textContent?.trim() ?? ''
    }
    
    // Try to find element with name attribute (for older HTML)
    const namedElement = document.querySelector(`[name="${sectionId}"]`)
    if (namedElement) {
      return namedElement.textContent?.trim() ?? ''
    }
    
    return ''
  } catch (error) {
    contentLogger.error('Failed to get section heading text', error)
    return ''
  }
}

window.addEventListener("load", () => {
  contentLogger.info("Window loaded")
  chrome.runtime.onMessage.addListener(
    (message: Message, _sender, sendResponse) => {
      contentLogger.info("Received message", message)
      
      if (message.type === "getSectionHeading") {
        const sectionId = message.data?.sectionId ?? ''
        const headingText = getSectionHeadingText(sectionId)
        contentLogger.info("Section heading retrieved", { sectionId, headingText })
        sendResponse({ headingText })
        return true
      }
      
      if (message.type === "contextMenu") {
        if (message.command !== "on-click") return
        if (!message.data?.replacedText) return
        const result = message.data.replacedText
        navigator.clipboard.writeText(result)
          .then(() => {
            contentLogger.info("Text copied to clipboard", { text: result })
          })
          .catch((error) => {
            contentLogger.error("Failed to copy text to clipboard", error)
          })
      }
    }
  )
  chrome.runtime.sendMessage({
    type: "contextMenu",
    command: "on-load"
  })
  contentLogger.info("Content script loaded")
})

