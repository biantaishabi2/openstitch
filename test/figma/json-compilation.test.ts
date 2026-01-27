/**
 * JSON 配置编译测试
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from '../../src/figma/adapter/figma-adapter';
import { exportFigmaToJSON, loadConfigFromFile, extractScreenConfig } from '../../src/figma/adapter/json-exporter';
import { compile, compileFromJSON } from '../../src/lib/compiler';
import type { FigmaFile } from '../../src/figma/types';
import type { StitchConfig } from '../../src/figma/config-types';

describe('JSON Config Compilation', () => {
  it('should export Figma to JSON config', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const config = await exportFigmaToJSON(figmaJson, {
      context: '胸科医院首页',
      platform: 'web',
      screenTitle: '首页',
    });

    console.log('\n=== JSON Config ===');
    console.log('Meta:', JSON.stringify(config.meta, null, 2));
    console.log('Screens:', config.screens.length);
    console.log('First screen tokens count:', Object.keys(config.screens[0].tokens || {}).length);
    console.log('First 5 tokens:', Object.entries(config.screens[0].tokens || {}).slice(0, 5));

    expect(config.meta.context).toBe('胸科医院首页');
    expect(config.meta.platform).toBe('web');
    expect(config.screens.length).toBe(1);
    expect(config.screens[0].dsl.length).toBeGreaterThan(0);
  });

  it('should compile from JSON config', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const config = await exportFigmaToJSON(figmaJson, {
      context: '胸科医院首页',
    });

    const result = await compileFromJSON(config, 'screen_1');

    console.log('\n=== Compile from JSON ===');
    console.log('HTML size:', result.ssr.html.length);
    console.log('Nodes:', result.stats.nodeCount);
    console.log('Contains primary color:', result.ssr.html.includes('--primary-color'));

    expect(result.ssr.html.length).toBeGreaterThan(0);
    expect(result.stats.nodeCount).toBeGreaterThan(0);
  });

  it('should use tokens from JSON config', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const config = await exportFigmaToJSON(figmaJson, {
      context: '胸科医院首页',
    });

    // 覆盖 primary color
    config.screens[0].tokens = {
      ...config.screens[0].tokens,
      '--primary-color': '#ff0000',
    };

    const result = await compileFromJSON(config, 'screen_1');

    console.log('\n=== Token Override ===');
    console.log('Contains #ff0000:', result.ssr.html.includes('#ff0000'));

    // 验证颜色覆盖生效
    expect(result.ssr.html).toContain('#ff0000');
  });

  it('should save and load JSON config', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const originalConfig = await exportFigmaToJSON(figmaJson, {
      context: '胸科医院首页',
    });

    // 保存到临时文件
    const tempPath = '/tmp/stitch-config-test.json';
    const { writeFileSync, unlinkSync } = await import('fs');
    writeFileSync(tempPath, JSON.stringify(originalConfig, null, 2), 'utf-8');

    // 加载
    const loadedConfig = await loadConfigFromFile(tempPath);

    console.log('\n=== Save/Load Test ===');
    console.log('Original screens:', originalConfig.screens.length);
    console.log('Loaded screens:', loadedConfig.screens.length);
    console.log('DSL length match:', originalConfig.screens[0].dsl.length === loadedConfig.screens[0].dsl.length);

    expect(loadedConfig.screens.length).toBe(originalConfig.screens.length);
    expect(loadedConfig.screens[0].dsl).toBe(originalConfig.screens[0].dsl);

    // 清理
    unlinkSync(tempPath);
  });

  it('should extract screen from config', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const config = await exportFigmaToJSON(figmaJson, {
      context: '胸科医院首页',
    });

    const screen = extractScreenConfig(config, 'screen_1');

    expect(screen).toBeDefined();
    expect(screen?.dsl.length).toBeGreaterThan(0);
  });

  it('should compile with token overrides from config', async () => {
    const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;
    const config = await exportFigmaToJSON(figmaJson, {
      context: '胸科医院首页',
    });

    // 添加 token overrides（使用正确的 token 键名）
    config.screens[0].overrides = {
      colors: {
        '--primary-color': '#00ff00',
        '--background': '#f0f0f0',
      },
      typography: {
        '--font-scale': '1.25',
      },
    };

    const result = await compileFromJSON(config, 'screen_1');

    console.log('\n=== Token Overrides Test ===');
    console.log('Contains #00ff00:', result.ssr.html.includes('#00ff00'));
    console.log('Contains #f0f0f0:', result.ssr.html.includes('#f0f0f0'));

    // 验证颜色覆盖生效
    expect(result.ssr.html).toContain('#00ff00');
    expect(result.ssr.html).toContain('#f0f0f0');
  });
});
