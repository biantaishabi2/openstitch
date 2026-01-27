/**
 * 胸科首页 Figma 设计稿编译测试 - 简化版
 */

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/lib/compiler';

describe('Chest Hospital Home Figma Compilation', () => {
  const dsl = `[SECTION: chest_hospital_home]
  { ClassName: "bg-gray-50 min-h-screen" }
  [SECTION: main_nav]
    { ClassName: "bg-white p-4" }
    [TEXT: nav_title]
      { ClassName: "font-bold text-lg" }
      CONTENT: "胸科首页"
  [SECTION: banner_carousel]
    { ClassName: "relative" }
    [TEXT: banner_placeholder]
      { ClassName: "w-full h-48 bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white" }
      CONTENT: "轮播图"
  [SECTION: user_info]
    { ClassName: "flex items-center gap-3 p-4 bg-white" }
    [TEXT: username]
      { ClassName: "font-medium" }
      CONTENT: "xkyy0325"
    [TEXT: activity_label]
      { ClassName: "text-xs text-gray-500" }
      CONTENT: "活跃度：20"
  [SECTION: feature_entries]
    { ClassName: "grid grid-cols-3 gap-2 p-2 bg-white" }
    [CARD: welfare_platform]
      { ClassName: "bg-gray-50 rounded-lg p-2 text-center" }
      [TEXT: welfare_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "福利平台"
    [CARD: member_register]
      { ClassName: "bg-gray-50 rounded-lg p-2 text-center" }
      [TEXT: member_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "会员登记"
    [CARD: union_news]
      { ClassName: "bg-gray-50 rounded-lg p-2 text-center" }
      [TEXT: news_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "工会动态"
    [CARD: difficulty_help]
      { ClassName: "bg-gray-50 rounded-lg p-2 text-center" }
      [TEXT: help_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "困难帮扶"
    [CARD: organization]
      { ClassName: "bg-gray-50 rounded-lg p-2 text-center" }
      [TEXT: org_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "组织机构"
    [CARD: worker_congress]
      { ClassName: "bg-gray-50 rounded-lg p-2 text-center" }
      [TEXT: congress_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "职代会"
    [CARD: worker_home]
      { ClassName: "bg-gray-50 rounded-lg p-2 text-center" }
      [TEXT: home_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "职工之家"
    [CARD: personal_center]
      { ClassName: "bg-gray-50 rounded-lg p-2 text-center" }
      [TEXT: personal_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "个人中心"
    [CARD: idle_market]
      { ClassName: "bg-gray-50 rounded-lg p-2 text-center" }
      [TEXT: market_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "胸科闲余"
  [SECTION: news_section]
    { ClassName: "bg-white mt-2 p-4" }
    [TEXT: news_section_title]
      { ClassName: "font-bold text-lg mb-3" }
      CONTENT: "新闻专区"
    [CARD: news_item_1]
      { ClassName: "flex gap-3 p-3 border rounded-lg" }
      [TEXT: news_title_1]
        { ClassName: "font-medium text-sm" }
        CONTENT: "新闻政策"
      [TEXT: news_desc_1]
        { ClassName: "text-xs text-gray-500" }
        CONTENT: "关注时事热点"
    [CARD: news_item_2]
      { ClassName: "flex gap-3 p-3 border rounded-lg" }
      [TEXT: news_title_2]
        { ClassName: "font-medium text-sm" }
        CONTENT: "劳模风采"
      [TEXT: news_desc_2]
        { ClassName: "text-xs text-gray-500" }
        CONTENT: "彰显榜样力量"`;

  it('should compile Figma DSL to HTML', async () => {
    const result = await compile(dsl, {
      context: '胸科医院首页',
      ssr: {
        title: '胸科首页',
        lang: 'zh-CN',
      },
    });

    console.log('=== 编译结果 ===');
    console.log('节点数:', result.stats.nodeCount);
    console.log('HTML 大小:', (result.stats.htmlSize / 1024).toFixed(1) + 'KB');
    console.log('总耗时:', result.stats.totalTime.toFixed(1) + 'ms');

    // 保存 HTML 到文件
    const fs = require('fs');
    fs.writeFileSync('/home/wangbo/document/stitch/output/chest-hospital-home.html', result.ssr.html);
    console.log('\n✅ HTML 已保存到 output/chest-hospital-home.html');

    expect(result.ssr.html).toBeDefined();
    expect(result.ssr.html.length).toBeGreaterThan(0);
  });
});
