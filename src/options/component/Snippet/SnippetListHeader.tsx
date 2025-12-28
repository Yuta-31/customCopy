// src/options/component/Snippet/SnippetListHeader.tsx
import { Download, Upload, Plus } from "lucide-react";
import { downloadJson } from "@/lib/file";
import { snippetLogger } from "@/options/lib/logger";
import { useSnippetList } from '@/options/hooks/useSnippetList';
import HoverExpandButton from "../HoverExpandButton";


const SnippetListHeader = () => {
  const { snippets, createEmptySnippet, importSnippets, exportSnippets } = useSnippetList();

  const handleDownload = async () => {
    snippetLogger.info('Downloading snippets', { count: snippets.length });
    const exportData = exportSnippets();
    downloadJson(exportData, "SnippetList.json");
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">Snippet List</h2>
      <div className="flex gap-2">
          <HoverExpandButton icon={<Plus />} text="Add New" variant="default" onClick={createEmptySnippet} />
          <HoverExpandButton icon={<Download />} text="Download" onClick={handleDownload} disabled={snippets.length === 0} />
          <HoverExpandButton icon={<Upload />} text="Upload" onClick={importSnippets} />
        </div>
    </div>
  )
};

export { SnippetListHeader };