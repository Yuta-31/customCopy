import type { CustomCopyContextMenu } from "~types"

export const ContextMenuRow = ({
  idx,
  contextMenu,
  setContextMenuItem,
  deleteContextMenu
}: {
  idx: number
  contextMenu: CustomCopyContextMenu
  setContextMenuItem: (
    idx: number,
    key: keyof CustomCopyContextMenu,
    value: string | string[]
  ) => void
  deleteContextMenu: (idx: number) => void
}) => {
  return (
    <div key={idx} className="row">
      {["title", "contexts"].map((key, index) => (
        <div key={index}>
          <label>
            {key}:
            <input
              value={contextMenu[key]}
              onChange={(e) => {
                setContextMenuItem(
                  idx,
                  key as "id" | "title" | "type" | "contexts",
                  e.target.value
                )
              }}
            />
          </label>
        </div>
      ))}
      <div>
        <label>
          <span>clipboardText:</span>
          <textarea
            value={contextMenu.clipboardText}
            onChange={(e) => {
              setContextMenuItem(idx, "clipboardText", e.target.value)
            }}
          />
        </label>
      </div>
      <button
        onClick={() => {
          deleteContextMenu(idx)
        }}>
        delete
      </button>
    </div>
  )
}
