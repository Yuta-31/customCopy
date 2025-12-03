import { useEffect, useState } from 'react';
import '@/styles/options_contextMenu.scss';
import { storage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { ContextMenuCard } from './component/contextMenuCard';
import { ContextMenuEmptyView} from './component/CotenxtMenuEmptyView';
import type { CustomCopyContextMenu } from '@/types';


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
    key: keyof CustomCopyContextMenu,
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
      <div className="w-[600px] flex flex-col gap-2">
        {contextMenus.length > 0 ?
          contextMenus.map((contextMenu, idx) => (
            <div key={idx}>
              <ContextMenuCard
                idx={idx}
                contextMenu={contextMenu}
                setContextMenuItem={setContextMenuItem}
                deleteContextMenu={deleteContextMenu}
              />
            </div>
          )) : <ContextMenuEmptyView 
            onNewSnippetClick={createEmptyContextMenu}
            onImportSnippetClick={()=>{console.log("import")}}
          />}
        {contextMenus.length > 0 && 
        (<Button onClick={createEmptyContextMenu}>
          ADD NEW CONTEXT MENU
        </Button>)}
        
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
