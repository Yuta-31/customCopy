import { describe, it, expect } from 'vitest'
import { transformUrl } from './url'

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
      const replacement = null as any
      const result = transformUrl(url, pattern, replacement)
      expect(result).toBe('https://example.com')
    })

    it('should return original URL if replacement is undefined', () => {
      const url = 'https://example.com'
      const pattern = '^https://'
      const replacement = undefined as any
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
