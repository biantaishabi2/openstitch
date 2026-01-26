import * as fs from 'fs';
import { compile as compileLogic } from '../src/lib/compiler/logic/index';

// 读取项目
const projectPath = './test-dsl-components-showcase.json';
const project = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));
const dsl = project.screens[0].dsl;

console.log('🔍 开始编译...\n');

// 编译
const result = compileLogic(dsl, { context: 'Stitch 组件库' });

if (!result.success || !result.ast) {
  console.error('❌ 编译失败:', result.errors);
  process.exit(1);
}

console.log('✅ 编译成功\n');

// 递归统计 AST 中的节点
function countNodes(node: any): { total: number; cards: string[] } {
  let total = 1;
  const cards: string[] = [];

  if (node.type && node.type.includes('Card')) {
    cards.push(node.id || 'unknown');
  }

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      const childCount = countNodes(child);
      total += childCount.total;
      cards.push(...childCount.cards);
    }
  }

  return { total, cards };
}

const stats = countNodes(result.ast.root);
console.log(`📊 AST 统计:`);
console.log(`  总节点数: ${stats.total}`);
console.log(`  Card 数量: ${stats.cards.length}`);
console.log(`\n Card 列表:`);
stats.cards.forEach((id, i) => {
  const num = String(i + 1).padStart(2);
  console.log(`  ${num}. ${id}`);
});

// 检查关键卡片
const hasCodeblock = stats.cards.includes('codeblock');
const hasSeparator = stats.cards.includes('separator');
console.log(`\n✓ AST 包含 separator: ${hasSeparator}`);
console.log(`✓ AST 包含 codeblock: ${hasCodeblock}`);

if (!hasCodeblock) {
  console.log('\n⚠️  codeblock 在 AST 中缺失!');
}
