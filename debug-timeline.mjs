import { compile } from './.worktrees/002-figma-frontend/src/lib/compiler/index.ts';

const dsl = `
[CARD: test_card]
  [TIMELINE: tl1]
    [TIMELINE_ITEM: tl_item1]
      ATTR: Title("Test Item"), Status("completed")
`;

const result = await compile(dsl, {
  context: 'Test',
  ssr: { title: 'Test', lang: 'zh-CN' }
});

console.log(JSON.stringify(result.ast, null, 2));
