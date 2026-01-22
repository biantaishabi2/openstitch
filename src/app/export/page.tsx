'use client';

import { useRef, useState } from 'react';
import { StitchRenderer, downloadAsHTML, downloadAsImage, availableThemes } from '@/lib/renderer';
import type { UINode, ThemeName } from '@/lib/renderer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 示例 Schema
const demoSchema: UINode = {
  type: 'Card',
  children: [
    {
      type: 'CardHeader',
      children: [
        {
          type: 'Flex',
          props: { align: 'center', gap: 3 },
          children: [
            { type: 'Icon', props: { name: 'Sparkles', size: 'lg' } },
            { type: 'CardTitle', children: 'Stitch 导出演示' },
          ],
        },
        { type: 'CardDescription', children: '支持导出 HTML 和 PNG 图片' },
      ],
    },
    {
      type: 'CardContent',
      children: [
        {
          type: 'Grid',
          props: { columns: 3, gap: 4 },
          slots: {
            '1': {
              type: 'Stack',
              props: { gap: 2 },
              children: [
                { type: 'Icon', props: { name: 'FileCode', size: 'xl' } },
                { type: 'Text', props: { variant: 'subtitle' }, children: 'HTML 导出' },
                { type: 'Text', props: { variant: 'muted' }, children: '完整 HTML + Tailwind' },
              ],
            },
            '2': {
              type: 'Stack',
              props: { gap: 2 },
              children: [
                { type: 'Icon', props: { name: 'Image', size: 'xl' } },
                { type: 'Text', props: { variant: 'subtitle' }, children: 'PNG 导出' },
                { type: 'Text', props: { variant: 'muted' }, children: '高清截图' },
              ],
            },
            '3': {
              type: 'Stack',
              props: { gap: 2 },
              children: [
                { type: 'Icon', props: { name: 'Palette', size: 'xl' } },
                { type: 'Text', props: { variant: 'subtitle' }, children: '样式保留' },
                { type: 'Text', props: { variant: 'muted' }, children: 'Tailwind CSS' },
              ],
            },
          },
        },
      ],
    },
    {
      type: 'CardFooter',
      children: [
        {
          type: 'Flex',
          props: { gap: 4 },
          children: [
            { type: 'Badge', children: 'React' },
            { type: 'Badge', props: { variant: 'secondary' }, children: 'Next.js' },
            { type: 'Badge', props: { variant: 'outline' }, children: 'Tailwind' },
          ],
        },
      ],
    },
  ],
};

// 更复杂的示例
const complexSchema: UINode = {
  type: 'Stack',
  props: { gap: 6 },
  children: [
    {
      type: 'Hero',
      props: {
        title: '数据统计报告',
        subtitle: '2024年第一季度',
        size: 'sm',
      },
    },
    {
      type: 'Grid',
      props: { columns: 4, gap: 4 },
      slots: {
        '1': {
          type: 'Card',
          props: { className: 'p-6' },
          children: [
            {
              type: 'Statistic',
              props: { title: '总用户', value: '12,345', trend: 'up', trendValue: '+15%' },
            },
          ],
        },
        '2': {
          type: 'Card',
          props: { className: 'p-6' },
          children: [
            {
              type: 'Statistic',
              props: { title: '活跃率', value: '89.5%', trend: 'up', trendValue: '+3.2%' },
            },
          ],
        },
        '3': {
          type: 'Card',
          props: { className: 'p-6' },
          children: [
            {
              type: 'Statistic',
              props: { title: '转化率', value: '23.8%', trend: 'down', trendValue: '-1.5%' },
            },
          ],
        },
        '4': {
          type: 'Card',
          props: { className: 'p-6' },
          children: [
            {
              type: 'Statistic',
              props: { title: '收入', value: '¥1.2M', trend: 'up', trendValue: '+28%' },
            },
          ],
        },
      },
    },
    {
      type: 'Card',
      children: [
        {
          type: 'CardHeader',
          children: [{ type: 'CardTitle', children: '最近活动' }],
        },
        {
          type: 'CardContent',
          children: [
            {
              type: 'Timeline',
              children: [
                {
                  type: 'TimelineItem',
                  props: { title: '系统更新', description: '完成 v2.0 版本部署', status: 'completed' },
                },
                {
                  type: 'TimelineItem',
                  props: { title: '数据同步', description: '正在同步用户数据', status: 'in-progress' },
                },
                {
                  type: 'TimelineItem',
                  props: { title: '功能上线', description: '新功能待发布', status: 'pending' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// 主题名称映射
const themeLabels: Record<ThemeName, string> = {
  default: '默认（黑白灰）',
  blue: '蓝色',
  green: '绿色',
  purple: '紫色',
  orange: '橙色',
  rose: '玫瑰色',
  dark: '暗色',
};

export default function ExportPage() {
  const simpleRef = useRef<HTMLDivElement>(null);
  const complexRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('default');

  const handleExportHTML = (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    downloadAsHTML(ref.current, filename, { theme: selectedTheme });
  };

  const handleExportImage = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    setExporting(true);
    try {
      await downloadAsImage(ref.current, filename, { scale: 2 });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Stitch 导出功能</h1>
          <p className="text-muted-foreground">支持导出 HTML 和 PNG 图片，可选择主题颜色</p>

          {/* 主题选择器 */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-medium">导出主题：</span>
            <Select value={selectedTheme} onValueChange={(v) => setSelectedTheme(v as ThemeName)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableThemes.map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {themeLabels[theme]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 简单示例 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">示例 1：卡片组件</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleExportHTML(simpleRef, 'card-demo.html')}
              >
                导出 HTML
              </Button>
              <Button
                onClick={() => handleExportImage(simpleRef, 'card-demo.png')}
                disabled={exporting}
              >
                {exporting ? '导出中...' : '导出 PNG'}
              </Button>
            </div>
          </div>
          <div ref={simpleRef} className="p-4 border rounded-lg bg-white">
            <StitchRenderer schema={demoSchema} />
          </div>
        </section>

        {/* 复杂示例 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">示例 2：数据报告</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleExportHTML(complexRef, 'report-demo.html')}
              >
                导出 HTML
              </Button>
              <Button
                onClick={() => handleExportImage(complexRef, 'report-demo.png')}
                disabled={exporting}
              >
                {exporting ? '导出中...' : '导出 PNG'}
              </Button>
            </div>
          </div>
          <div ref={complexRef} className="p-4 border rounded-lg bg-white">
            <StitchRenderer schema={complexSchema} />
          </div>
        </section>

        {/* 使用说明 */}
        <section className="bg-muted rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">使用方法</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">HTML 导出</h3>
              <pre className="bg-background p-4 rounded text-sm overflow-x-auto">
{`import { downloadAsHTML } from '@/lib/renderer';

// 获取 DOM 元素引用
const ref = useRef<HTMLDivElement>(null);

// 下载 HTML 文件
downloadAsHTML(ref.current, 'export.html');`}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">图片导出</h3>
              <pre className="bg-background p-4 rounded text-sm overflow-x-auto">
{`import { downloadAsImage } from '@/lib/renderer';

// 获取 DOM 元素引用
const ref = useRef<HTMLDivElement>(null);

// 下载 PNG 图片（2倍清晰度）
await downloadAsImage(ref.current, 'export.png', {
  scale: 2,
});`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
