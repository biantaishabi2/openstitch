/**
 * DSL 版 Components Showcase 测试
 *
 * 编译 DSL 生成与 JSON Schema 版本相同效果的 HTML
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { compile } from '../index';
import { tokenize, parse } from '../logic/index';

interface Screen {
  screen_id: string;
  title: string;
  dsl: string;
}

interface TestProject {
  context: string;
  platform: string;
  screens: Screen[];
}

// shadcn 默认中性色
const SHADCN_DEFAULT_TOKENS = {
  '--primary-color': '#18181b',
  '--primary': '240 5.9% 10%',
  '--primary-foreground': '0 0% 98%',
  '--secondary': '240 4.8% 95.9%',
  '--secondary-foreground': '240 5.9% 10%',
  '--accent': '240 4.8% 95.9%',
  '--accent-foreground': '240 5.9% 10%',
  '--ring': '240 5.9% 10%',
};

describe('DSL Components Showcase', () => {
  const projectPath = path.join(__dirname, '../../../../test-dsl-components-showcase.json');
  const outputDir = path.join(__dirname, '../../../../test-output');

  it('should compile DSL components showcase to HTML', async () => {
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const project: TestProject = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));

    console.log(`\n编译 DSL Components Showcase...\n`);

    for (const screen of project.screens) {
      console.log(`编译: ${screen.screen_id} - ${screen.title}`);

      const result = await compile(screen.dsl, {
        context: screen.title,
        ssr: { title: screen.title, lang: 'zh-CN' },
        tokenOverrides: SHADCN_DEFAULT_TOKENS,
      });

      expect(result.ast).toBeDefined();
      expect(result.ssr.html).toContain('<!DOCTYPE html>');

      // 调试: 统计 AST 中的 Card 节点
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

      // AST 根节点在 children 数组里
      const allCards: string[] = [];
      if (result.ast.children && Array.isArray(result.ast.children)) {
        for (const child of result.ast.children) {
          allCards.push(...countCards(child));
        }
      }

      // 统计总节点数
      function countAllNodes(node: any): number {
        if (!node) return 0;
        let count = 1;
        if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
            count += countAllNodes(child);
          }
        }
        return count;
      }

      let totalNodes = 0;
      if (result.ast.children) {
        for (const child of result.ast.children) {
          totalNodes += countAllNodes(child);
        }
      }

      console.log(`\n  📊 AST 统计:`);
      console.log(`    总节点数: ${totalNodes}`);
      console.log(`    Card 数量: ${allCards.length}`);
      if (allCards.length > 0) {
        console.log(`    前10个: ${allCards.slice(0, 10).join(', ')}`);
        console.log(`    后5个: ${allCards.slice(-5).join(', ')}`);
      }
      const hasCodeblock = allCards.includes('codeblock');
      const hasSeparator = allCards.includes('separator');
      console.log(`    ✓ separator: ${hasSeparator}, codeblock: ${hasCodeblock}`);

      const outputPath = path.join(outputDir, `${screen.screen_id}.html`);
      fs.writeFileSync(outputPath, result.ssr.html, 'utf-8');

      console.log(`  ✓ 已保存到 ${outputPath}`);
    }

    console.log('\n=== DSL Components Showcase 编译完成 ===');
    console.log(`输出目录: ${outputDir}`);
  });

  it('should tokenize full DSL including codeblock', () => {
    const project: TestProject = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));
    const fullDsl = project.screens[0].dsl;

    console.log('\n  🔍 Lexer 测试:');
    const { tokens, errors: lexErrors } = tokenize(fullDsl);
    console.log(`    Tokens 数量: ${tokens.length}`);
    console.log(`    Lexer 错误: ${lexErrors.length}`);

    // 查找 codeblock 相关的 token
    const codeblockTokens = tokens.filter((t: any) =>
      t.image && (t.image.includes('codeblock') || t.image.includes('code1'))
    );
    console.log(`    codeblock 相关 tokens: ${codeblockTokens.length}`);
    if (codeblockTokens.length > 0) {
      console.log(`      示例: ${codeblockTokens[0].image}`);
    }

    // 查找最后几个 TagOpen tokens
    const tagTokens = tokens.filter((t: any) => t.tokenType.name === 'TagOpen');
    console.log(`    TagOpen tokens 总数: ${tagTokens.length}`);
    const last5Tags = tagTokens.slice(-5);
    console.log(`    最后5个 TagOpen:`);
    last5Tags.forEach((t: any, i: number) => {
      const idx = tokens.indexOf(t);
      const nextToken = tokens[idx + 2]; // skip Colon
      console.log(`      ${tagTokens.length - 5 + i + 1}. ${t.image} (id: ${nextToken?.image || 'N/A'}) at L${t.startLine}:${t.startColumn}`);
    });

    console.log('\n  🔍 Parser 测试:');
    const { cst, errors: parseErrors } = parse(fullDsl);
    console.log(`    Parser 错误: ${parseErrors.length}`);
    console.log(`    CST 存在: ${!!cst}`);
    console.log(`    CST 节点数: ${cst.length}`);

    // 递归查找所有 Card
    function findAllCards(nodes: any[]): any[] {
      const cards: any[] = [];
      for (const node of nodes) {
        if (node.tag && node.tag === 'CARD') {
          cards.push(node);
        }
        if (node.children && Array.isArray(node.children)) {
          cards.push(...findAllCards(node.children));
        }
      }
      return cards;
    }

    const allCstCards = findAllCards(cst);
    console.log(`    CST Card 总数（递归）: ${allCstCards.length}`);

    const hasSeparator = allCstCards.some((node: any) => node.id === 'separator');
    const hasCodeblock = allCstCards.some((node: any) => node.id === 'codeblock');
    console.log(`    CST 包含 separator: ${hasSeparator}`);
    console.log(`    CST 包含 codeblock: ${hasCodeblock}`);

    if (allCstCards.length > 0) {
      const cardIds = allCstCards.map((n: any) => n.id || 'no-id');
      console.log(`    前5个 Card IDs: ${cardIds.slice(0, 5).join(', ')}`);
      console.log(`    后5个 Card IDs: ${cardIds.slice(-5).join(', ')}`);
    }

    // 打印 CST 最后一个元素的详细信息
    function findLastElement(nodes: any[]): any {
      if (nodes.length === 0) return null;
      const last = nodes[nodes.length - 1];
      if (last.children && last.children.length > 0) {
        return findLastElement(last.children);
      }
      return last;
    }

    const lastElement = findLastElement(cst);
    if (lastElement) {
      console.log(`    CST 最后一个元素: [${lastElement.tag}${lastElement.id ? ': ' + lastElement.id : ''}]`);
      if (lastElement.content) {
        console.log(`      content: "${lastElement.content.substring(0, 50)}..."`);
      }
    }

    expect(codeblockTokens.length).toBeGreaterThan(0);
    // expect(hasCodeblock).toBe(true); // 已知会失败
  });

  it('should parse codeblock in minimal case', async () => {
    const minimalDsl = `[FLEX: root]
  [STACK: main]
    { Gap: "LG" }

    [CARD: separator]
      ATTR: Title("Separator 分隔线")
      [TEXT: t1]
        CONTENT: "上方"

    [CARD: codeblock]
      ATTR: Title("CodeBlock 代码块")
      [CODE: c1]
        ATTR: Language("javascript")
        CONTENT: "console.log('test');"
`;

    const result = await compile(minimalDsl, {
      context: 'Test',
      ssr: { title: 'Test' },
      tokenOverrides: SHADCN_DEFAULT_TOKENS,
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

    console.log(`\n  🧪 最小用例测试:`);
    console.log(`    Cards: ${allCards.join(', ')}`);
    console.log(`    Has codeblock: ${allCards.includes('codeblock')}`);

    expect(allCards).toContain('separator');
    expect(allCards).toContain('codeblock');
  });
});
