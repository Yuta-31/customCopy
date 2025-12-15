import { useContext } from 'react';
import { SnippetListContext } from '../component/Snippet/SnippetListContext';

export const useSnippetList = () => {
  const context = useContext(SnippetListContext);
  if (!context) {
    throw new Error('useSnippetList must be used within SnippetListProvider');
  }
  return context;
};
