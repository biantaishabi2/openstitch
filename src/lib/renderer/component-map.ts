/**
 * 组件映射表
 * 将 JSON 中的 type 字符串映射到实际的 React 组件
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

// shadcn 原生组件
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// 插槽包装组件
import { SlottedCard } from './components/slotted-card';
import { SlottedAlert } from './components/slotted-alert';
import { SlottedTable } from './components/slotted-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// 布局组件
import {
  Grid,
  Columns,
  Split,
  Stack,
  Flex,
  Rows,
  Page,
  Center,
  Spacer,
  LayoutDivider,
} from '@/components/ui/layout';

// 通用 Layout 组件（支持 direction, gap, justify, align）
interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  gap?: number;
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  wrap?: boolean;
}

const justifyMap: Record<string, string> = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const alignMap: Record<string, string> = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const Layout: React.FC<LayoutProps> = ({
  direction = 'row',
  gap = 0,
  justify,
  align,
  wrap,
  className,
  children,
  ...props
}) => {
  const classes = cn(
    'flex',
    direction === 'column' ? 'flex-col' : 'flex-row',
    gap > 0 && `gap-${gap}`,
    justify && justifyMap[justify],
    align && alignMap[align],
    wrap && 'flex-wrap',
    className
  );
  return React.createElement('div', { className: classes, ...props }, children);
};

// 自定义扩展组件
import {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineHeader,
  TimelineTitle,
  TimelineDescription,
  TimelineTime,
  TimelineConnector,
  TimelineEmpty,
} from '@/components/ui/timeline';
import { Stepper, Step } from '@/components/ui/stepper';
import { CodeBlock, InlineCode } from '@/components/ui/code-block';
import { Statistic, StatisticCard } from '@/components/ui/statistic';
import { Hero, Section, Container } from '@/components/ui/hero';
import { Icon } from '@/components/ui/icon';
import { List, ListItem } from '@/components/ui/list';
import { EmptyState } from '@/components/ui/empty-state';

// Lucide 图标（动态加载）
import * as LucideIcons from 'lucide-react';

import type { ComponentMap } from './types';

// ============================================
// 基础 HTML 元素包装
// ============================================

// 通用 Div 包装
const Div: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  React.createElement('div', props, children)
);

// 通用 Span 包装
const Span: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ children, ...props }) => (
  React.createElement('span', props, children)
);

// 文本组件（支持变体）
interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'title' | 'subtitle' | 'muted' | 'small' | 'large';
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4';
}

const variantStyles: Record<string, string> = {
  default: 'text-base',  // 移除 text-foreground，让颜色继承父元素
  title: 'text-2xl font-bold',
  subtitle: 'text-lg font-medium',
  muted: 'text-sm text-muted-foreground',  // muted 保留，因为需要特定的灰色
  small: 'text-xs text-muted-foreground',  // small 保留
  large: 'text-xl',
};

const Text: React.FC<TextProps> = ({
  variant = 'default',
  as = 'p',
  className,
  children,
  ...props
}) => {
  return React.createElement(
    as,
    { className: cn(variantStyles[variant], className), ...props },
    children
  );
};

// 链接组件
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean;
}

const Link: React.FC<LinkProps> = ({ external, children, ...props }) => (
  React.createElement(
    'a',
    {
      ...props,
      ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    },
    children
  )
);

// 图片组件
interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  rounded?: boolean;
  aspectRatio?: '1:1' | '16:9' | '4:3';
}

const Image: React.FC<ImageProps> = ({ rounded, aspectRatio, className, ...props }) => {
  const aspectClass = aspectRatio
    ? { '1:1': 'aspect-square', '16:9': 'aspect-video', '4:3': 'aspect-[4/3]' }[aspectRatio]
    : '';
  return React.createElement('img', {
    className: cn(rounded && 'rounded-lg', aspectClass, 'object-cover', className),
    ...props,
  });
};

// ============================================
// 动态图标组件
// ============================================

interface DynamicIconProps extends React.SVGAttributes<SVGSVGElement> {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap: Record<string, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, size = 'md', className, ...props }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return React.createElement(IconComponent, {
    className: cn(sizeMap[size], className),
    ...props,
  });
};

// ============================================
// 组件映射表
// ============================================

export const componentMap: ComponentMap = {
  // ========== 基础元素 ==========
  Div,
  Span,
  Text,
  Link,
  Image,

  // ========== 布局组件 ==========
  Layout,
  Grid,
  Columns,
  Split,
  Stack,
  Flex,
  Rows,
  Page,
  Center,
  Spacer,
  LayoutDivider,

  // ========== 页面组件 ==========
  Hero,
  Section,
  Container,

  // ========== 卡片组件 ==========
  Card: SlottedCard, // 使用插槽包装器支持 slots prop
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,

  // ========== 导航组件 ==========
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Stepper,
  Step,

  // ========== 数据展示 ==========
  Table: SlottedTable,  // 使用插槽包装器
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineHeader,
  TimelineTitle,
  TimelineDescription,
  TimelineTime,
  TimelineConnector,
  TimelineEmpty,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  List,
  ListItem,
  Statistic,
  StatisticCard,
  CodeBlock,
  InlineCode,

  // ========== 表单组件 ==========
  Button,
  Input,
  Label,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Slider,

  // ========== 反馈组件 ==========
  Alert: SlottedAlert, // 使用插槽包装器支持 slots prop
  AlertTitle,
  AlertDescription,
  Badge,
  Progress,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Skeleton,
  EmptyState,

  // ========== 媒体组件 ==========
  Icon: DynamicIcon,
  Avatar,
  AvatarImage,
  AvatarFallback,

  // ========== 其他 ==========
  Separator,
};

// 获取组件
export function getComponent(type: string): React.ComponentType<any> | undefined {
  return componentMap[type];
}

// 检查组件是否存在
export function hasComponent(type: string): boolean {
  return type in componentMap;
}

// 获取所有组件名称
export function getComponentNames(): string[] {
  return Object.keys(componentMap);
}
