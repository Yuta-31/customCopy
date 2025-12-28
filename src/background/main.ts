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
    
    contextMenus.forEach((element) => {
      backgroundLogger.debug("Checking context menu item", {
        menuItemId: info.menuItemId,
        elementId: element.id
      });
      if (element.id === info.menuItemId) {
        // replace text
        let url = tab.url ?? ""
        if (element.deleteQuery) {
          url = stripQuery(url)
        }
        
        // Apply enabled transform rules
        if (element.enabledRuleIds && element.enabledRuleIds.length > 0) {
          const enabledRules = transformRules.filter(rule => 
            element.enabledRuleIds!.includes(rule.id)
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
              } catch {
                continue; // Skip if URL parsing fails
              }
            }
            
            // Apply the transformation
            url = transformUrl(url, rule.pattern, rule.replacement);
          }
        }
        
        backgroundLogger.debug("Context menu clicked", { 
          deleteQuery: element.deleteQuery, 
          enabledRuleIds: element.enabledRuleIds,
          url 
        })
        const replacedText = element.clipboardText
          .replace("${title}", tab.title ?? "")
          .replace("${url}", url)
          .replace("${selectionText}", info.selectionText ?? "")
        // TODO: handle error
        if (!tab.id) return;
        chrome.tabs.sendMessage(tab.id, {
          type: "contextMenu",
          command: "on-click",
          data: {
            replacedText: replacedText
          }
        })
        backgroundLogger.info("Text copied to clipboard", { replacedText })
      }
    })
  })()
})