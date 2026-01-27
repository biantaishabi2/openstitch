/**
 * 胸科首页 Figma 设计稿编译测试 - 修正版
 */

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/lib/compiler';

describe('Chest Hospital Home Figma Compilation - Fixed', () => {
  const dsl = `[SECTION: chest_hospital_home]
  { ClassName: "min-h-screen" }
  [SECTION: main_nav]
    { ClassName: "bg-white p-4" }
    [TEXT: nav_title]
      { ClassName: "font-bold text-lg" }
      CONTENT: "胸科首页"
  [SECTION: banner_carousel]
    { ClassName: "relative" }
    [IMAGE: carousel_image]
      { ClassName: "w-full h-48 object-cover" }
      ATTR: Src("/figma-images/13_42.png"), Alt("轮播图")
  [SECTION: user_info]
    { ClassName: "flex items-center gap-3 p-4 bg-white" }
    [IMAGE: avatar]
      { ClassName: "w-10 h-10 rounded-full" }
      ATTR: Src("/figma-images/13_53.png"), Alt("头像")
    [SECTION: user_detail]
      [TEXT: username]
        { ClassName: "font-medium" }
        CONTENT: "xkyy0325"
      [TEXT: activity_label]
        { ClassName: "text-xs text-gray-500" }
        CONTENT: "活跃度：20"
  [SECTION: feature_entries]
    { ClassName: "grid grid-cols-3 gap-2 p-2 bg-white" }
    [CARD: welfare_platform]
      { ClassName: "bg-white rounded-lg p-2 text-center border" }
      [IMAGE: welfare_icon]
        { ClassName: "w-8 h-8 mx-auto" }
        ATTR: Src("/figma-images/17_44.png"), Alt("福利图标")
      [TEXT: welfare_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "福利平台"
    [CARD: member_register]
      { ClassName: "bg-white rounded-lg p-2 text-center border" }
      [IMAGE: member_icon]
        { ClassName: "w-8 h-8 mx-auto" }
        ATTR: Src("/figma-images/17_43.png"), Alt("会员图标")
      [TEXT: member_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "会员登记"
    [CARD: union_news]
      { ClassName: "bg-white rounded-lg p-2 text-center border" }
      [TEXT: news_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "工会动态"
    [CARD: difficulty_help]
      { ClassName: "bg-white rounded-lg p-2 text-center border" }
      [TEXT: help_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "困难帮扶"
    [CARD: organization]
      { ClassName: "bg-white rounded-lg p-2 text-center border" }
      [TEXT: org_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "组织机构"
    [CARD: worker_congress]
      { ClassName: "bg-white rounded-lg p-2 text-center border" }
      [TEXT: congress_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "职代会"
    [CARD: worker_home]
      { ClassName: "bg-white rounded-lg p-2 text-center border" }
      [TEXT: home_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "职工之家"
    [CARD: personal_center]
      { ClassName: "bg-white rounded-lg p-2 text-center border" }
      [TEXT: personal_text]
        { ClassName: "text-xs mt-1" }
        CONTENT: "个人中心"
    [CARD: idle_market]
      { ClassName: "bg-white rounded-lg p-2 text-center border" }
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
      [IMAGE: news_image_1]
        { ClassName: "w-16 h-16 object-cover rounded" }
        ATTR: Src("/figma-images/15_229.png"), Alt("新闻图片1")
      [SECTION: news_1_content]
        [TEXT: news_title_1]
          { ClassName: "font-medium text-sm" }
          CONTENT: "新闻政策"
        [TEXT: news_desc_1]
          { ClassName: "text-xs text-gray-500" }
          CONTENT: "关注时事热点"
    [CARD: news_item_2]
      { ClassName: "flex gap-3 p-3 border rounded-lg" }
      [IMAGE: news_image_2]
        { ClassName: "w-16 h-16 object-cover rounded" }
        ATTR: Src("/figma-images/15_238.png"), Alt("新闻图片2")
      [SECTION: news_2_content]
        [TEXT: news_title_2]
          { ClassName: "font-medium text-sm" }
          CONTENT: "劳模风采"
        [TEXT: news_desc_2]
          { ClassName: "text-xs text-gray-500" }
          CONTENT: "彰显榜样力量"
  [SECTION: activity_section]
    { ClassName: "bg-white mt-2 p-4" }
    [TEXT: activity_section_title]
      { ClassName: "font-bold text-lg mb-3" }
      CONTENT: "活动专区"
    [CARD: activity_item_1]
      { ClassName: "flex gap-3 p-3 border rounded-lg" }
      [IMAGE: activity_image_1]
        { ClassName: "w-12 h-12 object-cover rounded" }
        ATTR: Src("/figma-images/17_43.png"), Alt("活动图片1")
      [SECTION: activity_1_content]
        [TEXT: activity_title_1]
          { ClassName: "font-medium text-sm" }
          CONTENT: "线上活动"
        [TEXT: activity_desc_1]
          { ClassName: "text-xs text-gray-500" }
          CONTENT: "丰富业余生活"
    [CARD: activity_item_2]
      { ClassName: "flex gap-3 p-3 border rounded-lg" }
      [IMAGE: activity_image_2]
        { ClassName: "w-12 h-12 object-cover rounded" }
        ATTR: Src("/figma-images/17_44.png"), Alt("活动图片2")
      [SECTION: activity_2_content]
        [TEXT: activity_title_2]
          { ClassName: "font-medium text-sm" }
          CONTENT: "兴趣小组"
        [TEXT: activity_desc_2]
          { ClassName: "text-xs text-gray-500" }
          CONTENT: "寻找志同道合"`;

  it('should compile Figma DSL with real assets', async () => {
    const result = await compile(dsl, {
      context: '胸科医院首页',
      ssr: {
        title: '胸科首页',
        lang: 'zh-CN',
      },
    });

    console.log('=== 编译结果（修正版）===');
    console.log('节点数:', result.stats.nodeCount);
    console.log('HTML 大小:', (result.stats.htmlSize / 1024).toFixed(1) + 'KB');
    console.log('总耗时:', result.stats.totalTime.toFixed(1) + 'ms');

    const html = result.ssr.html;
    const hasRealImages = html.includes('/figma-images/');
    console.log('\n包含真实图片引用:', hasRealImages);
    console.log('图片数量:', (html.match(/\/figma-images\//g) || []).length);

    const fs = require('fs');
    fs.writeFileSync('/home/wangbo/document/stitch/output/chest-hospital-home-fixed.html', html);
    console.log('\n✅ HTML 已保存到 output/chest-hospital-home-fixed.html');

    expect(result.ssr.html).toBeDefined();
    expect(hasRealImages).toBe(true);
  });
});
