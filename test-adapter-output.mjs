import { convertFigmaToStitch } from './src/figma/adapter/figma-adapter.ts';
import * as fs from 'fs';

const figmaJson = JSON.parse(fs.readFileSync('test-fixtures/figma-to-stitch-demo/figma.json', 'utf-8'));

const result = await convertFigmaToStitch(figmaJson, { context: '胸科医院首页' });

console.log('=== 生成的 DSL ===');
console.log(result.dsl);

console.log('\n\n=== Design Tokens ===');
console.log(JSON.stringify(result.tokens, null, 2));

console.log('\n\n=== 统计信息 ===');
console.log('总节点数:', result.stats.totalNodes);
console.log('有效节点数:', result.stats.validNodes);
console.log('AI 调用次数:', result.stats.aiCallCount);
console.log('平均置信度:', result.stats.avgConfidence.toFixed(2));
console.log('警告:', result.warnings);

// 保存到文件
const output = {
  meta: {
    context: '胸科医院首页',
    platform: 'mobile',
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
  },
  screens: [{
    id: 'chest_hospital_home',
    title: '胸科医院首页',
    dsl: result.dsl,
    tokens: result.tokens,
  }],
  stats: result.stats,
  warnings: result.warnings,
};

fs.writeFileSync('test-fixtures/figma-to-stitch-demo/stitch-config-generated.json', JSON.stringify(output, null, 2));
console.log('\n✅ 已保存到 stitch-config-generated.json');
