// src/options/component/Snippet/SnippetListHeader.tsx
import { Plus } from "lucide-react";
import { useSnippetList } from '@/options/hooks/useSnippetList';
import HoverExpandButton from "../HoverExpandButton";


const SnippetListHeader = () => {
  const { createEmptySnippet } = useSnippetList();

  return (
    <div className="flex justify-between items-center pb-2 border-b">
      <h1 className="text-2xl font-bold">Snippet List</h1>
      <HoverExpandButton icon={<Plus />} text="Add New" variant="default" onClick={createEmptySnippet} />
    </div>
  )
};

export { SnippetListHeader };