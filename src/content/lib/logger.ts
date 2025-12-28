/* eslint-disable @typescript-eslint/no-explicit-any */
class Logger {
  info(message: string, ...args: any[]): void {
    console.log("aaa")
    chrome.runtime.sendMessage({
      type: "logger",
      command: "info",
      data: { message, args }
    })
  }

  warn(message: string, ...args: any[]): void {
    chrome.runtime.sendMessage({
      type: "logger",
      command: "warn",
      data: { message, args }
    })
  }

  error(message: string, ...args: any[]): void {
    chrome.runtime.sendMessage({
      type: "logger",
      command: "error",
      data: { message, args }
    })
  }
}

export const contentLogger = new Logger();