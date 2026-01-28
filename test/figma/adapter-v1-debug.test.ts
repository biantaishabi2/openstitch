import { describe, it } from 'vitest';
import { convertFigmaToStitchV1 } from '../../src/figma/adapter-v1';
import * as fs from 'fs';

const figmaJson = JSON.parse(
  fs.readFileSync('test-fixtures/figma-to-stitch-demo/figma.json', 'utf-8')
);

describe('Adapter V1 Debug', () => {
  it('should show all nodes', () => {
    const result = convertFigmaToStitchV1(figmaJson);
    
    console.log('\n=== 所有根节点 ===');
    for (const node of result.rootNodes) {
      console.log(`\n${node.name} (${node.type}):`);
      console.log(`  组件类型: ${node.componentType}`);
      console.log(`  尺寸: ${node.visual.width}x${node.visual.height}`);
      console.log(`  子节点数: ${node.children.length}`);
      
      for (const child of node.children.slice(0, 10)) {
        console.log(`    - ${child.name} (${child.componentType}) ${child.visual.width}x${child.visual.height}`);
      }
    }
    
    console.log('\n=== 统计 ===');
    console.log('总节点:', result.stats.total);
    console.log('卡片数:', result.stats.cards);
    console.log('过滤数:', result.stats.filtered);
  });
});
