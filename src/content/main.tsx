import { createRoot } from 'react-dom/client'
import { ContentApp } from './ContentApp'
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
    const safeSectionId =
      typeof CSS !== "undefined" && typeof CSS.escape === "function"
        ? CSS.escape(sectionId)
        : sectionId.replace(/["\\\[\]]/g, "\\$&")
    const namedElement = document.querySelector(`[name="${safeSectionId}"]`)
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
  
  // Mount React app for toast notifications
  const toastRoot = document.createElement('div')
  toastRoot.id = 'custom-copy-toast-root'
  toastRoot.style.cssText = 'position: fixed; z-index: 2147483647;'
  document.body.appendChild(toastRoot)
  
  const root = createRoot(toastRoot)
  root.render(<ContentApp />)
  
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
      
      if (message.type === "getSelection") {
        const selectionText = window.getSelection()?.toString() ?? ''
        contentLogger.info("Selection retrieved", { selectionText })
        sendResponse({ selectionText })
        return true
      }
      
      if (message.type === "getPageInfo") {
        const pageInfo = {
          title: document.title,
          url: window.location.href,
          selectionText: window.getSelection()?.toString() ?? ''
        }
        contentLogger.info("Page info retrieved", pageInfo)
        sendResponse(pageInfo)
        return true
      }
      
      // Toast handling is now in ContentApp.tsx
    }
  )
  chrome.runtime.sendMessage({
    type: "contextMenu",
    command: "on-load"
  })
  contentLogger.info("Content script loaded")
})

