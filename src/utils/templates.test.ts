import { describe, it, expect } from 'vitest'
import { create_reference_for_mail, create_reference_for_markdown } from './templates'

describe('create_reference_for_mail', () => {
  it('should create a mail reference with all fields', () => {
    const title = 'Example Article'
    const url = 'https://example.com/article'
    const selectionText = 'This is the selected text.'

    const result = create_reference_for_mail(title, url, selectionText)

    expect(result).toContain('<参考情報>')
    expect(result).toContain('Title: Example Article')
    expect(result).toContain('URL: https://example.com/article')
    expect(result).toContain('該当部分:')
    expect(result).toContain('This is the selected text.')
    expect(result).toContain('---')
  })

  it('should handle empty title', () => {
    const title = ''
    const url = 'https://example.com'
    const selectionText = 'Selected text'

    const result = create_reference_for_mail(title, url, selectionText)

    expect(result).toContain('Title: ')
    expect(result).toContain('URL: https://example.com')
    expect(result).toContain('該当部分:')
    expect(result).toContain('Selected text')
  })

  it('should handle empty selection text', () => {
    const title = 'Article Title'
    const url = 'https://example.com'
    const selectionText = ''

    const result = create_reference_for_mail(title, url, selectionText)

    expect(result).toContain('Title: Article Title')
    expect(result).toContain('URL: https://example.com')
    expect(result).toContain('該当部分:')
  })

  it('should handle multiline selection text', () => {
    const title = 'Article Title'
    const url = 'https://example.com'
    const selectionText = 'Line 1\nLine 2\nLine 3'

    const result = create_reference_for_mail(title, url, selectionText)

    expect(result).toContain('Title: Article Title')
    expect(result).toContain('URL: https://example.com')
    expect(result).toContain('Line 1\nLine 2\nLine 3')
  })

  it('should handle special characters in text', () => {
    const title = 'Article with "quotes" & <tags>'
    const url = 'https://example.com?param=value&other=123'
    const selectionText = 'Text with special chars: @#$%^&*()'

    const result = create_reference_for_mail(title, url, selectionText)

    expect(result).toContain('Title: Article with "quotes" & <tags>')
    expect(result).toContain('URL: https://example.com?param=value&other=123')
    expect(result).toContain('Text with special chars: @#$%^&*()')
  })
})

describe('create_reference_for_markdown', () => {
  it('should create a markdown reference with all fields', () => {
    const title = 'Example Article'
    const url = 'https://example.com/article'
    const selectionText = 'This is the selected text.'

    const result = create_reference_for_markdown(title, url, selectionText)

    expect(result).toContain('[Example Article](https://example.com/article)')
    expect(result).toContain('> This is the selected text.')
  })

  it('should format as a valid markdown link', () => {
    const title = 'GitHub'
    const url = 'https://github.com'
    const selectionText = 'GitHub is a platform for developers.'

    const result = create_reference_for_markdown(title, url, selectionText)

    expect(result).toMatch(/\[GitHub\]\(https:\/\/github\.com\)/)
    expect(result).toMatch(/> GitHub is a platform for developers\./)
  })

  it('should handle empty title', () => {
    const title = ''
    const url = 'https://example.com'
    const selectionText = 'Selected text'

    const result = create_reference_for_markdown(title, url, selectionText)

    expect(result).toContain('[](https://example.com)')
    expect(result).toContain('> Selected text')
  })

  it('should handle empty selection text', () => {
    const title = 'Article Title'
    const url = 'https://example.com'
    const selectionText = ''

    const result = create_reference_for_markdown(title, url, selectionText)

    expect(result).toContain('[Article Title](https://example.com)')
    expect(result).toContain('> ')
  })

  it('should handle multiline selection text', () => {
    const title = 'Article Title'
    const url = 'https://example.com'
    const selectionText = 'Line 1\nLine 2\nLine 3'

    const result = create_reference_for_markdown(title, url, selectionText)

    expect(result).toContain('[Article Title](https://example.com)')
    expect(result).toContain('> Line 1\nLine 2\nLine 3')
  })

  it('should handle special markdown characters', () => {
    const title = 'Article [with] *special* chars'
    const url = 'https://example.com'
    const selectionText = 'Text with **bold** and _italic_'

    const result = create_reference_for_markdown(title, url, selectionText)

    expect(result).toContain('[Article [with] *special* chars](https://example.com)')
    expect(result).toContain('> Text with **bold** and _italic_')
  })

  it('should handle URLs with query parameters', () => {
    const title = 'Search Results'
    const url = 'https://example.com/search?q=test&page=1'
    const selectionText = 'Found results'

    const result = create_reference_for_markdown(title, url, selectionText)

    expect(result).toContain('[Search Results](https://example.com/search?q=test&page=1)')
    expect(result).toContain('> Found results')
  })
})
