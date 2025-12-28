import { storage } from "@/lib/storage"
import { stripQuery, transformUrl } from "@/lib/url"
import { backgroundLogger } from "@/background/lib/logger"
import { handleContextMenu } from "./messages/contextMenu"
import { logging } from "./messages/logger"
import type { CustomCopySnippetContextMenu, URLTransformRule, Message } from "@/types"

// add message listener
chrome.runtime.onMessage.addListener(
  (message: Message) => {
    backgroundLogger.debug("Received message", message)
    switch (message.type) {
      case "contextMenu":
        handleContextMenu(message)
        return
      case "relay":
        return
      case "logger":
        logging(message);
        return
      default:
        return
    }
  }
)

// add contextMenu event
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab) return;
  ;(async () => {
    const contextMenus: Array<CustomCopySnippetContextMenu> =
      await storage.get("contextMenus")
    if (!contextMenus || !Array.isArray(contextMenus)) return;
    
    // Load transform rules
    const transformRules: Array<URLTransformRule> = await storage.get("transformRules") || [];
    
    // Find the matching menu item
    const matchedElement = contextMenus.find((element) => element.id === info.menuItemId);
    
    if (!matchedElement) {
      backgroundLogger.debug("No matching context menu item found", { menuItemId: info.menuItemId });
      return;
    }
    
    backgroundLogger.debug("Context menu item matched", {
      menuItemId: info.menuItemId,
      elementId: matchedElement.id
    });
    
    // replace text
    let url = tab.url ?? ""
    if (matchedElement.deleteQuery) {
      url = stripQuery(url)
    }
    
    // Apply enabled transform rules
    if (matchedElement.enabledRuleIds && matchedElement.enabledRuleIds.length > 0) {
      const enabledRules = transformRules.filter(rule => 
        matchedElement.enabledRuleIds!.includes(rule.id)
      );
      
      for (const rule of enabledRules) {
        // Check domain filter if specified
        if (rule.domain) {
          try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;
            const domain = rule.domain;
            const matchesDomain =
              hostname === domain || hostname.endsWith(`.${domain}`);
            if (!matchesDomain) {
              continue; // Skip this rule if domain doesn't match
            }
          } catch (error) {
            backgroundLogger.warn('Failed to parse URL for domain check', { url, error });
            continue; // Skip if URL parsing fails
          }
        }
        
        // Apply the transformation
        url = transformUrl(url, rule.pattern, rule.replacement);
      }
    }
    
    backgroundLogger.debug("Context menu clicked", { 
      deleteQuery: matchedElement.deleteQuery, 
      enabledRuleIds: matchedElement.enabledRuleIds,
      url 
    })
    const replacedText = matchedElement.clipboardText
      .replace("${title}", tab.title ?? "")
      .replace("${url}", url)
      .replace("${selectionText}", info.selectionText ?? "")
    
    if (!tab.id) {
      backgroundLogger.error('Tab ID is missing, cannot send message');
      return;
    }
    
    chrome.tabs.sendMessage(tab.id, {
      type: "contextMenu",
      command: "on-click",
      data: {
        replacedText: replacedText
      }
    }, () => {
      if (chrome.runtime.lastError) {
        backgroundLogger.error('Failed to send message to content script', chrome.runtime.lastError);
        return;
      }
      backgroundLogger.info("Text copied to clipboard", { replacedText });
    });
  })()
})