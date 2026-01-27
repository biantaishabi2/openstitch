/**
 * 胸科首页 - 使用 Figma Design Token 编译测试
 */
import { describe, it, expect } from 'vitest';
import { compile } from '../../src/lib/compiler';
import * as fs from 'fs';
import * as path from 'path';

describe('Chest Hospital Home with Figma Tokens', () => {
  it('should compile with Figma extracted colors', async () => {
    // 读取 JSON 配置文件
    const jsonPath = path.resolve('chest-hospital-home.json');
    const config = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    console.log('=== 配置信息 ===');
    console.log('Context:', config.context);
    console.log('Platform:', config.platform);
    console.log('Token Overrides:', JSON.stringify(config.tokenOverrides, null, 2));

    // 使用 tokenOverrides 传入 Figma 颜色
    const result = await compile(config.screens[0].dsl, {
      context: config.context,
      platform: config.platform,
      tokenOverrides: config.tokenOverrides,
      ssr: {
        title: config.screens[0].title,
        lang: 'zh-CN',
      },
    });

    console.log('\n=== 编译结果 ===');
    console.log('节点数:', result.stats.nodeCount);
    console.log('HTML 大小:', (result.stats.htmlSize / 1024).toFixed(1) + 'KB');

    // 检查 Design Token 是否使用了 Figma 颜色
    const html = result.ssr.html;

    // 1. 检查图片引用
    const imageCount = (html.match(/\/figma-images\//g) || []).length;
    console.log('\n图片引用数量:', imageCount);

    // 2. 检查 Figma 颜色是否正确应用
    const hasPrimaryBlue = html.includes('--primary: #00B5FF');
    const hasSecondaryGreen = html.includes('--secondary: #65C47A');
    const hasAccentOrange = html.includes('--accent: #FF9D00');
    const hasBackgroundWhite = html.includes('--background: #FFFFFF');

    console.log('包含 Figma 蓝色 (#00B5FF):', hasPrimaryBlue);
    console.log('包含 Figma 绿色 (#65C47A):', hasSecondaryGreen);
    console.log('包含 Figma 橙色 (#FF9D00):', hasAccentOrange);
    console.log('包含 Figma 白色 (#FFFFFF):', hasBackgroundWhite);

    // 3. 保存 HTML
    fs.writeFileSync('output/chest-hospital-home-final.html', html);
    console.log('\n✅ HTML 已保存到 output/chest-hospital-home-final.html');

    expect(result.ssr.html).toBeDefined();
    expect(imageCount).toBeGreaterThan(0);
    expect(hasPrimaryBlue).toBe(true);
    expect(hasSecondaryGreen).toBe(true);
    expect(hasAccentOrange).toBe(true);
    expect(hasBackgroundWhite).toBe(true);
  });
});
