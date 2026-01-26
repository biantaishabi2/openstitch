import * as fs from 'fs';
import { tokenize } from './src/lib/compiler/logic/lexer.js';

const dsl = fs.readFileSync('./test-dsl-components-showcase.dsl', 'utf-8');
const { tokens } = tokenize(dsl);

// 找到所有 TagOpen tokens
const tagTokens = tokens.filter(t => t.tokenType.name === 'TagOpen');

console.log(`\n总共 ${tagTokens.length} 个 TagOpen tokens\n`);

// 显示最后 10 个
const last10 = tagTokens.slice(-10);
console.log('最后 10 个 TagOpen tokens:');
last10.forEach((t, i) => {
  console.log(`  ${tagTokens.length - 10 + i + 1}. ${t.image} at L${t.startLine}:${t.startColumn} (offset ${t.startOffset})`);
});

// 查找 separator 和 codeblock
const separatorTag = tagTokens.find(t => {
  const nextToken = tokens[tokens.indexOf(t) + 2]; // skip Colon
  return nextToken && nextToken.image === 'separator';
});

const codeblockTag = tagTokens.find(t => {
  const nextToken = tokens[tokens.indexOf(t) + 2]; // skip Colon
  return nextToken && nextToken.image === 'codeblock';
});

console.log(`\n[CARD: separator] at L${separatorTag?.startLine}:${separatorTag?.startColumn}`);
console.log(`[CARD: codeblock] at L${codeblockTag?.startLine}:${codeblockTag?.startColumn}`);

// 比较它们的 startColumn
console.log(`\nseparator indent: ${separatorTag?.startColumn}`);
console.log(`codeblock indent: ${codeblockTag?.startColumn}`);
