import { useEffect, useState } from "react"

import "styles/options.scss"

import { storage } from "~background"
import type { CustomCopyContextMenu } from "~types"

import { ContextMenuRow } from "./component/contextMenuRow"

const OptionsIndex = () => {
  const [contextMenus, setContextMenus] = useState<
    Array<CustomCopyContextMenu>
  >([])

  useEffect(() => {
    ;(async () => {
      const fetchedContextMenus = await storage.get("contextMenus")
      // TODO: type validation
      if (fetchedContextMenus) {
        setContextMenus(
          fetchedContextMenus as unknown as Array<CustomCopyContextMenu>
        )
      }
    })()
  }, [])

  useEffect(() => {
    console.log("contextMenus", contextMenus)
  }, [contextMenus])

  const setContextMenu = (
    idx: number,
    key: "title" | "type" | "contexts",
    value: string | string[]
  ) => {
    // TODO: do validation
    const newContextMenus = [...contextMenus]
    newContextMenus[idx] = {
      ...newContextMenus[idx],
      [key]: value
    }
    setContextMenus(newContextMenus)
  }

  return (
    <div>
      {!!contextMenus &&
        contextMenus.map((contextMenu, idx) => (
          <div key={idx}>
            <ContextMenuRow
              idx={idx}
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
            />
          </div>
        ))}
      <button
        onClick={() => {
          const newContextMenus = [...contextMenus]
          newContextMenus.push({
            id: `custom-copy-${newContextMenus.length}`,
            title: "",
            type: "normal",
            contexts: ["selection"],
            clipboardText: ""
          })
          setContextMenus(newContextMenus)
        }}>
        click
      </button>
      <button
        onClick={() => {
          console.log("save")
          ;(async () => {
            await storage.set("contextMenus", contextMenus)
          })()
        }}>
        save
      </button>
    </div>
  )
}

export default OptionsIndex
