export {}

const create_reference_for_mail = (title, url, selectionText) => {
  return `
Title: ${title}
URL: ${url}
該当部分:
${selectionText}  
`
}

const create_reference_for_markdown = (title, url, selectionText) => {
  return `
[${title}](${url})
> ${selectionText}
`
}

window.addEventListener("load", () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const selectedText = window.getSelection().toString()
    if (selectedText) {
      const result = (() => {
        switch (message.command) {
          case "copy-for-reference-in-mail":
            return create_reference_for_mail(
              message.title,
              message.url,
              selectedText
            )
          case "copy-for-reference-in-markdown":
            return create_reference_for_markdown(
              message.title,
              message.url,
              selectedText
            )
        }
      })()
      navigator.clipboard.writeText(result)
    }
  })
  chrome.runtime.sendMessage({
    type: "contextMenu",
    command: "on-load"
  })
})
