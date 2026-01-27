/**
 * 测试简单 DSL 编译
 */
import { describe, it, expect } from 'vitest';
import { compile } from './src/lib/compiler';
import * as fs from 'fs';

describe('Simple DSL Test', () => {
  it('should compile simple DSL', async () => {
    const dsl = fs.readFileSync('test-simple-dsl.dsl', 'utf-8');
    console.log('DSL:', dsl);
    
    const result = await compile(dsl, {
      context: '测试',
      ssr: { title: '测试', lang: 'zh-CN' },
    });

    console.log('=== 编译结果 ===');
    console.log('HTML:', result.ssr.html.substring(0, 500));
    
    expect(result.ssr.html).toBeDefined();
  });
});
