'use client';

import { useState } from 'react';
import { StitchRenderer, exportToHTML } from '@/lib/renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// 导入纯 JSON schemas
import techDashboard from '@/data/schemas/tech-dashboard.json';
import cyberpunk from '@/data/schemas/cyberpunk.json';
import warmFood from '@/data/schemas/warm-food.json';
import elegant from '@/data/schemas/elegant.json';
import componentsShowcase from '@/data/schemas/components-showcase.json';
import pptCover from '@/data/schemas/ppt-cover.json';
import techRoadmap from '@/data/schemas/tech-roadmap.json';
import adminDashboard from '@/data/schemas/admin-dashboard.json';
import adminUsers from '@/data/schemas/admin-users.json';
import mobileApp from '@/data/schemas/mobile-app.json';

interface SchemaItem {
  name: string;
  id: string;
  description: string;
  theme: string;
  schema: any;
}

const schemas: SchemaItem[] = [
  {
    name: 'Tech Dashboard',
    id: 'tech-dashboard',
    description: '科技感的 SaaS 仪表盘界面',
    theme: '科技/专业',
    schema: techDashboard,
  },
  {
    name: 'Cyberpunk',
    id: 'cyberpunk',
    description: '赛博朋克风格的监控面板',
    theme: '暗黑/霓虹',
    schema: cyberpunk,
  },
  {
    name: '暖心食堂',
    id: 'warm-food',
    description: '温暖风格的外卖点餐界面',
    theme: '温暖/食品',
    schema: warmFood,
  },
  {
    name: 'Elegant Brand',
    id: 'elegant',
    description: '高端优雅的奢侈品牌页面',
    theme: '优雅/奢华',
    schema: elegant,
  },
  {
    name: '组件展示',
    id: 'components-showcase',
    description: '展示所有可用组件的合集',
    theme: '默认',
    schema: componentsShowcase,
  },
  {
    name: 'PPT 封面',
    id: 'ppt-cover',
    description: 'JSON Schema 驱动的下一代 UI 渲染引擎',
    theme: '暗黑/演示',
    schema: pptCover,
  },
  {
    name: '技术路线图',
    id: 'tech-roadmap',
    description: '从 JSON Schema 到多端渲染的技术架构',
    theme: '专业/文档',
    schema: techRoadmap,
  },
  {
    name: '管理后台',
    id: 'admin-dashboard',
    description: '后台管理系统仪表盘',
    theme: '企业/管理',
    schema: adminDashboard,
  },
  {
    name: '用户管理',
    id: 'admin-users',
    description: '用户列表与管理功能',
    theme: '企业/管理',
    schema: adminUsers,
  },
  {
    name: '移动端商城',
    id: 'mobile-app',
    description: '手机端电商应用界面',
    theme: '移动/电商',
    schema: mobileApp,
  },
];

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('tech-dashboard');
  const [showJson, setShowJson] = useState(false);
  const [exporting, setExporting] = useState(false);

  // 导出单个 HTML
  const handleExport = async (item: SchemaItem) => {
    setExporting(true);
    try {
      const html = exportToHTML(item.schema, {
        title: `Stitch Demo - ${item.name}`,
        includeStyles: true,
      });

      // 下载 HTML
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.id}.html`;
      a.click();
      URL.revokeObjectURL(url);

      // 下载 JSON
      const jsonBlob = new Blob([JSON.stringify(item.schema, null, 2)], {
        type: 'application/json',
      });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonA = document.createElement('a');
      jsonA.href = jsonUrl;
      jsonA.download = `${item.id}.json`;
      jsonA.click();
      URL.revokeObjectURL(jsonUrl);
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败: ' + (error as Error).message);
    } finally {
      setExporting(false);
    }
  };

  // 导出所有
  const handleExportAll = async () => {
    setExporting(true);
    try {
      for (const item of schemas) {
        await handleExport(item);
        await new Promise((r) => setTimeout(r, 500));
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stitch Demo</h1>
            <p className="text-gray-600">JSON Schema 驱动的 UI 渲染引擎演示</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowJson(!showJson)}>
              {showJson ? '隐藏 JSON' : '查看 JSON'}
            </Button>
            <Button onClick={handleExportAll} disabled={exporting}>
              {exporting ? '导出中...' : '导出全部'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {schemas.map((item) => (
              <TabsTrigger key={item.id} value={item.id}>
                {item.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {schemas.map((item) => (
            <TabsContent key={item.id} value={item.id}>
              {/* Info Card */}
              <Card className="mb-4">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <Badge variant="secondary">{item.theme}</Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleExport(item)}
                      disabled={exporting}
                    >
                      导出 HTML + JSON
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </CardHeader>
              </Card>

              {/* JSON Preview */}
              {showJson && (
                <Card className="mb-4">
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">JSON Schema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-xs">
                      {JSON.stringify(item.schema, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* Rendered Preview */}
              <Card>
                <CardHeader className="py-2 border-b">
                  <CardTitle className="text-sm">渲染预览</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="border rounded-b-lg overflow-hidden">
                    <StitchRenderer schema={item.schema} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
