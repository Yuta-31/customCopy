import ReactDOM from "react-dom/client";
import { Download, Upload } from "lucide-react";
import { Toaster } from 'sonner';
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs';
import { downloadJson } from '@/lib/file';
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsMenu } from "@/components/settings-menu";
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
    <div className="w-full h-screen flex flex-col bg-stone-200 dark:bg-stone-950">
      <Toaster position="top-right" />
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
            <SettingsMenu />
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
  /* NOTE: SnippetListProvider depends on TransformRuleListContext, so it must be nested inside TransformRuleListProvider. Do not change this provider order. */
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TransformRuleListProvider>
        <SnippetListProvider>
          <AppContent />
        </SnippetListProvider>
      </TransformRuleListProvider>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
