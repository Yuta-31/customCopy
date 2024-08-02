// Todo: make the type name more specific
export type Message = {
  type: "relay" | "contextMenu"
  command: string
  data?: any
}
