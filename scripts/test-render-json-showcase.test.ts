/**
 * 渲染 JSON Components Showcase
 */
import { describe, it } from 'vitest';
import * as fs from 'fs';
import { renderToStaticHTML } from '../src/lib/compiler/ssr';
import { generateDesignTokens } from '../src/lib/compiler/visual';
import { render } from '../src/lib/renderer/renderer';
import { precomputeCodeHighlights } from '../src/lib/compiler/ssr/code-highlighter';

describe('Render JSON Components Showcase', () => {
  it('renders JSON components showcase', async () => {
    const jsonData = JSON.parse(fs.readFileSync('src/data/schemas/components-showcase.json', 'utf-8'));

    // 生成 Design Tokens
    const tokens = generateDesignTokens({
      context: 'JSON Components Showcase',
      sessionId: 'test-session',
      platform: 'web',
    });

    // 使用 SSR 渲染
    await precomputeCodeHighlights(jsonData);
    const element = render(jsonData);
    const result = await renderToStaticHTML(element, {
      title: 'Components Showcase (JSON)',
      lang: 'zh-CN',
      tokens,
    });

    console.log('=== JSON 渲染成功 ===');
    console.log('HTML 大小:', (result.html.length / 1024).toFixed(2), 'KB');

    fs.writeFileSync('test-output/components-showcase-json.html', result.html);
    console.log('\n输出文件: test-output/components-showcase-json.html');
  });
});
