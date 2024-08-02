import type { CustomCopyContextMenu } from "~types"

export const ContextMenuRow = ({
  idx,
  contextMenu,
  setContextMenu
}: {
  idx: number
  contextMenu: CustomCopyContextMenu
  setContextMenu: (
    idx: number,
    key: keyof CustomCopyContextMenu,
    value: string | string[]
  ) => void
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
                setContextMenu(
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
              setContextMenu(idx, "clipboardText", e.target.value)
            }}
          />
        </label>
      </div>
    </div>
  )
}
