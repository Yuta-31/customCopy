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

/**
 * Extract section heading from URL hash fragment
 * @param url - The URL to extract section heading from
 * @returns Decoded section heading text or empty string if no hash exists
 * 
 * Examples:
 * - "https://example.com#section-heading" -> "section-heading"
 * - "https://example.com#%E3%82%BB%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3" -> "セクション"
 * - "https://example.com" -> ""
 */
export const extractSectionHeading = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const hash = urlObj.hash;
    
    if (!hash || hash === '#') {
      return '';
    }
    
    // Remove the leading '#' and decode the URI component
    const sectionId = hash.substring(1);
    return decodeURIComponent(sectionId);
  } catch (error) {
    urlLogger.error('Failed to extract section heading:', error);
    return '';
  }
};

export const stripQuery = (url: string): string => {
  try {
    const urlObj = new URL(url);
    urlObj.search = '';
    return urlObj.toString();
  } catch (error) {
    urlLogger.error('Failed to strip query:', error);
    return url;
  }
};
