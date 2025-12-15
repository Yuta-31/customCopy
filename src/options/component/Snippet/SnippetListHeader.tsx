import { Download, Upload, Plus } from "lucide-react";
import { downloadJson, pickJsonFile } from "@/lib/file";
import { useSnippetList } from '@/options/hooks/useSnippetList';
import HoverExpandButton from "../HoverExpandButton";


const SnippetListHeader = () => {
  const { snippets, setSnippets, createEmptySnippet } = useSnippetList();

  const handleDownload = async () => {
    downloadJson(snippets, "SnippetList.json");
  };

  const handleUpload = async () => {
    const file = await pickJsonFile();
    console.log(file);
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      // TODO: do validation
      setSnippets(parsed);

    } catch (e) {
      console.error("Upload failed:", e);
      alert("JSON の読み込みに失敗しました。ファイル内容を確認してください。");
    }
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">Snippet List</h2>
      <div className="flex gap-2">
          <HoverExpandButton icon={<Plus />} text="Add New" variant="default" onClick={createEmptySnippet} />
          <HoverExpandButton icon={<Download />} text="Download" onClick={handleDownload} disabled={snippets.length === 0} />
          <HoverExpandButton icon={<Upload />} text="Upload" onClick={handleUpload} />
        </div>
    </div>
  )
};

export { SnippetListHeader };