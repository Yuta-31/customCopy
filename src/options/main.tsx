import ReactDOM from "react-dom/client";
import { ContextMenu } from './contextMenu';

const App = () => {
  return (
    <div>
      <ContextMenu />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
