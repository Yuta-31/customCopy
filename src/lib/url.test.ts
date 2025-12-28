import { describe, it, expect } from 'vitest'
import { transformUrl, extractSectionHeading } from './url'

describe('transformUrl', () => {
  describe('basic transformations', () => {
    it('should replace https with http', () => {
      const url = 'https://example.com'
      const pattern = '^https://'
      const replacement = 'http://'
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('http://example.com')
    })

    it('should replace domain name', () => {
      const url = 'https://example.com/path'
      const pattern = 'example\\.com'
      const replacement = 'test.com'
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('https://test.com/path')
    })

    it('should be case-insensitive', () => {
      const url = 'HTTPS://EXAMPLE.COM'
      const pattern = '^https://'
      const replacement = 'http://'
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('http://EXAMPLE.COM')
    })
  })

  describe('capture groups', () => {
    it('should handle capture groups with $1', () => {
      const url = 'https://example.com/user/123'
      const pattern = '^(https://example\\.com)/user/\\d+$'
      const replacement = '$1/users'
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('https://example.com/users')
    })

    it('should handle multiple capture groups', () => {
      const url = 'https://example.com/old/path/file.html'
      const pattern = '^(https://[^/]+)/old/(.*)\\.html$'
      const replacement = '$1/new/$2.php'
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('https://example.com/new/path/file.php')
    })

    it('should handle Microsoft Support URL transformation example', () => {
      const url = 'https://support.microsoft.com/ja-jp/office/microsoft-teams-88ed0a06-6b59-43a3-8cf7-40c01f2f92f2'
      const pattern = '^(https://support\\.microsoft\\.com/[^/]+/[^/]+/).*?([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$'
      const replacement = '$1$2'
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('https://support.microsoft.com/ja-jp/office/88ed0a06-6b59-43a3-8cf7-40c01f2f92f2')
    })
  })

  describe('edge cases', () => {
    it('should return original URL if pattern does not match', () => {
      const url = 'https://example.com'
      const pattern = '^http://' // Does not match https://
      const replacement = 'ftp://'
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('https://example.com')
    })

    it('should return original URL if pattern is empty', () => {
      const url = 'https://example.com'
      const pattern = ''
      const replacement = 'http://'
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('https://example.com')
    })

    it('should return original URL if both pattern and replacement are empty', () => {
      const url = 'https://example.com'
      const pattern = ''
      const replacement = ''
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('https://example.com')
    })

    it('should return original URL if replacement is null', () => {
      const url = 'https://example.com'
      const pattern = '^https://'
      const replacement = null
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('https://example.com')
    })

    it('should return original URL if replacement is undefined', () => {
      const url = 'https://example.com'
      const pattern = '^https://'
      const replacement = undefined
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('https://example.com')
    })

    it('should handle empty URL string', () => {
      const url = ''
      const pattern = '^https://'
      const replacement = 'http://'
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('')
    })

    it('should return original URL if regex is invalid', () => {
      const url = 'https://example.com'
      const pattern = '[invalid(regex'
      const replacement = 'http://'
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('https://example.com')
    })
  })

  describe('complex patterns', () => {
    it('should remove query parameters using regex', () => {
      const url = 'https://example.com/path?foo=bar&baz=qux'
      const pattern = "\\?.*$"
      const replacement = ''
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('https://example.com/path')
    })

    it('should extract and reformat path segments', () => {
      const url = 'https://github.com/user/repo/issues/123'
      const pattern = '^(https://github\\.com/[^/]+/[^/]+)/issues/(\\d+)$'
      const replacement = '$1/pull/$2'
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('https://github.com/user/repo/pull/123')
    })

    it('should handle special characters in replacement', () => {
      const url = 'https://example.com/path'
      const pattern = '/path$'
      const replacement = '/new$path'
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('https://example.com/new$path')
    })
  })
})

describe('extractSectionHeading', () => {
  describe('basic extraction', () => {
    it('should extract simple section heading from hash', () => {
      const url = 'https://example.com#section-heading'
      const result = extractSectionHeading(url)
      expect(result).toBe('section-heading')
    })

    it('should extract section with underscores', () => {
      const url = 'https://example.com/page#my_section_id'
      const result = extractSectionHeading(url)
      expect(result).toBe('my_section_id')
    })

    it('should extract section with numbers', () => {
      const url = 'https://example.com#section-123'
      const result = extractSectionHeading(url)
      expect(result).toBe('section-123')
    })
  })

  describe('URL encoding', () => {
    it('should decode URL-encoded section heading', () => {
      const url = 'https://example.com#%E3%82%BB%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3'
      const result = extractSectionHeading(url)
      expect(result).toBe('セクション')
    })

    it('should decode section with spaces encoded as %20', () => {
      const url = 'https://example.com#my%20section%20heading'
      const result = extractSectionHeading(url)
      expect(result).toBe('my section heading')
    })

    it('should decode mixed ASCII and encoded characters', () => {
      const url = 'https://example.com#Section_%E8%A6%8B%E5%87%BA%E3%81%97'
      const result = extractSectionHeading(url)
      expect(result).toBe('Section_見出し')
    })
  })

  describe('edge cases', () => {
    it('should return empty string for URL without hash', () => {
      const url = 'https://example.com/path'
      const result = extractSectionHeading(url)
      expect(result).toBe('')
    })

    it('should return empty string for URL with empty hash', () => {
      const url = 'https://example.com#'
      const result = extractSectionHeading(url)
      expect(result).toBe('')
    })

    it('should handle URL with query parameters and hash', () => {
      const url = 'https://example.com?foo=bar#section'
      const result = extractSectionHeading(url)
      expect(result).toBe('section')
    })

    it('should handle complex URL with path, query, and hash', () => {
      const url = 'https://example.com/path/to/page?param=value#my-section'
      const result = extractSectionHeading(url)
      expect(result).toBe('my-section')
    })

    it('should return empty string for invalid URL', () => {
      const url = 'not-a-valid-url'
      const result = extractSectionHeading(url)
      expect(result).toBe('')
    })

    it('should handle hash with special characters', () => {
      const url = 'https://example.com#section:subsection'
      const result = extractSectionHeading(url)
      expect(result).toBe('section:subsection')
    })
  })
})

