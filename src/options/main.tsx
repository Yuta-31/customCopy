import ReactDOM from "react-dom/client";
import { ContextMenu } from './contextMenu';

const App = () => {
  return (
    <div>
      <h1>Options</h1>
      <div className="option_frame">
        <div className="option_menu"></div>
        <div className="option_content">
          <ContextMenu />
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
