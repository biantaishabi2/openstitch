/**
 * Schema 注册表
 * 添加新 schema 只需要在这里导入并添加到 schemas 数组
 */

// 导入所有 schemas
import techDashboard from './tech-dashboard.json';
import cyberpunk from './cyberpunk.json';
import warmFood from './warm-food.json';
import elegant from './elegant.json';
import componentsShowcase from './components-showcase.json';
import pptCover from './ppt-cover.json';
import techRoadmap from './tech-roadmap.json';
import adminDashboard from './admin-dashboard.json';
import adminUsers from './admin-users.json';
import mobileApp from './mobile-app.json';

export interface SchemaItem {
  id: string;
  name: string;
  description: string;
  theme: string;
  schema: any;
}

// Schema 注册表 - 添加新 schema 只需在此添加一行
export const schemas: SchemaItem[] = [
  {
    id: 'tech-dashboard',
    name: 'Tech Dashboard',
    description: '科技感的 SaaS 仪表盘界面',
    theme: '科技/专业',
    schema: techDashboard,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: '赛博朋克风格的监控面板',
    theme: '暗黑/霓虹',
    schema: cyberpunk,
  },
  {
    id: 'warm-food',
    name: '暖心食堂',
    description: '温暖风格的外卖点餐界面',
    theme: '温暖/食品',
    schema: warmFood,
  },
  {
    id: 'elegant',
    name: 'Elegant Brand',
    description: '高端优雅的奢侈品牌页面',
    theme: '优雅/奢华',
    schema: elegant,
  },
  {
    id: 'components-showcase',
    name: '组件展示',
    description: '展示所有可用组件的合集',
    theme: '默认',
    schema: componentsShowcase,
  },
  {
    id: 'ppt-cover',
    name: 'PPT 封面',
    description: 'JSON Schema 驱动的下一代 UI 渲染引擎',
    theme: '暗黑/演示',
    schema: pptCover,
  },
  {
    id: 'tech-roadmap',
    name: '技术路线图',
    description: '从 JSON Schema 到多端渲染的技术架构',
    theme: '专业/文档',
    schema: techRoadmap,
  },
  {
    id: 'admin-dashboard',
    name: '管理后台',
    description: '后台管理系统仪表盘',
    theme: '企业/管理',
    schema: adminDashboard,
  },
  {
    id: 'admin-users',
    name: '用户管理',
    description: '用户列表与管理功能',
    theme: '企业/管理',
    schema: adminUsers,
  },
  {
    id: 'mobile-app',
    name: '移动端商城',
    description: '手机端电商应用界面',
    theme: '移动/电商',
    schema: mobileApp,
  },
];

// 按 ID 获取 schema
export function getSchemaById(id: string): SchemaItem | undefined {
  return schemas.find(s => s.id === id);
}

// 获取所有 schema IDs
export function getSchemaIds(): string[] {
  return schemas.map(s => s.id);
}
