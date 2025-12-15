import { createContext, useState, useEffect, type ReactNode } from 'react';
import { storage } from '@/lib/storage';
import type { CustomCopySnippet } from '@/types';

interface SnippetListContextType {
  snippets: Array<CustomCopySnippet>;
  setSnippets: (snippets: Array<CustomCopySnippet>) => void;
  setSnippet: (
    idx: number,
    key: keyof CustomCopySnippet,
    value: string | string[] | boolean
  ) => void;
  deleteSnippet: (idx: number) => void;
  createEmptySnippet: () => void;
  refreshSnippets: () => Promise<void>;
}

export const SnippetListContext = createContext<SnippetListContextType | undefined>(undefined);

interface SnippetListProviderProps {
  children: ReactNode;
}

export const SnippetListProvider = ({ children }: SnippetListProviderProps) => {
  const [snippets, setSnippets] = useState<Array<CustomCopySnippet>>([]);

  const loadSnippets = async () => {
    const fetchedSnippets = await storage.get('contextMenus');
    if (fetchedSnippets) {
      setSnippets(fetchedSnippets as unknown as Array<CustomCopySnippet>);
    }
  };

  useEffect(() => {
    loadSnippets();
  }, []);

  useEffect(() => {
    console.log('Snippets updated, saving to storage...');
    (async () => {
      await storage.set('contextMenus', snippets);
    })();
    console.log(snippets);
  }, [snippets]);

  const setSnippet = (
    idx: number,
    key: keyof CustomCopySnippet,
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
    newSnippets.splice(idx, 1);
    setSnippets(newSnippets);
  };

  const createEmptySnippet = () => {
    const newSnippets = [...snippets];
    newSnippets.push({
      id: `custom-copy-${Date.now()}`,
      title: 'title',
      type: 'normal',
      contexts: ['selection'],
      clipboardText: ''
    });
    setSnippets(newSnippets);
  };

  const refreshSnippets = async () => {
    await loadSnippets();
  };

  const value: SnippetListContextType = {
    snippets,
    setSnippets,
    setSnippet,
    deleteSnippet,
    createEmptySnippet,
    refreshSnippets
  };

  return (
    <SnippetListContext.Provider value={value}>
      {children}
    </SnippetListContext.Provider>
  );
};
