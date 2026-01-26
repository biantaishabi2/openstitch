/**
 * 渲染 JSON Components Showcase
 */
import { describe, it } from 'vitest';
import * as fs from 'fs';
import { renderToStaticHTML } from '../src/lib/compiler/ssr';
import { generateDesignTokens } from '../src/lib/compiler/visual';

describe('Render JSON Components Showcase', () => {
  it('renders JSON components showcase', async () => {
    const jsonData = JSON.parse(fs.readFileSync('test-dsl-components-showcase.json', 'utf-8'));

    // 生成 Design Tokens
    const tokens = generateDesignTokens({
      context: 'JSON Components Showcase',
      sessionId: 'test-session',
      platform: 'web',
    });

    // 使用 SSR 渲染
    const result = await renderToStaticHTML(jsonData, {
      title: 'Components Showcase (JSON)',
      lang: 'zh-CN',
      tokens,
    });

    console.log('=== JSON 渲染成功 ===');
    console.log('HTML 大小:', (result.html.length / 1024).toFixed(2), 'KB');

    fs.writeFileSync('test-json-components-showcase-rendered.html', result.html);
    console.log('\n输出文件: test-json-components-showcase-rendered.html');
  });
});
