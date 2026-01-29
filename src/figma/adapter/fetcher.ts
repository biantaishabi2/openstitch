/**
 * Figma 数据获取器
 *
 * 提供从 Figma API 下载 JSON 和截图的功能
 */

import type { FigmaFile } from '../types';

export interface FigmaFetcherOptions {
  /** Figma 文件 Key */
  fileKey: string;
  /** Figma Token */
  figmaToken: string;
  /** API 基础 URL */
  apiBaseUrl?: string;
}

export interface FigmaFetchResult {
  /** Figma JSON 数据 */
  figmaFile: FigmaFile;
  /** 截图 URL (如果有) */
  screenshotUrl?: string;
  /** 警告信息 */
  warnings: string[];
}

/**
 * 从 Figma API 获取文件数据
 */
export async function fetchFigmaFile(
  options: FigmaFetcherOptions
): Promise<FigmaFetchResult> {
  const { fileKey, figmaToken, apiBaseUrl = 'https://api.figma.com/v1' } = options;
  const warnings: string[] = [];

  // 1. 获取 Figma JSON
  const fileUrl = `${apiBaseUrl}/files/${fileKey}`;
  const fileResponse = await fetch(fileUrl, {
    headers: {
      'X-Figma-Token': figmaToken,
    },
  });

  if (!fileResponse.ok) {
    throw new Error(
      `Failed to fetch Figma file: ${fileResponse.status} ${fileResponse.statusText}`
    );
  }

  const figmaFile = (await fileResponse.json()) as FigmaFile;

  // 2. 获取截图 URL
  // Figma 图片 API 需要指定节点 ID，我们获取第一个画布的第一个节点作为代表
  let screenshotUrl: string | undefined;
  try {
    // 找到第一个 CANVAS 的第一个子节点
    const canvas = figmaFile.document.children?.find(c => c.type === 'CANVAS');
    const firstNode = canvas?.children?.[0];
    
    if (firstNode?.id) {
      const imageUrl = `${apiBaseUrl}/images/${fileKey}?ids=${firstNode.id}&format=png&scale=2`;
      const imageResponse = await fetch(imageUrl, {
        headers: {
          'X-Figma-Token': figmaToken,
        },
      });

      if (imageResponse.ok) {
        const imageData = (await imageResponse.json()) as {
          images?: Record<string, string | null>;
        };
        // 截图 API 返回的是节点 ID 到 URL 的映射
        screenshotUrl = imageData.images?.[firstNode.id] || undefined;
      } else {
        warnings.push(`Failed to fetch screenshot: ${imageResponse.status}`);
      }
    } else {
      warnings.push('No suitable node found for screenshot');
    }
  } catch (error) {
    warnings.push(`Screenshot fetch failed: ${error}`);
  }

  return {
    figmaFile,
    screenshotUrl,
    warnings,
  };
}

/**
 * 下载图片并保存到文件系统
 */
export async function downloadImage(
  imageUrl: string,
  outputPath: string
): Promise<void> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  
  // Node.js 环境
  if (typeof window === 'undefined') {
    const fs = await import('fs/promises');
    await fs.writeFile(outputPath, Buffer.from(buffer));
  } else {
    // 浏览器环境
    throw new Error('downloadImage is not supported in browser environment');
  }
}

/**
 * 保存 Figma JSON 到文件
 */
export async function saveFigmaJson(
  figmaFile: FigmaFile,
  outputPath: string
): Promise<void> {
  // Node.js 环境
  if (typeof window === 'undefined') {
    const fs = await import('fs/promises');
    await fs.writeFile(outputPath, JSON.stringify(figmaFile, null, 2));
  } else {
    // 浏览器环境
    throw new Error('saveFigmaJson is not supported in browser environment');
  }
}

/**
 * 完整的 Figma 数据下载流程
 *
 * @example
 * ```typescript
 * const result = await downloadFigmaData({
 *   fileKey: 'GgNqIztxMCacqG0u4TnRtm',
 *   figmaToken: 'figd_xxxx',
 *   outputDir: './test-fixtures/my-project',
 * });
 * // result.figmaFile - Figma JSON 数据
 * // result.screenshotPath - 截图保存路径
 * ```
 */
export interface DownloadOptions extends FigmaFetcherOptions {
  /** 输出目录 */
  outputDir: string;
  /** 截图文件名 */
  screenshotName?: string;
  /** JSON 文件名 */
  jsonName?: string;
}

export interface DownloadResult {
  /** Figma JSON 数据 */
  figmaFile: FigmaFile;
  /** JSON 文件保存路径 */
  jsonPath: string;
  /** 截图保存路径 */
  screenshotPath?: string;
  /** 警告信息 */
  warnings: string[];
}

export async function downloadFigmaData(
  options: DownloadOptions
): Promise<DownloadResult> {
  const {
    outputDir,
    screenshotName = 'figma-design.png',
    jsonName = 'figma.json',
    ...fetcherOptions
  } = options;

  // Node.js 环境检查
  if (typeof window !== 'undefined') {
    throw new Error('downloadFigmaData is not supported in browser environment');
  }

  const fs = await import('fs/promises');
  const path = await import('path');

  // 确保输出目录存在
  await fs.mkdir(outputDir, { recursive: true });

  // 下载 Figma 数据
  const fetchResult = await fetchFigmaFile(fetcherOptions);

  // 保存 JSON
  const jsonPath = path.join(outputDir, jsonName);
  await saveFigmaJson(fetchResult.figmaFile, jsonPath);

  // 下载截图
  let screenshotPath: string | undefined;
  if (fetchResult.screenshotUrl) {
    screenshotPath = path.join(outputDir, screenshotName);
    await downloadImage(fetchResult.screenshotUrl, screenshotPath);
  }

  return {
    figmaFile: fetchResult.figmaFile,
    jsonPath,
    screenshotPath,
    warnings: fetchResult.warnings,
  };
}
