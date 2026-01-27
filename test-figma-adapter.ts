/**
 * 测试 Figma Adapter 颜色提取
 */
import { readFileSync } from 'fs';
import { convertFigmaToStitch } from './src/figma/adapter/figma-adapter';
import type { FigmaFile } from './src/figma/types';

async function testFigmaAdapter() {
  // 读取 Figma JSON
  const figmaJson = JSON.parse(readFileSync('/tmp/figma.json', 'utf-8')) as FigmaFile;

  console.log('=== Figma 文件信息 ===');
  console.log('文件名:', figmaJson.name);

  // 转换
  console.log('\n=== 调用 convertFigmaToStitch ===');
  const result = await convertFigmaToStitch(figmaJson, {
    context: '胸科医院首页',
    sessionId: 'test-session',
  });

  console.log('\n=== Design Tokens (CSS 变量格式) ===');
  const colorTokens = Object.entries(result.tokens)
    .filter(([key]) => key.startsWith('--') && !key.includes('spacing') && !key.includes('font') && !key.includes('radius') && !key.includes('shadow'))
    .slice(0, 30);
  for (const [key, value] of colorTokens) {
    console.log(`${key}: ${value}`);
  }

  console.log('\n=== 推断结果中的颜色聚类 ===');
  if (result.visuals && 'colorClusters' in result.visuals) {
    const clusters = (result.visuals as any).colorClusters || [];
    for (const cluster of clusters.slice(0, 15)) {
      console.log(`- ${cluster.representative || cluster.hex} - 频率: ${cluster.totalFrequency || cluster.frequency}`);
    }
  }

  console.log('\n=== DSL 片段 ===');
  console.log(result.dsl.substring(0, 800) + '...');

  console.log('\n=== 警告 ===');
  result.warnings.forEach(w => console.log('-', w));
}

testFigmaAdapter().catch(console.error);
