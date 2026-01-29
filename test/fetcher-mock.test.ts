import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchFigmaFile,
  downloadFigmaData,
  saveFigmaJson,
  downloadImage,
  type FigmaFetcherOptions,
} from '../src/figma/adapter/fetcher';
import type { FigmaFile } from '../src/figma/types';
import { mkdir, writeFile, readFile } from 'fs/promises';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  readFile: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('fetchFigmaFile', () => {
  const mockOptions: FigmaFetcherOptions = {
    fileKey: 'test-file-key',
    figmaToken: 'test-token',
  };

  const mockFigmaFile: FigmaFile = {
    name: 'Test Design',
    lastModified: '2024-01-01T00:00:00Z',
    document: {
      id: '0:0',
      name: 'Document',
      type: 'DOCUMENT',
      children: [
        {
          id: '0:1',
          name: 'Page 1',
          type: 'CANVAS',
          children: [
            {
              id: '1:2',
              name: 'Frame 1',
              type: 'FRAME',
            },
          ],
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch Figma file successfully', async () => {
    // Mock file API response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFigmaFile,
    } as Response);

    // Mock image API response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        images: {
          '1:2': 'https://example.com/screenshot.png',
        },
      }),
    } as Response);

    const result = await fetchFigmaFile(mockOptions);

    expect(result.figmaFile).toEqual(mockFigmaFile);
    expect(result.screenshotUrl).toBe('https://example.com/screenshot.png');
    expect(result.warnings).toHaveLength(0);

    // Verify API calls
    expect(fetch).toHaveBeenCalledWith(
      'https://api.figma.com/v1/files/test-file-key',
      expect.objectContaining({
        headers: { 'X-Figma-Token': 'test-token' },
      })
    );

    expect(fetch).toHaveBeenCalledWith(
      'https://api.figma.com/v1/images/test-file-key?ids=1:2&format=png&scale=2',
      expect.objectContaining({
        headers: { 'X-Figma-Token': 'test-token' },
      })
    );
  });

  it('should handle screenshot API failure gracefully', async () => {
    // Mock file API response
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFigmaFile,
    } as Response);

    // Mock image API failure
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
    } as Response);

    const result = await fetchFigmaFile(mockOptions);

    expect(result.figmaFile).toEqual(mockFigmaFile);
    expect(result.screenshotUrl).toBeUndefined();
    expect(result.warnings).toContain('Failed to fetch screenshot: 429');
  });

  it('should handle missing canvas', async () => {
    const fileWithoutCanvas: FigmaFile = {
      ...mockFigmaFile,
      document: {
        ...mockFigmaFile.document,
        children: [],
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => fileWithoutCanvas,
    } as Response);

    const result = await fetchFigmaFile(mockOptions);

    expect(result.figmaFile).toEqual(fileWithoutCanvas);
    expect(result.screenshotUrl).toBeUndefined();
    expect(result.warnings).toContain('No suitable node found for screenshot');
  });

  it('should throw error when file API fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    await expect(fetchFigmaFile(mockOptions)).rejects.toThrow(
      'Failed to fetch Figma file: 404 Not Found'
    );
  });
});

describe('downloadFigmaData', () => {
  const mockOptions = {
    fileKey: 'test-file-key',
    figmaToken: 'test-token',
    outputDir: './test-output',
  };

  const mockFigmaFile: FigmaFile = {
    name: 'Test Design',
    lastModified: '2024-01-01T00:00:00Z',
    document: {
      id: '0:0',
      name: 'Document',
      type: 'DOCUMENT',
      children: [
        {
          id: '0:1',
          name: 'Page 1',
          type: 'CANVAS',
          children: [
            {
              id: '1:2',
              name: 'Frame 1',
              type: 'FRAME',
            },
          ],
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should download and save Figma data successfully', async () => {
    // Mock file API
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFigmaFile,
    } as Response);

    // Mock image API
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        images: {
          '1:2': 'https://example.com/screenshot.png',
        },
      }),
    } as Response);

    // Mock image download
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    } as Response);

    const result = await downloadFigmaData(mockOptions);

    // Verify directory creation
    expect(mkdir).toHaveBeenCalledWith('./test-output', { recursive: true });

    // Verify JSON saved
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining('figma.json'),
      JSON.stringify(mockFigmaFile, null, 2)
    );

    // Verify screenshot saved
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining('figma-design.png'),
      expect.any(Buffer)
    );

    expect(result.jsonPath).toContain('figma.json');
    expect(result.screenshotPath).toContain('figma-design.png');
    expect(result.warnings).toHaveLength(0);
  });

  it('should work without screenshot if image API fails', async () => {
    // Mock file API
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFigmaFile,
    } as Response);

    // Mock image API failure
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
    } as Response);

    const result = await downloadFigmaData(mockOptions);

    expect(result.jsonPath).toContain('figma.json');
    expect(result.screenshotPath).toBeUndefined();
    expect(result.warnings).toContain('Failed to fetch screenshot: 429');
  });
});

describe('saveFigmaJson', () => {
  it('should save JSON file', async () => {
    const mockFile: FigmaFile = {
      name: 'Test',
      lastModified: '2024-01-01',
      document: {
        id: '0:0',
        name: 'Document',
        type: 'DOCUMENT',
      },
    };

    await saveFigmaJson(mockFile, './test.json');

    expect(writeFile).toHaveBeenCalledWith(
      './test.json',
      JSON.stringify(mockFile, null, 2)
    );
  });
});

describe('downloadImage', () => {
  it('should download and save image', async () => {
    const mockBuffer = new ArrayBuffer(8);
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => mockBuffer,
    } as Response);

    await downloadImage('https://example.com/image.png', './test.png');

    expect(fetch).toHaveBeenCalledWith('https://example.com/image.png');
    expect(writeFile).toHaveBeenCalledWith('./test.png', expect.any(Buffer));
  });

  it('should throw error on download failure', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    await expect(
      downloadImage('https://example.com/image.png', './test.png')
    ).rejects.toThrow('Failed to download image: 404');
  });
});
