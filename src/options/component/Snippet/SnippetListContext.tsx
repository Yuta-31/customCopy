import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { storage } from '@/lib/storage';
import { pickJsonFile } from '@/lib/file';
import { toCustomCopySnippet, isSnippetEqual, generateSnippetId } from '@/types';
import { TransformRuleListContext } from '@/options/component/TransformRule/TransformRuleListContext';
import { snippetLogger } from '@/options/lib/logger';
import { formatSnippet } from '@/options/lib/utils';
import type { CustomCopySnippetContextMenu, CustomCopySnippet, ExportData, URLTransformRule } from '@/types';

interface SnippetListContextType {
  snippets: Array<CustomCopySnippetContextMenu>;
  setSnippets: (snippets: Array<CustomCopySnippetContextMenu>) => void;
  setSnippet: (
    idx: number,
    key: keyof CustomCopySnippetContextMenu,
    value: string | string[] | boolean
  ) => void;
  deleteSnippet: (idx: number) => void;
  createEmptySnippet: () => void;
  refreshSnippets: () => Promise<void>;
  importSnippets: () => Promise<void>;
  exportSnippets: () => ExportData;
}

export const SnippetListContext = createContext<SnippetListContextType | undefined>(undefined);

interface SnippetListProviderProps {
  children: ReactNode;
}

