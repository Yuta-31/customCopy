// TODO: make the type name more specific
export type Message = {
  type: "relay" | "contextMenu" | "logger"
  command: string
  data?: any
}

export type CustomCopySnippet = {
  title: string
  clipboardText: string
  deleteQuery?: boolean | undefined
  contexts?: [`${chrome.contextMenus.ContextType}`, ...`${chrome.contextMenus.ContextType}`[]];
}

export type CustomCopySnippetContextMenu = chrome.contextMenus.CreateProperties & CustomCopySnippet

export type StorageKey = 'contextMenus'

export const toCustomCopySnippet = (snippet: CustomCopySnippetContextMenu): CustomCopySnippet => {
  return {
    title: snippet.title,
    clipboardText: snippet.clipboardText,
    deleteQuery: snippet.deleteQuery,
    contexts: snippet.contexts,
  };
};

export const isSnippetEqual = (a: CustomCopySnippet, b: CustomCopySnippet): boolean => {
  if (a.clipboardText !== b.clipboardText) return false;
  if (a.deleteQuery !== b.deleteQuery) return false;
  
  // Check contexts array equality
  if (!a.contexts && !b.contexts) return true;
  if (!a.contexts || !b.contexts) return false;
  if (a.contexts.length !== b.contexts.length) return false;
  
  return a.contexts.every((ctx, idx) => ctx === b.contexts![idx]);
};