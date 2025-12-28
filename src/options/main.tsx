import ReactDOM from "react-dom/client";
import { Download, Upload } from "lucide-react";
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs';
import { downloadJson } from '@/lib/file';
import { SnippetList } from './component/Snippet/SnippetList';
import { SnippetListProvider } from './component/Snippet/SnippetListContext';
import { TransformRuleList } from './component/TransformRule/TransformRuleList';
import { TransformRuleListProvider } from './component/TransformRule/TransformRuleListContext';
import HoverExpandButton from './component/HoverExpandButton';
import { useSnippetList } from './hooks/useSnippetList';


const AppContent = () => {
  const { snippets, importSnippets, exportSnippets } = useSnippetList();

  const handleDownload = async () => {
    const exportData = exportSnippets();
    downloadJson(exportData, "CustomCopyData.json");
  };

  return (
    <div className="w-full h-screen flex flex-col bg-stone-200">
      <Tabs defaultValue="snippets" className="flex-1">
        <div className="flex justify-between items-center pr-4">
          <TabsList>
            <TabsTrigger value="snippets">Snippets</TabsTrigger>
            <TabsTrigger value="rules">URL Transform Rules</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <HoverExpandButton 
              icon={<Download />} 
              text="Export" 
              onClick={handleDownload} 
              disabled={snippets.length === 0} 
            />
            <HoverExpandButton 
              icon={<Upload />} 
              text="Import" 
              onClick={importSnippets} 
            />
          </div>
        </div>
        <TabsContent value="snippets" className="mt-0">
          <SnippetList />
        </TabsContent>
        
        <TabsContent value="rules" className="mt-0">
          <TransformRuleList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const App = () => {
  return (
    <TransformRuleListProvider>
      <SnippetListProvider>
        <AppContent />
      </SnippetListProvider>
    </TransformRuleListProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
