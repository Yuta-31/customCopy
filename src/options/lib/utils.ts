import type { CustomCopySnippet } from "@/types";

const isInSelectionText = (text: string): boolean => {
  return text.includes('${selectionText}');
}

export const formatSnippet = (snippets: Array<CustomCopySnippet>): Array<CustomCopySnippet> => {
  return snippets.map((snippet) => {
    if (isInSelectionText(snippet.clipboardText)) {
      return snippet;
    }
    return {
      ...snippet,
      contexts: ["all"]
    };
  })
}