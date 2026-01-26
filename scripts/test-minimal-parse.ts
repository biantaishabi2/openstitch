import * as fs from 'fs';
import { compile } from '../src/lib/compiler/index';

const testDsl = `[FLEX: root]
  [STACK: main]
    { Gap: "LG" }

    [CARD: separator]
      ATTR: Title("Separator 分隔线")
      [TEXT: t1]
        CONTENT: "上方内容"

    [CARD: codeblock]
      ATTR: Title("CodeBlock 代码块")
      [CODE: c1]
        ATTR: Language("javascript")
        CONTENT: "console.log('test');"
`;

async function test() {
  console.log('🔍 测试最小用例...\n');

  const result = await compile(testDsl, {
    context: 'Test',
    ssr: { title: 'Test' }
  });

  // 统计 Card
  function countCards(node: any): string[] {
    if (!node) return [];
    const cards: string[] = [];
    if (node.type && node.type.includes('Card')) {
      cards.push(node.id || node.type);
    }
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        cards.push(...countCards(child));
      }
    }
    return cards;
  }

  const allCards: string[] = [];
  if (result.ast.children) {
    for (const child of result.ast.children) {
      allCards.push(...countCards(child));
    }
  }

  console.log(`📊 Cards in AST: ${allCards.length}`);
  console.log(`   List: ${allCards.join(', ')}`);
  console.log(`   Has separator: ${allCards.includes('separator')}`);
  console.log(`   Has codeblock: ${allCards.includes('codeblock')}`);

  if (allCards.includes('codeblock')) {
    console.log('\n✅ codeblock 在最小用例中解析成功！');
  } else {
    console.log('\n❌ codeblock 即使在最小用例中也丢失了！');
  }
}

test().catch(console.error);
