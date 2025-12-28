// TODO: make the type name more specific
export type Message = {
  type: "relay" | "contextMenu" | "logger"
  command: string
  data?: any
}

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
  deleteQuery?: boolean | undefined
  enabledRuleIds?: string[] | undefined
  contexts?: [`${chrome.contextMenus.ContextType}`, ...`${chrome.contextMenus.ContextType}`[]];
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
    deleteQuery: snippet.deleteQuery,
    enabledRuleIds: snippet.enabledRuleIds,
    contexts: snippet.contexts,
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
export const isSnippetEqual = (a: CustomCopySnippet | Omit<CustomCopySnippet, 'id'>, b: CustomCopySnippet | Omit<CustomCopySnippet, 'id'>): boolean => {
  if (a.title !== b.title) return false;
  if (a.clipboardText !== b.clipboardText) return false;
  if (a.deleteQuery !== b.deleteQuery) return false;
  
  // Check enabledRuleIds array equality
  if (!a.enabledRuleIds && !b.enabledRuleIds) {
    // both undefined/null, continue to contexts check
  } else if (!a.enabledRuleIds || !b.enabledRuleIds) {
    return false;
  } else if (a.enabledRuleIds.length !== b.enabledRuleIds.length) {
    return false;
  } else if (!a.enabledRuleIds.every((id, idx) => id === b.enabledRuleIds![idx])) {
    return false;
  }
  
  // Check contexts array equality
  if (!a.contexts && !b.contexts) return true;
  if (!a.contexts || !b.contexts) return false;
  if (a.contexts.length !== b.contexts.length) return false;
  
  return a.contexts.every((ctx, idx) => ctx === b.contexts![idx]);
};