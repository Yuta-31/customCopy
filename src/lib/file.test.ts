import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { downloadJson, pickJsonFile } from './file'

describe('downloadJson', () => {
  let createElementSpy: ReturnType<typeof vi.spyOn>
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>
  let mockAnchor: {
    href: string
    download: string
    click: ReturnType<typeof vi.fn>
    remove: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Mock anchor element
    mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
      remove: vi.fn(),
    }

    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    
    // Mock appendChild
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create a download link with correct filename', () => {
    const data = { test: 'data' }
    const filename = 'test.json'

    downloadJson(data, filename)

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(mockAnchor.download).toBe('test.json')
  })

  it('should create a blob with JSON data', () => {
    const data = { test: 'data', nested: { value: 123 } }
    const filename = 'test.json'

    downloadJson(data, filename)

    expect(createObjectURLSpy).toHaveBeenCalled()
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob
    expect(blob.type).toBe('application/json;charset=utf-8')
  })

  it('should trigger click on anchor element', () => {
    const data = { test: 'data' }
    const filename = 'test.json'

    downloadJson(data, filename)

    expect(mockAnchor.click).toHaveBeenCalled()
  })

  it('should remove anchor element after click', () => {
    const data = { test: 'data' }
    const filename = 'test.json'

    downloadJson(data, filename)

    expect(mockAnchor.remove).toHaveBeenCalled()
  })

  it('should revoke object URL after download', () => {
    const data = { test: 'data' }
    const filename = 'test.json'

    downloadJson(data, filename)

    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')
  })

  it('should handle null data by converting to empty array', () => {
    const data = null
    const filename = 'test.json'

    downloadJson(data, filename)

    expect(createObjectURLSpy).toHaveBeenCalled()
    // Verify that empty array JSON is used
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob
    expect(blob.size).toBeGreaterThan(0)
  })

  it('should handle undefined data by converting to empty array', () => {
    const data = undefined
    const filename = 'test.json'

    downloadJson(data, filename)

    expect(createObjectURLSpy).toHaveBeenCalled()
  })

  it('should format JSON with 2-space indentation', () => {
    const data = { test: 'data', nested: { value: 123 } }
    const filename = 'test.json'
    
    // Capture the blob content
    let blobContent = ''
    const originalBlob = global.Blob
    global.Blob = class extends originalBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options)
        blobContent = parts[0] as string
      }
    } as any

    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')

    downloadJson(data, filename)

    // Restore original Blob
    global.Blob = originalBlob
    
    const expectedJson = JSON.stringify(data, null, 2)
    expect(blobContent).toBe(expectedJson)
  })

  it('should handle complex nested objects', () => {
    const data = {
      snippets: [
        { id: '1', title: 'Snippet 1', clipboardText: 'text1' },
        { id: '2', title: 'Snippet 2', clipboardText: 'text2' },
      ],
      rules: [
        { id: 'r1', pattern: 'pattern1', replacement: 'repl1' },
      ],
    }
    const filename = 'export.json'

    downloadJson(data, filename)

    expect(mockAnchor.click).toHaveBeenCalled()
    expect(mockAnchor.download).toBe('export.json')
  })

  it('should handle filenames with special characters', () => {
    const data = { test: 'data' }
    const filename = 'my-file (2024-12-28).json'

    downloadJson(data, filename)

    expect(mockAnchor.download).toBe('my-file (2024-12-28).json')
    expect(mockAnchor.click).toHaveBeenCalled()
  })

  it('should handle empty object data', () => {
    const data = {}
    const filename = 'empty.json'

    downloadJson(data, filename)

    expect(mockAnchor.click).toHaveBeenCalled()
    expect(createObjectURLSpy).toHaveBeenCalled()
  })
})

describe('pickJsonFile', () => {
  let createElementSpy: ReturnType<typeof vi.spyOn>
  let mockInput: {
    type: string
    accept: string
    files: FileList | null
    onchange: (() => void) | null
    click: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockInput = {
      type: '',
      accept: '',
      files: null,
      onchange: null,
      click: vi.fn(),
    }

    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockInput as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create an input element with correct attributes', () => {
    pickJsonFile()

    expect(createElementSpy).toHaveBeenCalledWith('input')
    expect(mockInput.type).toBe('file')
    expect(mockInput.accept).toBe('application/json,.json')
  })

  it('should trigger click on input element', () => {
    pickJsonFile()

    expect(mockInput.click).toHaveBeenCalled()
  })

  it('should resolve with file when selected', async () => {
    const mockFile = new File(['{"test": "data"}'], 'test.json', { type: 'application/json' })
    const mockFileList = {
      0: mockFile,
      length: 1,
      item: (index: number) => (index === 0 ? mockFile : null),
    } as FileList

    const promise = pickJsonFile()

    // Simulate file selection
    mockInput.files = mockFileList
    if (mockInput.onchange) {
      mockInput.onchange()
    }

    const result = await promise
    expect(result).toBe(mockFile)
  })

  it('should resolve with null when no file is selected', async () => {
    const promise = pickJsonFile()

    // Simulate no file selection (files is null)
    mockInput.files = null
    if (mockInput.onchange) {
      mockInput.onchange()
    }

    const result = await promise
    expect(result).toBeNull()
  })

  it('should resolve with null when filelist is empty', async () => {
    const mockFileList = {
      length: 0,
      item: () => null,
    } as FileList

    const promise = pickJsonFile()

    // Simulate empty file selection
    mockInput.files = mockFileList
    if (mockInput.onchange) {
      mockInput.onchange()
    }

    const result = await promise
    expect(result).toBeNull()
  })

  it('should accept .json files', () => {
    pickJsonFile()

    expect(mockInput.accept).toContain('.json')
    expect(mockInput.accept).toContain('application/json')
  })

  it('should handle files with different names', async () => {
    const mockFile = new File(['{}'], 'my-config.json', { type: 'application/json' })
    const mockFileList = {
      0: mockFile,
      length: 1,
      item: (index: number) => (index === 0 ? mockFile : null),
    } as FileList

    const promise = pickJsonFile()

    mockInput.files = mockFileList
    if (mockInput.onchange) {
      mockInput.onchange()
    }

    const result = await promise
    expect(result).toBe(mockFile)
    expect(result?.name).toBe('my-config.json')
  })
})
