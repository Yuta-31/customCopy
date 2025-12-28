import { createContext, useState, useEffect, type ReactNode } from 'react';
import { storage } from '@/lib/storage';
import { pickJsonFile } from '@/lib/file';
import { toCustomCopySnippet, isSnippetEqual } from '@/types';
import { snippetLogger } from '@/options/lib/logger';
import type { CustomCopySnippetContextMenu, CustomCopySnippet } from '@/types';

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
  exportSnippets: () => CustomCopySnippet[];
}

export const SnippetListContext = createContext<SnippetListContextType | undefined>(undefined);

interface SnippetListProviderProps {
  children: ReactNode;
}

export const SnippetListProvider = ({ children }: SnippetListProviderProps) => {
  const [snippets, setSnippets] = useState<Array<CustomCopySnippetContextMenu>>([]);

  const loadSnippets = async () => {
    const fetchedSnippets: Array<CustomCopySnippetContextMenu> | undefined = await storage.get('contextMenus');
    if (fetchedSnippets) {
      snippetLogger.info('Snippets loaded from storage', { count: fetchedSnippets.length });
      setSnippets(fetchedSnippets as unknown as Array<CustomCopySnippetContextMenu>);
    } else {
      snippetLogger.debug('No snippets found in storage');
    }
  };

  useEffect(() => {
    loadSnippets();
  }, []);

  useEffect(() => {
    (async () => {
      snippetLogger.debug('Saving snippets to storage', { count: snippets.length });
      await storage.set('contextMenus', snippets);
      snippetLogger.info('Snippets saved successfully');
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
      id: `custom-copy-${Date.now()}`,
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

  const exportSnippets = (): CustomCopySnippet[] => {
    return snippets.map(toCustomCopySnippet);
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
      const parsed: CustomCopySnippet[] = JSON.parse(text);

      // TODO: do validation
      const existingSnippets = snippets.map(toCustomCopySnippet);
      const newSnippets: CustomCopySnippetContextMenu[] = parsed
        .filter((importedSnippet) => {
          const isDuplicate = existingSnippets.some((existing) => 
            isSnippetEqual(existing, importedSnippet)
          );
          return !isDuplicate;
        })
        .map((snippet) => ({
          id: `custom-copy-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: 'imported snippet',
          type: 'normal' as const,
          ...snippet,
        }));

      const duplicateCount = parsed.length - newSnippets.length;
      
      if (duplicateCount > 0) {
        snippetLogger.info('Duplicates skipped', { count: duplicateCount });
      }
      
      setSnippets([...snippets, ...newSnippets]);
      snippetLogger.info('Snippets imported successfully', { 
        imported: newSnippets.length, 
        skipped: duplicateCount,
        total: snippets.length + newSnippets.length 
      });

      if (duplicateCount > 0) {
        alert(`${newSnippets.length} 件のスニペットをインポートしました。${duplicateCount} 件の重複はスキップされました。`);
      }

    } catch (e) {
      snippetLogger.error('Upload failed', e);
      alert("JSON の読み込みに失敗しました。ファイル内容を確認してください。");
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