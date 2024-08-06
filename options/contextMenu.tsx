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
      <button onClick={createEmptyContextMenu}>click</button>
    </div>
  );
};
