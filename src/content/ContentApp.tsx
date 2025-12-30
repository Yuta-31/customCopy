import { useEffect, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { contentLogger } from './lib/logger'
import type { Message } from '@/types'

export const ContentApp = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Detect system/page theme
    const detectTheme = () => {
      const isDark = 
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(isDark ? 'dark' : 'light')
    }

    detectTheme()

    // Watch for theme changes
    const observer = new MutationObserver(detectTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    })

    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => detectTheme()
    mediaQuery.addEventListener('change', handleChange)

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
      observer.disconnect()
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return (
    <div className={theme}>
      <Toaster position="top-right" />
    </div>
  )
}
