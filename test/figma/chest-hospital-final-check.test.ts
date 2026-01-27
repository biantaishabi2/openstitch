/**
 * 胸科医院 - 最终对比检查
 */
import { describe, it, expect } from 'vitest';
import { loadConfigFromFile } from '../../src/figma/adapter/json-exporter';
import { compileFromJSON } from '../../src/lib/compiler';

describe('胸科医院 - 最终对比检查', () => {
  it('应该完整检查所有内容和样式', async () => {
    const config = await loadConfigFromFile('test-fixtures/figma-to-stitch-demo/stitch-config.json');
    const result = await compileFromJSON(config, 'chest_hospital_home');
    const html = result.ssr.html;

    console.log('\n=== 内容检查 ===');
    const contents = [
      '胸科医院', 'xkyy0325', '活跃度', '3098', '步',
      '福利平台', '会员登记', '工会动态', '困难帮扶',
      '组织机构', '职代会', '职工之家', '个人中心', '胸科闲余',
      '新闻专区', '新闻政策', '关注时事热点', '劳模风采', '彰显榜样力量'
    ];
    contents.forEach(text => {
      console.log(html.includes(text) ? '✅' : '❌', text);
    });

    console.log('\n=== 图片检查 ===');
    const images = ['13_42.png', '13_53.png', '17_44.png', '17_43.png', '15_229.png', '15_238.png'];
    images.forEach(img => {
      console.log(html.includes(img) ? '✅' : '❌', img);
    });

    console.log('\n=== 样式检查 ===');
    const styles = [
      { name: 'text-4xl (步数)', pattern: /text-4xl/ },
      { name: 'text-sm (功能卡片)', pattern: /text-sm(?!-)/ },
      { name: 'text-xs (描述)', pattern: /text-xs/ },
      { name: 'mt-3 (区块间距)', pattern: /mt-3/ },
      { name: 'mt-1 (卡片间距)', pattern: /mt-1/ },
      { name: 'p-2 (内边距)', pattern: /p-2/ },
      { name: 'gap-px (分隔)', pattern: /gap-px/ },
      { name: 'rounded-full (头像)', pattern: /rounded-full/ },
      { name: 'tracking-tight (步数)', pattern: /tracking-tight/ },
      { name: 'w-10 h-10 (图标)', pattern: /w-10 h-10/ },
      { name: 'w-20 h-20 (新闻)', pattern: /w-20 h-20/ },
      { name: 'w-full h-40 (轮播)', pattern: /w-full h-40/ },
    ];
    styles.forEach(s => {
      console.log(s.pattern.test(html) ? '✅' : '❌', s.name);
    });

    console.log('\n=== 布局检查 ===');
    const layouts = [
      { name: 'grid grid-cols-3', pattern: /grid grid-cols-3/ },
      { name: 'flex items-center', pattern: /flex items-center/ },
      { name: 'flex justify-around', pattern: /flex justify-around/ },
      { name: 'bg-gray-50 (背景)', pattern: /bg-gray-50/ },
      { name: 'bg-white (卡片)', pattern: /bg-white/ },
      { name: 'bg-gray-200 (分隔)', pattern: /bg-gray-200/ },
    ];
    layouts.forEach(l => {
      console.log(l.pattern.test(html) ? '✅' : '❌', l.name);
    });

    console.log('\n=== 潜在问题 ===');
    console.log('❌ 检查是否有 shadow:', html.includes('shadow-') ? '有阴影' : '无阴影');
    console.log('❌ 检查是否有 rounded:', (html.match(/rounded-/g) || []).length, '个 rounded 类');

    expect(html.includes('胸科医院')).toBe(true);
    expect(html.includes('福利平台')).toBe(true);
    expect(html.includes('3098')).toBe(true);
  });
});
