import { storage } from "@/lib/storage"
import { stripQuery, transformUrl, extractSectionHeading } from "@/lib/url"
import { backgroundLogger } from "@/background/lib/logger"
import { handleContextMenu } from "./messages/contextMenu"
import { logging } from "./messages/logger"
import type { CustomCopySnippetContextMenu, URLTransformRule, Message } from "@/types"

/**
 * Execute a snippet on the active tab
 * @param snippet - The snippet to execute
 * @param tab - The tab to execute on
 * @param selectionText - The selected text (optional, for keyboard shortcuts)
 */
async function executeSnippet(
  snippet: CustomCopySnippetContextMenu,
  tab: chrome.tabs.Tab,
  selectionText?: string
) {
  if (!tab.id) {
    backgroundLogger.error('Tab ID is missing, cannot execute snippet');
    return;
  }

  // Load transform rules
  const transformRules: Array<URLTransformRule> = await storage.get("transformRules") || [];
  
  // replace text
  let url = tab.url ?? ""
  if (snippet.deleteQuery) {
    url = stripQuery(url)
  }
  
  // Apply enabled transform rules
  if (snippet.enabledRuleIds && snippet.enabledRuleIds.length > 0) {
    const enabledRules = transformRules.filter(rule => 
      snippet.enabledRuleIds!.includes(rule.id)
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
  
  backgroundLogger.debug("Executing snippet", { 
    deleteQuery: snippet.deleteQuery, 
    enabledRuleIds: snippet.enabledRuleIds,
    url 
  })
  
  // Extract section ID from URL and get heading text from page
  const sectionId = extractSectionHeading(url);
  let section = sectionId;
  
  if (sectionId) {
    try {
      // Request section heading text from content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "getSectionHeading",
        command: "request",
        data: { sectionId }
      }) as { headingText?: string } | undefined;
      
      if (response?.headingText) {
        section = response.headingText;
        backgroundLogger.debug("Section heading retrieved", { sectionId, headingText: section });
      }
    } catch (error) {
      backgroundLogger.warn('Failed to get section heading from content script, using section ID', { sectionId, error });
    }
  }
  
  const replacedText = snippet.clipboardText
    .replace("${title}", tab.title ?? "")
    .replace("${url}", url)
    .replace("${selectionText}", selectionText ?? "")
    .replace("${section}", section)
  
  chrome.tabs.sendMessage(tab.id, {
    type: "contextMenu",
    command: "on-click",
    data: {
      replacedText: replacedText,
      snippetTitle: snippet.title
    }
  }, () => {
    if (chrome.runtime.lastError) {
      backgroundLogger.error('Failed to send message to content script', chrome.runtime.lastError);
      return;
    }
    backgroundLogger.info("Text copied to clipboard", { replacedText, snippetTitle: snippet.title });
  });
}

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
  (async () => {
    const contextMenus: Array<CustomCopySnippetContextMenu> =
      await storage.get("contextMenus")
    if (!contextMenus || !Array.isArray(contextMenus)) return;
    
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
    
    // Execute the snippet
    await executeSnippet(matchedElement, tab, info.selectionText);
  })()
})

// add keyboard shortcut listener
chrome.commands.onCommand.addListener((command) => {
  backgroundLogger.debug("Command received", { command });
  
  // Parse the command (e.g., "execute-snippet-1" -> 1)
  const match = command.match(/^execute-snippet-(\d+)$/);
  if (!match) {
    backgroundLogger.warn("Unknown command", { command });
    return;
  }
  
  const shortcutNumber = parseInt(match[1], 10);
  
  (async () => {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      backgroundLogger.error("No active tab found");
      return;
    }
    
    // Get snippets and find the one with matching shortcut number
    const contextMenus: Array<CustomCopySnippetContextMenu> = await storage.get("contextMenus");
    if (!contextMenus || !Array.isArray(contextMenus)) {
      backgroundLogger.warn("No snippets found");
      return;
    }
    
    const snippet = contextMenus.find(s => s.shortcutNumber === shortcutNumber);
    if (!snippet) {
      backgroundLogger.warn("No snippet assigned to this shortcut", { shortcutNumber });
      return;
    }
    
    backgroundLogger.info("Executing snippet via keyboard shortcut", { 
      shortcutNumber, 
      snippetTitle: snippet.title 
    });
    
    // Get page info (title, url, selection) from the page via content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "getPageInfo",
        command: "request"
      }) as { title?: string; url?: string; selectionText?: string } | undefined;
      
      // Update tab info with data from content script
      const updatedTab = {
        ...tab,
        title: response?.title ?? tab.title ?? "",
        url: response?.url ?? tab.url ?? ""
      };
      
      const selectionText = response?.selectionText ?? "";
      
      backgroundLogger.debug("Page info retrieved from content script", {
        title: updatedTab.title,
        url: updatedTab.url,
        selectionLength: selectionText.length
      });
      
      // Execute the snippet with updated tab info
      await executeSnippet(snippet, updatedTab, selectionText);
    } catch (error) {
      backgroundLogger.error("Failed to get page info from content script", error);
      // Try to execute with tab info from query (may be incomplete)
      await executeSnippet(snippet, tab, "");
    }
  })();
});