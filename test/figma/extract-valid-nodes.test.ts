/**
 * extractValidNodes 函数测试
 * 测试是否正确过滤 CANVAS 下的独立元素（如参考图片）
 */

import { describe, it, expect } from 'vitest';
import { extractValidNodes } from '../../src/figma/inferrers';
import type { FigmaFile, FigmaNode } from '../../src/figma/types';

// 创建一个模拟的 Figma 文件结构，包含 CANVAS 下的独立图片
function createMockFigmaFile(): FigmaFile {
  return {
    name: 'Test File',
    lastModified: '2024-01-01T00:00:00Z',
    thumbnailUrl: '',
    version: '1',
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
            // 真正的设计稿 - FRAME 节点（应该被包含）
            {
              id: '1:1',
              name: '设计稿首页',
              type: 'FRAME',
              absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 812 },
              children: [
                {
                  id: '1:2',
                  name: '标题',
                  type: 'TEXT',
                  characters: '首页',
                },
              ],
            },
            // 独立的参考图片 - RECTANGLE 节点（应该被忽略）
            {
              id: '2:1',
              name: '21551757925570_.pic 1',
              type: 'RECTANGLE',
              absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 812 },
              fills: [{ type: 'IMAGE', imageRef: 'abc123' }],
            },
            // 另一个独立的参考图片（应该被忽略）
            {
              id: '2:2',
              name: 'WechatIMG2084 1',
              type: 'RECTANGLE',
              absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 1172 },
              fills: [{ type: 'IMAGE', imageRef: 'def456' }],
            },
            // 另一个 FRAME 设计稿（应该被包含）
            {
              id: '3:1',
              name: '设计稿详情页',
              type: 'FRAME',
              absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 812 },
              children: [],
            },
          ],
        },
      ],
    },
  };
}

describe('extractValidNodes', () => {
  it('应该只包含 FRAME 节点，忽略 CANVAS 下的独立图片', () => {
    const mockFile = createMockFigmaFile();
    const nodes = extractValidNodes(mockFile.document);

    // 检查节点数量：应该只有 FRAME 及其子节点
    const nodeNames = nodes.map(n => n.name);
    
    // 应该包含 FRAME 节点
    expect(nodeNames).toContain('设计稿首页');
    expect(nodeNames).toContain('设计稿详情页');
    
    // 应该包含 FRAME 的子节点
    expect(nodeNames).toContain('标题');
    
    // 不应该包含 CANVAS 下的独立 RECTANGLE 图片
    expect(nodeNames).not.toContain('21551757925570_.pic 1');
    expect(nodeNames).not.toContain('WechatIMG2084 1');
  });

  it('应该正确处理嵌套的 FRAME 结构', () => {
    const mockFile = createMockFigmaFile();
    const nodes = extractValidNodes(mockFile.document);

    // 找到"设计稿首页" FRAME
    const mainFrame = nodes.find(n => n.name === '设计稿首页');
    expect(mainFrame).toBeDefined();
    expect(mainFrame?.type).toBe('FRAME');

    // 找到"标题" TEXT（作为子节点）
    const titleNode = nodes.find(n => n.name === '标题');
    expect(titleNode).toBeDefined();
    expect(titleNode?.type).toBe('TEXT');
  });

  it('应该处理多个 CANVAS 的情况', () => {
    const mockFile = createMockFigmaFile();
    
    // 添加第二个 CANVAS
    mockFile.document.children?.push({
      id: '0:2',
      name: 'Page 2',
      type: 'CANVAS',
      children: [
        {
          id: '4:1',
          name: 'Page2 设计稿',
          type: 'FRAME',
          absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 812 },
          children: [],
        },
        {
          id: '4:2',
          name: 'Page2 参考图',
          type: 'RECTANGLE',
          absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 812 },
          fills: [{ type: 'IMAGE', imageRef: 'ghi789' }],
        },
      ],
    });

    const nodes = extractValidNodes(mockFile.document);
    const nodeNames = nodes.map(n => n.name);

    // 应该包含两个 CANVAS 中的 FRAME
    expect(nodeNames).toContain('设计稿首页');
    expect(nodeNames).toContain('设计稿详情页');
    expect(nodeNames).toContain('Page2 设计稿');

    // 不应该包含任何独立的 RECTANGLE
    expect(nodeNames).not.toContain('21551757925570_.pic 1');
    expect(nodeNames).not.toContain('WechatIMG2084 1');
    expect(nodeNames).not.toContain('Page2 参考图');
  });

  it('应该正确处理空 CANVAS', () => {
    const emptyFile: FigmaFile = {
      name: 'Empty File',
      lastModified: '2024-01-01T00:00:00Z',
      thumbnailUrl: '',
      version: '1',
      document: {
        id: '0:0',
        name: 'Document',
        type: 'DOCUMENT',
        children: [
          {
            id: '0:1',
            name: 'Empty Page',
            type: 'CANVAS',
            children: [],
          },
        ],
      },
    };

    const nodes = extractValidNodes(emptyFile.document);
    expect(nodes).toHaveLength(0);
  });

  it('应该正确处理只有独立图片没有 FRAME 的情况', () => {
    const onlyImagesFile: FigmaFile = {
      name: 'Only Images',
      lastModified: '2024-01-01T00:00:00Z',
      thumbnailUrl: '',
      version: '1',
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
                id: '1:1',
                name: '参考图1',
                type: 'RECTANGLE',
                absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 812 },
                fills: [{ type: 'IMAGE', imageRef: 'img1' }],
              },
              {
                id: '1:2',
                name: '参考图2',
                type: 'RECTANGLE',
                absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 812 },
                fills: [{ type: 'IMAGE', imageRef: 'img2' }],
              },
            ],
          },
        ],
      },
    };

    const nodes = extractValidNodes(onlyImagesFile.document);
    expect(nodes).toHaveLength(0);
  });
});
