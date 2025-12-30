// Message types for chrome.runtime communication
export type MessageType = "relay" | "contextMenu" | "logger" | "getSectionHeading" | "getSelection" | "getPageInfo"

export type MessageData = 
  | { type: "relay"; command: string; data?: unknown }
  | { type: "contextMenu"; command: "on-load" | "on-click"; data?: { replacedText?: string; snippetTitle?: string } }
  | { type: "logger"; command: "info" | "warn" | "error"; data: { message: string; args: unknown[] } }
  | { type: "getSectionHeading"; command: "request"; data?: { sectionId: string } }
  | { type: "getSelection"; command: "request"; data?: never }
  | { type: "getPageInfo"; command: "request"; data?: never }

export type Message = MessageData

export type URLTransformRule = {
  id: string
  title: string
  domain?: string // optional domain filter (e.g., "support.microsoft.com")
  pattern: string // regex pattern
  replacement: string // replacement string with $1, $2, etc.
}

export type ExportData = {
  snippets: CustomCopySnippet[]  // with id
  rules: URLTransformRule[]       // with id
}

export type CustomCopySnippet = {
  id: string
  title: string
  clipboardText: string
  enabledRuleIds?: string[] | undefined
  contexts?: [`${chrome.contextMenus.ContextType}`, ...`${chrome.contextMenus.ContextType}`[]];
  shortcutNumber?: number | undefined // 1-5 for Ctrl+Shift+1 through Ctrl+Shift+5
}

export type CustomCopySnippetContextMenu = chrome.contextMenus.CreateProperties & CustomCopySnippet

export type StorageKey = 'contextMenus' | 'transformRules'

// Generate unique ID for snippet
export const generateSnippetId = (): string => {
  return `custom-copy-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Generate unique ID for rule
export const generateRuleId = (): string => {
  return `rule-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const toCustomCopySnippet = (snippet: CustomCopySnippetContextMenu): CustomCopySnippet => {
  return {
    id: snippet.id as string,
    title: snippet.title,
    clipboardText: snippet.clipboardText,
    enabledRuleIds: snippet.enabledRuleIds,
    contexts: snippet.contexts,
    shortcutNumber: snippet.shortcutNumber,
  };
};

// Compare rules by content (excluding id)
export const isRuleEqual = (a: URLTransformRule, b: URLTransformRule): boolean => {
  if (a.title !== b.title) return false;
  if (a.domain !== b.domain) return false;
  if (a.pattern !== b.pattern) return false;
  if (a.replacement !== b.replacement) return false;
  return true;
};

// Compare snippets by content (excluding id)
export const isSnippetEqual = (
  a: CustomCopySnippet | Omit<CustomCopySnippet, 'id'>, 
  b: CustomCopySnippet | Omit<CustomCopySnippet, 'id'>,
  rulesA?: URLTransformRule[],
  rulesB?: URLTransformRule[]
): boolean => {
  if (a.title !== b.title) return false;
  if (a.clipboardText !== b.clipboardText) return false;
  if (a.shortcutNumber !== b.shortcutNumber) return false;
  
  // Check enabledRuleIds array equality
  if (!a.enabledRuleIds && !b.enabledRuleIds) {
    // both undefined/null, continue to contexts check
  } else if (!a.enabledRuleIds || !b.enabledRuleIds) {
    return false;
  } else if (a.enabledRuleIds.length !== b.enabledRuleIds.length) {
    return false;
  } else {
    // If rules are provided, compare by rule content instead of ID
    if (rulesA && rulesB) {
      const rulesAMap = new Map(rulesA.map(r => [r.id, r]));
      const rulesBMap = new Map(rulesB.map(r => [r.id, r]));
      
      for (let i = 0; i < a.enabledRuleIds.length; i++) {
        const ruleA = rulesAMap.get(a.enabledRuleIds[i]);
        const ruleB = rulesBMap.get(b.enabledRuleIds![i]);
        
        // If either rule is not found, fall back to ID comparison
        if (!ruleA || !ruleB) {
          if (a.enabledRuleIds[i] !== b.enabledRuleIds![i]) {
            return false;
          }
        } else {
          // Compare by rule content
          if (!isRuleEqual(ruleA, ruleB)) {
            return false;
          }
        }
      }
    } else {
      // No rules provided, compare by ID only
      if (!a.enabledRuleIds.every((id, idx) => id === b.enabledRuleIds![idx])) {
        return false;
      }
    }
  }
  
  // Check contexts array equality (order-independent)
  if (!a.contexts && !b.contexts) return true;
  if (!a.contexts || !b.contexts) return false;
  if (a.contexts.length !== b.contexts.length) return false;
  
  // Sort contexts for order-independent comparison
  const sortedA = [...a.contexts].sort();
  const sortedB = [...b.contexts].sort();
  return sortedA.every((ctx, idx) => ctx === sortedB[idx]);
};