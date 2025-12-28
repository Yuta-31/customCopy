import { contentLogger } from "@/background/lib/logger"
import type { Message } from "@/types"

export const logging = (message: Message) => {
  if (message.type !== "logger") return
  switch (message.command) {
    case "info":
      contentLogger.info(message.data.message, ...message.data.args);
      return;
    case "warn":
      contentLogger.warn(message.data.message, ...message.data.args);
      return;
    case "error":
      contentLogger.error(message.data.message, ...message.data.args);
      return;
    default:
      return;
  }
}