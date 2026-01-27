/**
 * JSON 配置导出器
 *
 * 将 Figma 提取结果导出为可编辑的 JSON 配置
 */

import type { FigmaFile } from '../types';
import type { StitchConfig, StitchScreen, TokenOverrides } from '../config-types';
import { convertFigmaToStitch, type FigmaToStitchResult } from './figma-adapter';

/**
 * 将 Figma 文件导出为 JSON 配置
 */
export async function exportFigmaToJSON(
  figmaFile: FigmaFile,
  options: {
    context: string;
    platform?: 'web' | 'mobile';
    screenTitle?: string;
  }
): Promise<StitchConfig> {
  const { context, platform = 'web', screenTitle } = options;

  // 执行完整转换
  const result = await convertFigmaToStitch(figmaFile, {
    context,
    useDefaults: true,
  });

  // 构建屏幕配置
  const screen: StitchScreen = {
    id: 'screen_1',
    title: screenTitle || context || 'Screen',
    dsl: result.dsl,
    tokens: result.tokens,
  };

  return {
    meta: {
      context,
      platform,
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      figmaFile: figmaFile.name,
    },
    screens: [screen],
  };
}

/**
 * 从 FigmaToStitchResult 构建屏幕配置
 */
export function buildScreenFromResult(
  result: FigmaToStitchResult,
  options: {
    id?: string;
    title?: string;
    description?: string;
  }
): StitchScreen {
  const { id = 'screen_1', title = 'Screen', description } = options;

  return {
    id,
    title,
    dsl: result.dsl,
    tokens: result.tokens,
    description,
  };
}

/**
 * 构建 Token 覆盖配置（从编译后的 tokens 提取）
 */
export function buildTokenOverrides(
  tokens: Record<string, string>
): TokenOverrides {
  return {
    colors: {
      primary: tokens['--primary-color'],
      secondary: tokens['--secondary-color'],
      accent: tokens['--accent-color'],
      background: tokens['--background'],
      foreground: tokens['--foreground'],
      muted: tokens['--muted'],
      border: tokens['--border'],
    },
    typography: {
      fontScale: tokens['--font-scale'],
      baseSize: tokens['--font-size-base'],
    },
    spacing: {
      baseUnit: parseInt(tokens['--base-unit'] || '4', 10),
    },
  };
}

/**
 * 保存配置到文件
 */
export async function saveConfigToFile(
  config: StitchConfig,
  filePath: string
): Promise<void> {
  const { writeFileSync } = await import('fs');
  writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * 从文件加载配置
 */
export async function loadConfigFromFile(
  filePath: string
): Promise<StitchConfig> {
  const { readFileSync } = await import('fs');
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as StitchConfig;
}

/**
 * 从 JSON 配置提取单个屏幕
 */
export function extractScreenConfig(
  config: StitchConfig,
  screenId: string
): StitchScreen | undefined {
  return config.screens.find(s => s.id === screenId);
}
