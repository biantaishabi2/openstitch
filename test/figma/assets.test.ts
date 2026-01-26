import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { FigmaNode } from '../../src/figma/types';
import { collectAssetNodeIds, resolveAssetsViaFigma } from '../../src/figma/assets';

describe('Figma Asset Resolution', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('collects likely asset node ids', () => {
    const nodes: FigmaNode[] = [
      {
        id: 'img',
        name: 'hero',
        type: 'RECTANGLE',
        absoluteBoundingBox: { x: 0, y: 0, width: 400, height: 240 },
        fills: [{ type: 'IMAGE' }],
      },
      {
        id: 'icon',
        name: 'Settings',
        type: 'VECTOR',
        absoluteBoundingBox: { x: 0, y: 0, width: 24, height: 24 },
      },
      {
        id: 'frame',
        name: 'big frame',
        type: 'FRAME',
        absoluteBoundingBox: { x: 0, y: 0, width: 800, height: 600 },
        children: [
          {
            id: 'child',
            name: 'child',
            type: 'RECTANGLE',
            absoluteBoundingBox: { x: 0, y: 0, width: 10, height: 10 },
          },
        ],
      },
    ];

    const ids = collectAssetNodeIds(nodes);
    expect(ids).toContain('img');
    expect(ids).toContain('icon');
    expect(ids).not.toContain('frame');
  });

  it('resolves asset urls via figma images endpoint', async () => {
    const nodes: FigmaNode[] = [
      {
        id: 'icon',
        name: 'icon',
        type: 'VECTOR',
        absoluteBoundingBox: { x: 0, y: 0, width: 24, height: 24 },
      },
    ];

    const mockFetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        images: {
          icon: 'https://figma.test/icon.svg',
        },
      }),
    })) as unknown as typeof fetch;

    global.fetch = mockFetch;

    const result = await resolveAssetsViaFigma(nodes, {
      fileKey: 'FILE_KEY',
      figmaToken: 'TOKEN',
      format: 'svg',
      apiBaseUrl: 'https://api.figma.com/v1',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.byNodeId.get('icon')).toBe('https://figma.test/icon.svg');
    expect(result.warnings).toHaveLength(0);
  });
});