export const SnippetListProvider = ({ children }: SnippetListProviderProps) => {
  const [snippets, setSnippets] = useState<Array<CustomCopySnippetContextMenu>>([]);
  const transformRuleContext = useContext(TransformRuleListContext);

  if (!transformRuleContext) {
    throw new Error('SnippetListProvider must be used within TransformRuleListProvider');
  }

  const { exportRules, importRules } = transformRuleContext;

  const loadSnippets = async () => {
    try {
      const fetchedSnippets: Array<CustomCopySnippetContextMenu> | undefined = await storage.get('contextMenus');
      if (fetchedSnippets) {
        snippetLogger.info('Snippets loaded from storage', { count: fetchedSnippets.length });
        // Ensure all snippets have IDs
        const snippetsWithIds = fetchedSnippets.map((snippet) => {
          if (!snippet.id) {
            const newId = generateSnippetId();
            snippetLogger.warn('Snippet missing id, generating new one', { newId });
            return { ...snippet, id: newId };
          }
          return snippet;
        });
        setSnippets(snippetsWithIds as unknown as Array<CustomCopySnippetContextMenu>);
      } else {
        snippetLogger.debug('No snippets found in storage');
      }
    } catch (error) {
      snippetLogger.error('Failed to load snippets from storage', error);
    }
  };

  useEffect(() => {
    loadSnippets();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        snippetLogger.debug('Saving snippets to storage', { count: snippets.length });
        await storage.set('contextMenus', formatSnippet(snippets.map(toCustomCopySnippet)));
        snippetLogger.info('Snippets saved successfully');
      } catch (error) {
        snippetLogger.error('Failed to save snippets to storage', error);
      }
    })();
  }, [snippets]);

  const setSnippet = (
    idx: number,
    key: keyof CustomCopySnippetContextMenu,
    value: string | string[] | boolean
  ) => {
    const newSnippets = [...snippets];
    newSnippets[idx] = {
      ...newSnippets[idx],
      [key]: value
    };
    setSnippets(newSnippets);
  };

  const deleteSnippet = (idx: number) => {
    const newSnippets = [...snippets];
    const deletedSnippet = newSnippets[idx];
    newSnippets.splice(idx, 1);
    snippetLogger.info('Snippet deleted', { id: deletedSnippet?.id, index: idx });
    setSnippets(newSnippets);
  };

  const createEmptySnippet = () => {
    const newSnippets = [...snippets];
    const newSnippet: CustomCopySnippetContextMenu = {
      id: generateSnippetId(),
      title: 'title',
      type: 'normal',
      contexts: ['selection'],
      clipboardText: ''
    };
    newSnippets.push(newSnippet);
    snippetLogger.info('New snippet created', { id: newSnippet.id });
    setSnippets(newSnippets);
  };

  const refreshSnippets = async () => {
    await loadSnippets();
  };

  const exportSnippets = (): ExportData => {
    return {
      snippets: snippets.map(snippet => toCustomCopySnippet(snippet)),
      rules: exportRules(),
    };
  };

  const importSnippets = async () => {
    const file = await pickJsonFile();
    if (!file) {
      snippetLogger.debug('Upload cancelled');
      return;
    }

    try {
      snippetLogger.info('Uploading snippets from file', { fileName: file.name });
      const text = await file.text();
      const parsed: ExportData = JSON.parse(text);

      // Handle old format (array of snippets without rules)
      let importedSnippets: CustomCopySnippet[];
      let importedRules: URLTransformRule[] = [];
      
      if (Array.isArray(parsed)) {
        // Old format: just an array of snippets
        importedSnippets = parsed.map(s => ({
          ...s,
          id: s.id || generateSnippetId()
        }));
      } else {
        // New format: object with snippets and rules
        importedSnippets = parsed.snippets || [];
        importedRules = parsed.rules || [];
      }

      // First, import rules and get id mapping
      const ruleIdMapping = importRules(importedRules);
      
      // TODO: do validation
      const existingSnippets = snippets.map(toCustomCopySnippet);
      
      // Create a Set of existing IDs for uniqueness check
      const existingIds = new Set(existingSnippets.map(s => s.id));
      
      const newSnippets: CustomCopySnippetContextMenu[] = importedSnippets
        .filter((importedSnippet) => {
          const isDuplicate = existingSnippets.some((existing) => 
            isSnippetEqual(existing, importedSnippet)
          );
          return !isDuplicate;
        })
        .map((snippet) => {
          // Generate unique ID
          let newId = generateSnippetId();
          while (existingIds.has(newId)) {
            newId = generateSnippetId();
          }
          existingIds.add(newId);
          
          // Map enabledRuleIds using the rule id mapping
          let mappedRuleIds = snippet.enabledRuleIds;
          if (mappedRuleIds && ruleIdMapping.size > 0) {
            mappedRuleIds = mappedRuleIds.map(oldId => 
              ruleIdMapping.get(oldId) || oldId
            );
          }
          
          return {
            ...snippet,
            id: newId,
            type: 'normal' as const,
            enabledRuleIds: mappedRuleIds,
          };
        });

      const duplicateCount = importedSnippets.length - newSnippets.length;
      const importedRuleCount = importedRules.length;
      const newRuleCount = Array.from(ruleIdMapping.values()).filter((newId, index) => {
        const oldId = Array.from(ruleIdMapping.keys())[index];
        return newId !== oldId || !importedRules.find(r => r.id === oldId);
      }).length;
      
      if (duplicateCount > 0) {
        snippetLogger.info('Duplicates skipped', { count: duplicateCount });
      }
      
      setSnippets([...snippets, ...newSnippets]);
      snippetLogger.info('Import completed successfully', { 
        importedSnippets: newSnippets.length, 
        skippedSnippets: duplicateCount,
        importedRules: importedRuleCount,
        newRules: newRuleCount,
        totalSnippets: snippets.length + newSnippets.length 
      });

      if (duplicateCount > 0 || importedRuleCount > 0) {
        const messages = [];
        if (newSnippets.length > 0) {
          messages.push(`Imported ${newSnippets.length} snippet(s)`);
        }
        if (duplicateCount > 0) {
          messages.push(`Skipped ${duplicateCount} duplicate snippet(s)`);
        }
        if (importedRuleCount > 0) {
          const duplicateRules = importedRuleCount - newRuleCount;
          messages.push(`Imported ${newRuleCount} new rule(s)`);
          if (duplicateRules > 0) {
            messages.push(`Mapped ${duplicateRules} duplicate rule(s) to existing rules`);
          }
        }
        alert(messages.join('\n'));
      }

    } catch (e) {
      snippetLogger.error('Upload failed', e);
      if (e instanceof SyntaxError) {
        alert('Failed to import: Invalid JSON file format');
      } else {
        alert('Failed to load JSON. Please check the file content.');
      }
    }
  };

  const value: SnippetListContextType = {
    snippets,
    setSnippets,
    setSnippet,
    deleteSnippet,
    createEmptySnippet,
    refreshSnippets,
    importSnippets,
    exportSnippets,
  };

  return (
    <SnippetListContext.Provider value={value}>
      {children}
    </SnippetListContext.Provider>
  );
};