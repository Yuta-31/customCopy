import { ContextMenu } from './contextMenu';

const OptionIndex = () => {
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

export default OptionIndex;
