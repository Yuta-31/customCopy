import { useEffect, useState } from 'react';

import 'styles/options_contextMenu.scss';

import { storage } from '~background';
import type { CustomCopyContextMenu } from '~types';

import { ContextMenuCard } from './component/contextMenuCard';

export const ContextMenu = () => {
  const [contextMenus, setContextMenus] = useState<
    Array<CustomCopyContextMenu>
  >([]);

  useEffect(() => {
    (async () => {
      const fetchedContextMenus = await storage.get('contextMenus');
      // TODO: type validation
      if (fetchedContextMenus) {
        setContextMenus(
          fetchedContextMenus as unknown as Array<CustomCopyContextMenu>
        );
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await storage.set('contextMenus', contextMenus);
    })();
    console.log(contextMenus);
  }, [contextMenus]);

  const setContextMenuItem = (
    idx: number,
    key: 'title' | 'type' | 'contexts',
    value: string | string[]
  ) => {
    // TODO: do validation
    const newContextMenus = [...contextMenus];
    newContextMenus[idx] = {
      ...newContextMenus[idx],
      [key]: value
    };
    setContextMenus(newContextMenus);
  };

  const deleteContextMenu = (idx: number) => {
    const newContextMenus = [...contextMenus];
    newContextMenus.splice(idx, 1);
    setContextMenus(newContextMenus);
  };

  const createEmptyContextMenu = () => {
    const newContextMenus = [...contextMenus];
    newContextMenus.push({
      id: `custom-copy-${Date.now()}`,
      title: 'title',
      type: 'normal',
      contexts: ['selection'],
      clipboardText: ''
    });
    setContextMenus(newContextMenus);
  };

  return (
    <div className="frame">
      <div className="settings">
        {!!contextMenus &&
          contextMenus.map((contextMenu, idx) => (
            <div key={idx}>
              <ContextMenuCard
                idx={idx}
                contextMenu={contextMenu}
                setContextMenuItem={setContextMenuItem}
                deleteContextMenu={deleteContextMenu}
              />
            </div>
          ))}
        <div className="add_button" onClick={createEmptyContextMenu}>
          ADD NEW CONTEXT MENU
        </div>
      </div>
      <div className="infos">
        <h3>変数一覧</h3>
        <div className="info_text">
          特定の文字列にはページのタイトルなどが挿入されます。
        </div>
        <table className="vars">
          <tr>
            <td>{'${title}'}:</td>
            <td>ページのタイトル</td>
          </tr>
          <tr>
            <td>{'${url}'}:</td>
            <td>ページの URL</td>
          </tr>
          <tr>
            <td>{'${selectionText}'}:</td>
            <td>選択したテキスト</td>
          </tr>
        </table>
      </div>
    </div>
  );
};
