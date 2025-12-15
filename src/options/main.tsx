import ReactDOM from "react-dom/client";
import { SnippetList } from './component/Snippet/SnippetList';
import { SnippetListProvider } from './component/Snippet/SnippetListContext';

const App = () => {
  return (
    <SnippetListProvider>
      <SnippetList />
    </SnippetListProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
