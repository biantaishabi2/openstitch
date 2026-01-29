import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadFigmaData } from '../src/figma/adapter/fetcher';
import type { FigmaFile } from '../src/figma/types';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  readFile: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('Figma download workflow integration', () => {
  const mockFigmaFile: FigmaFile = {
    name: '胸科首页',
    lastModified: '2024-01-27T07:24:36Z',
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
              name: '胸科首页',
              type: 'FRAME',
              absoluteBoundingBox: {
                x: 0,
                y: 0,
                width: 375,
                height: 812,
              },
            },
          ],
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full download workflow', async () => {
    // Step 1: Mock file API
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFigmaFile,
    } as Response);

    // Step 2: Mock image API (get screenshot URL)
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        images: {
          '1:2': 'https://s3.figma.com/screenshot-1-2.png',
        },
      }),
    } as Response);

    // Step 3: Mock image download
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => {
        const buffer = new ArrayBuffer(4);
        const view = new Uint8Array(buffer);
        view[0] = 0x89;
        view[1] = 0x50;
        view[2] = 0x4E;
        view[3] = 0x47;
        return buffer;
      },
    } as Response);

    // Execute workflow
    const result = await downloadFigmaData({
      fileKey: 'GgNqIztxMCacqG0u4TnRtm',
      figmaToken: 'figd_test_token',
      outputDir: './test-fixtures/figma-to-stitch-demo',
      screenshotName: 'figma-design.png',
      jsonName: 'figma.json',
    });

    // Verify results
    expect(result.figmaFile.name).toBe('胸科首页');
    expect(result.jsonPath).toContain('figma.json');
    expect(result.screenshotPath).toContain('figma-design.png');
    expect(result.warnings).toHaveLength(0);

    // Verify API call sequence
    const calls = vi.mocked(fetch).mock.calls;
    
    // Call 1: Get file
    expect(calls[0][0]).toBe('https://api.figma.com/v1/files/GgNqIztxMCacqG0u4TnRtm');
    expect((calls[0][1] as any).headers['X-Figma-Token']).toBe('figd_test_token');

    // Call 2: Get image URL
    expect(calls[1][0]).toBe(
      'https://api.figma.com/v1/images/GgNqIztxMCacqG0u4TnRtm?ids=1:2&format=png&scale=2'
    );

    // Call 3: Download image
    expect(calls[2][0]).toBe('https://s3.figma.com/screenshot-1-2.png');
  });

  it('should handle partial failure (file ok, screenshot fails)', async () => {
    // File API succeeds
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFigmaFile,
    } as Response);

    // Image API fails
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
    } as Response);

    const result = await downloadFigmaData({
      fileKey: 'GgNqIztxMCacqG0u4TnRtm',
      figmaToken: 'figd_test_token',
      outputDir: './test-fixtures/figma-to-stitch-demo',
    });

    // Should still return file data
    expect(result.figmaFile).toBeDefined();
    expect(result.jsonPath).toBeDefined();
    
    // But no screenshot
    expect(result.screenshotPath).toBeUndefined();
    expect(result.warnings).toContain('Failed to fetch screenshot: 429');
  });

  it('should create correct directory structure', async () => {
    const { mkdir } = await import('fs/promises');

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFigmaFile,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ images: { '1:2': 'https://example.com/img.png' } }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      } as Response);

    await downloadFigmaData({
      fileKey: 'test-key',
      figmaToken: 'test-token',
      outputDir: './my-project',
    });

    // Verify directory structure creation
    expect(mkdir).toHaveBeenCalledWith('./my-project', { recursive: true });
  });
});

describe('Error handling', () => {
  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    await expect(
      downloadFigmaData({
        fileKey: 'test-key',
        figmaToken: 'test-token',
        outputDir: './test',
      })
    ).rejects.toThrow('Network error');
  });

  it('should handle invalid JSON response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => { throw new Error('Invalid JSON'); },
    } as Response);

    await expect(
      downloadFigmaData({
        fileKey: 'test-key',
        figmaToken: 'test-token',
        outputDir: './test',
      })
    ).rejects.toThrow('Invalid JSON');
  });
});
