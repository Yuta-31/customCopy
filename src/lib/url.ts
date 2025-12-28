import Logger from '@/lib/logger';

const urlLogger = new Logger({ prefix: '[URL]' });

/**
 * Transform URL using a regular expression pattern and replacement string
 * @param rawUrl - The URL to transform
 * @param pattern - Regular expression pattern (as string)
 * @param replacement - Replacement string (can use $1, $2, etc. for capture groups)
 * @returns Transformed URL or original URL if transformation fails
 * 
 * Example for Microsoft Support URLs:
 * pattern: "^(https://support\\.microsoft\\.com/[^/]+/[^/]+/).*?([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$"
 * replacement: "$1$2"
 * 
 * This will transform:
 * https://support.microsoft.com/ja-jp/office/microsoft-teams...-88ed0a06-6b59-43a3-8cf7-40c01f2f92f2
 * to:
 * https://support.microsoft.com/ja-jp/office/88ed0a06-6b59-43a3-8cf7-40c01f2f92f2
 */
export const transformUrl = (rawUrl: string, pattern: string, replacement: string): string => {
  try {
    if (!pattern || replacement === undefined || replacement === null) {
      return rawUrl
    }
    
    // Create regex from pattern string
    const regex = new RegExp(pattern, 'i')
    
    // Check if the URL matches the pattern
    if (!regex.test(rawUrl)) {
      return rawUrl
    }
    
    // Apply the transformation
    return rawUrl.replace(regex, replacement)
  } catch (error) {
    // If regex is invalid or transformation fails, return original URL
    urlLogger.error('URL transformation failed:', error)
    return rawUrl
  }
}
