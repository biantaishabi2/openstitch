import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractFonts,
  generateGoogleFontsLink,
  generateFontCSS,
  extractIcons,
  exportIconsAsSVG,
  downloadSVGIcons,
  generateIconMapping,
} from '../src/figma/adapter/asset-exporter';
import type { FigmaFile, FigmaNode } from '../src/figma/types';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('Asset Exporter', () => {
  const mockFigmaFile: FigmaFile = {
    name: 'Test Design',
    lastModified: '2024-01-01',
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
              name: 'Frame',
              type: 'FRAME',
              children: [
                // Text nodes with fonts
                {
                  id: '2:3',
                  name: 'Title',
                  type: 'TEXT',
                  characters: 'Hello',
                  style: {
                    fontFamily: 'Roboto',
                    fontWeight: 500,
                    fontSize: 24,
                  },
                },
                {
                  id: '2:4',
                  name: 'Body',
                  type: 'TEXT',
                  characters: 'World',
                  style: {
                    fontFamily: 'Roboto',
                    fontWeight: 400,
                    fontSize: 16,
                  },
                },
                {
                  id: '2:5',
                  name: 'Chinese',
                  type: 'TEXT',
                  characters: '中文',
                  style: {
                    fontFamily: 'PingFang SC',
                    fontWeight: 500,
                    fontSize: 17,
                  },
                },
                // Icon nodes
                {
                  id: '3:6',
                  name: 'icon_福利',
                  type: 'VECTOR',
                  absoluteBoundingBox: { x: 0, y: 0, width: 40, height: 40 },
                },
                {
                  id: '3:7',
                  name: 'icon_user',
                  type: 'VECTOR',
                  absoluteBoundingBox: { x: 0, y: 0, width: 24, height: 24 },
                },
                // Non-icon (too large)
                {
                  id: '3:8',
                  name: 'Background',
                  type: 'VECTOR',
                  absoluteBoundingBox: { x: 0, y: 0, width: 400, height: 400 },
                },
              ],
            },
          ],
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractFonts', () => {
    it('should extract all fonts from the design', () => {
      const fonts = extractFonts(mockFigmaFile);

      expect(fonts).toHaveLength(2);
      
      const roboto = fonts.find(f => f.family === 'Roboto');
      expect(roboto).toBeDefined();
      expect(roboto?.weights).toContain(400);
      expect(roboto?.weights).toContain(500);
      expect(roboto?.sizes).toContain(16);
      expect(roboto?.sizes).toContain(24);

      const pingfang = fonts.find(f => f.family === 'PingFang SC');
      expect(pingfang).toBeDefined();
      expect(pingfang?.weights).toContain(500);
    });

    it('should return empty array for no fonts', () => {
      const emptyFile: FigmaFile = {
        name: 'Empty',
        lastModified: '',
        document: {
          id: '0:0',
          name: 'Document',
          type: 'DOCUMENT',
        },
      };

      const fonts = extractFonts(emptyFile);
      expect(fonts).toHaveLength(0);
    });
  });

  describe('generateGoogleFontsLink', () => {
    it('should generate correct Google Fonts URL', () => {
      const fonts = [
        { family: 'Roboto', weights: [400, 500], sizes: [16] },
        { family: 'Open Sans', weights: [400], sizes: [14] },
      ];

      const url = generateGoogleFontsLink(fonts);

      expect(url).toContain('family=Roboto:wght@400,500');
      expect(url).toContain('family=Open+Sans:wght@400');
      expect(url).toContain('display=swap');
    });

    it('should handle empty fonts array', () => {
      const url = generateGoogleFontsLink([]);
      expect(url).toBe('');
    });
  });

  describe('generateFontCSS', () => {
    it('should generate CSS with imports and variables', () => {
      const fonts = [
        { family: 'Roboto', weights: [400, 500], sizes: [16] },
      ];

      const css = generateFontCSS(fonts);

      expect(css).toContain('@import url');
      expect(css).toContain('Roboto');
      expect(css).toContain('--font-roboto');
    });
  });

  describe('extractIcons', () => {
    it('should extract icons with reasonable sizes', () => {
      const icons = extractIcons(mockFigmaFile);

      // Should find the two icons (40x40 and 24x24)
      expect(icons).toHaveLength(2);
      
      const iconNames = icons.map(i => i.name);
      expect(iconNames).toContain('icon_福利');
      expect(iconNames).toContain('icon_user');
      
      // Should NOT include the large background (400x400)
      expect(iconNames).not.toContain('Background');
    });

    it('should include icon metadata', () => {
      const icons = extractIcons(mockFigmaFile);
      const icon = icons.find(i => i.name === 'icon_福利');

      expect(icon).toBeDefined();
      expect(icon?.id).toBe('3:6');
      expect(icon?.path).toContain('icon_福利');
    });
  });

  describe('generateIconMapping', () => {
    it('should map icons to Lucide names', () => {
      const icons = [
        { id: '1', name: 'icon_福利', path: '/a', node: {} as FigmaNode },
        { id: '2', name: 'icon_用户注册', path: '/b', node: {} as FigmaNode },
        { id: '3', name: 'icon_新闻动态', path: '/c', node: {} as FigmaNode },
        { id: '4', name: 'unknown_icon', path: '/d', node: {} as FigmaNode },
      ];

      const mapping = generateIconMapping(icons);

      expect(mapping['icon_福利']).toBe('gift');
      expect(mapping['icon_用户注册']).toBe('user-plus'); // 更长的关键词优先匹配
      expect(mapping['icon_新闻动态']).toBe('newspaper');
      expect(mapping['unknown_icon']).toBe('circle'); // default
    });
  });

  describe('exportIconsAsSVG', () => {
    it('should export icons via Figma API', async () => {
      const icons = [
        { id: '3:6', name: 'icon_福利', path: '/a', node: {} as FigmaNode },
        { id: '3:7', name: 'icon_user', path: '/b', node: {} as FigmaNode },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          images: {
            '3:6': 'https://example.com/icon1.svg',
            '3:7': 'https://example.com/icon2.svg',
          },
        }),
      } as Response);

      const result = await exportIconsAsSVG(icons, {
        fileKey: 'test-key',
        figmaToken: 'test-token',
      });

      expect(result['icon_福利']).toBe('https://example.com/icon1.svg');
      expect(result['icon_user']).toBe('https://example.com/icon2.svg');

      // Verify API call
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/images/test-key'),
        expect.objectContaining({
          headers: { 'X-Figma-Token': 'test-token' },
        })
      );
    });

    it('should handle API failure gracefully', async () => {
      const icons = [
        { id: '3:6', name: 'icon_福利', path: '/a', node: {} as FigmaNode },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 429,
      } as Response);

      const result = await exportIconsAsSVG(icons, {
        fileKey: 'test-key',
        figmaToken: 'test-token',
      });

      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('downloadSVGIcons', () => {
    it('should download and save SVG files', async () => {
      const iconUrls = {
        'icon_福利': 'https://example.com/fuli.svg',
        'icon_user': 'https://example.com/user.svg',
      };

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<svg>福利</svg>',
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<svg>user</svg>',
        } as Response);

      const { writeFile } = await import('fs/promises');
      const downloaded = await downloadSVGIcons(iconUrls, './icons');

      expect(downloaded).toHaveLength(2);
      expect(writeFile).toHaveBeenCalledTimes(2);
      // 文件名会被清理（移除特殊字符）
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('icon___.svg'), // icon_福利 -> icon___.svg
        '<svg>福利</svg>'
      );
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('icon_user.svg'),
        '<svg>user</svg>'
      );
    });
  });
});
