import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { contentLogger } from './lib/logger'
import type { Message } from '@/types'

export const ContentApp = () => {
  useEffect(() => {
    const messageListener = (
      message: Message,
      _sender: chrome.runtime.MessageSender,
      _sendResponse: (response?: unknown) => void
    ) => {
      if (message.type === 'contextMenu' && message.command === 'on-click') {
        if (message.data?.replacedText) {
          const result = message.data.replacedText
          const snippetTitle = message.data.snippetTitle || 'Snippet'
          navigator.clipboard
            .writeText(result)
            .then(() => {
              contentLogger.info('Text copied to clipboard', { text: result, snippetTitle })
              toast.success(`Copied: ${snippetTitle}`, {
                duration: 2000,
                position: 'top-right',
              })
            })
            .catch((error) => {
              contentLogger.error('Failed to copy text to clipboard', error)
              toast.error('Failed to copy', {
                duration: 2000,
                position: 'top-right',
              })
            })
        }
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: '#7c3aed',
          color: 'white',
          border: 'none',
        },
      }}
    />
  )
}
