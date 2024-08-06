import type { CustomCopyContextMenu } from '~types';

export const ContextMenuCard = ({
  idx,
  contextMenu,
  setContextMenuItem,
  deleteContextMenu
}: {
  idx: number;
  contextMenu: CustomCopyContextMenu;
  setContextMenuItem: (
    idx: number,
    key: keyof CustomCopyContextMenu,
    value: string | string[]
  ) => void;
  deleteContextMenu: (idx: number) => void;
}) => {
  return (
    <div key={idx} className="card">
      <div className="header">
        <div className="title">
          <input
            placeholder="title"
            value={contextMenu.title}
            onChange={(e) => {
              setContextMenuItem(idx, 'title', e.target.value);
            }}
          />
        </div>
        <div
          className="delete_button"
          onClick={() => {
            deleteContextMenu(idx);
          }}>
          x
        </div>
      </div>
      <div className="flex_textarea">
        <div className="dummy">{contextMenu.clipboardText}</div>
        <textarea
          placeholder="snippet"
          value={contextMenu.clipboardText}
          onChange={(e) => {
            setContextMenuItem(idx, 'clipboardText', e.target.value);
          }}
        />
      </div>
      <div
        className="sample"
        style={{ color: contextMenu.clipboardText === '' ? 'grey' : '' }}>
        {contextMenu.clipboardText
          .replace('${title}', 'ココにページのタイトルが入ります。')
          .replace('${url}', 'ココにページの URL が入ります。')
          .replace('${selectionText}', 'ココに選択したテキストが入ります。') ||
          'サンプルが表示されます。'}
      </div>
    </div>
  );
};
