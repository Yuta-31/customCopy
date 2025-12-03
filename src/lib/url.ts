export const stripQuery = (rawUrl: string): string => {
  try {
    const url = new URL(rawUrl)
    url.search = ""
    return url.toString()
  } catch {
    return rawUrl
  }
}
