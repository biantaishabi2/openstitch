/**
 * 组件映射表
 * 将 JSON 中的 type 字符串映射到实际的 React 组件
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================
// shadcn 原生组件导入
// ============================================

// 基础组件
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuPortal, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarGroup, MenubarItem, MenubarLabel, MenubarMenu, MenubarPortal, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from '@/components/ui/menubar';
import { NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport } from '@/components/ui/navigation-menu';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ============================================
// 布局组件
// ============================================
import { Grid, Columns, Split, Stack, Flex, Rows, Page, Center, Spacer, LayoutDivider } from '@/components/ui/layout';

// ============================================
// 自定义扩展组件
// ============================================
import { Timeline, TimelineItem, TimelineContent, TimelineHeader, TimelineTitle, TimelineDescription, TimelineTime, TimelineConnector, TimelineEmpty } from '@/components/ui/timeline';
import { Stepper, Step } from '@/components/ui/stepper';
import { CodeBlock, InlineCode } from '@/components/ui/code-block';
import { Statistic, StatisticCard } from '@/components/ui/statistic';
import { Hero, Section, Container, Header, Footer } from '@/components/ui/hero';
import { Icon } from '@/components/ui/icon';
import { List, ListItem } from '@/components/ui/list';
import { EmptyState } from '@/components/ui/empty-state';
import { Markdown } from '@/components/ui/markdown';

// ============================================
// 移动端专用组件
// ============================================
import { MobileShell, MobileContent, MobileHeader } from '@/components/ui/mobile-shell';
import { BottomTabs, BottomTabsList, BottomTabsTrigger, BottomTabsContent } from '@/components/ui/bottom-tabs';
import {
  ActionSheet,
  ActionSheetTrigger,
  ActionSheetClose,
  ActionSheetContent,
  ActionSheetHeader,
  ActionSheetTitle,
  ActionSheetDescription,
  ActionSheetGroup,
  ActionSheetItem,
  ActionSheetCancel,
} from '@/components/ui/action-sheet';

// ============================================
// 装饰/动画组件
// ============================================
import { AnimatedBeam } from '@/components/ui/animated-beam';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { AvatarCircles } from '@/components/ui/avatar-circles';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { BlurFade } from '@/components/ui/blur-fade';
import { BorderBeam } from '@/components/ui/border-beam';
import Confetti from '@/components/ui/confetti';
import { Dock, DockIcon } from '@/components/ui/dock';
import { DotPattern } from '@/components/ui/dot-pattern';
import Globe from '@/components/ui/globe';
import { GridPattern } from '@/components/ui/grid-pattern';
import HeroVideoDialog from '@/components/ui/hero-video-dialog';
import HyperText from '@/components/ui/hyper-text';
import IconCloud from '@/components/ui/icon-cloud';
import { MagicCard } from '@/components/ui/magic-card';
import Marquee from '@/components/ui/marquee';
import Meteors from '@/components/ui/meteors';
import NumberTicker from '@/components/ui/number-ticker';
import OrbitingCircles from '@/components/ui/orbiting-circles';
import Particles from '@/components/ui/particles';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { RetroGrid } from '@/components/ui/retro-grid';
import Ripple from '@/components/ui/ripple';
import Safari from '@/components/ui/safari';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { ShineBorder } from '@/components/ui/shine-border';
import { Toaster } from '@/components/ui/sonner';
import TextReveal from '@/components/ui/text-reveal';
import { TypingAnimation } from '@/components/ui/typing-animation';
import WordRotate from '@/components/ui/word-rotate';

// ============================================
// 插槽包装组件
// ============================================
import { SlottedCard } from './components/slotted-card';
import { SlottedAlert } from './components/slotted-alert';
import { SlottedTable } from './components/slotted-table';
import { SlottedSelect } from './components/slotted-select';
import { SlottedCheckbox } from './components/slotted-checkbox';
import { SlottedSwitch } from './components/slotted-switch';
import { SlottedTabs } from './components/slotted-tabs';
import { SlottedSidebar } from './components/slotted-sidebar';

// Lucide 图标（动态加载）
import * as LucideIcons from 'lucide-react';

import type { ComponentMap } from './types';

// ============================================
// 通用 Layout 组件（支持 direction, gap, justify, align）
// ============================================
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

// ============================================
// 基础 HTML 元素包装
// ============================================

const Div: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  React.createElement('div', props, children)
);

const Span: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ children, ...props }) => (
  React.createElement('span', props, children)
);

// 文本组件（支持变体）
interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'title' | 'subtitle' | 'muted' | 'small' | 'large';
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4';
}

const variantStyles: Record<string, string> = {
  default: 'text-base',
  title: 'text-2xl font-bold',
  subtitle: 'text-lg font-medium',
  muted: 'text-sm text-muted-foreground',
  small: 'text-xs text-muted-foreground',
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
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
  alt?: string;
}

const sizeMap: Record<string, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  size = 'md',
  className,
  src,
  alt,
  ...props
}) => {
  const mergedClassName = cn(sizeMap[size], className);

  // 如果提供了导出的资产 URL，直接渲染为图片以贴合设计稿
  if (src) {
    return React.createElement('img', {
      src,
      alt: alt || name || '',
      className: mergedClassName,
      ...props,
    });
  }

  if (!name) return null;

  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return React.createElement(IconComponent, {
    className: mergedClassName,
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
  Markdown,
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
  AspectRatio,

  // ========== 页面组件 ==========
  Hero,
  Section,
  Container,
  Header,
  Footer,

  // ========== 卡片组件 ==========
  Card: SlottedCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,

  // ========== 导航组件 ==========
  // Tabs
  Tabs: SlottedTabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  // Breadcrumb
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  // Stepper
  Stepper,
  Step,
  // Navigation Menu
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  // Menubar
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarShortcut,
  // Pagination
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  // Sidebar (shadcn with provider wrapper)
  Sidebar: SlottedSidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarGroupAction,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInput,
  SidebarInset,

  // ========== 数据展示 ==========
  // Table
  Table: SlottedTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  // Timeline
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineHeader,
  TimelineTitle,
  TimelineDescription,
  TimelineTime,
  TimelineConnector,
  TimelineEmpty,
  // Accordion
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  // Collapsible
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  // List
  List,
  ListItem,
  // Statistic
  Statistic,
  StatisticCard,
  // Code
  CodeBlock,
  InlineCode,
  // Carousel
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  // Calendar
  Calendar,
  // Scroll Area
  ScrollArea,
  ScrollBar,
  // Resizable
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,

  // ========== 表单组件 ==========
  // Button
  Button,
  // Input
  Input,
  Textarea,
  // Label
  Label,
  // Checkbox & Switch
  Checkbox: SlottedCheckbox,
  Switch: SlottedSwitch,
  // Radio
  RadioGroup,
  RadioGroupItem,
  // Slider
  Slider,
  // Select
  Select: SlottedSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  // Toggle
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  // Input OTP
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  // Form (react-hook-form)
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,

  // ========== 反馈组件 ==========
  // Alert
  Alert: SlottedAlert,
  AlertTitle,
  AlertDescription,
  // Badge
  Badge,
  // Progress
  Progress,
  // Dialog
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  // Sheet
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  // Drawer
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerOverlay,
  DrawerPortal,
  // Tooltip
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  // Popover
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  // Hover Card
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  // Skeleton
  Skeleton,
  // Empty State
  EmptyState,
  // Toaster (sonner)
  Toaster,

  // ========== 菜单组件 ==========
  // Dropdown Menu
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  // Context Menu
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
  // Command
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,

  // ========== 媒体组件 ==========
  Icon: DynamicIcon,
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarCircles,

  // ========== 其他 ==========
  Separator,

  // ========== 移动端组件 ==========
  // MobileShell
  MobileShell,
  MobileContent,
  MobileHeader,
  // BottomTabs
  BottomTabs,
  BottomTabsList,
  BottomTabsTrigger,
  BottomTabsContent,
  // ActionSheet
  ActionSheet,
  ActionSheetTrigger,
  ActionSheetClose,
  ActionSheetContent,
  ActionSheetHeader,
  ActionSheetTitle,
  ActionSheetDescription,
  ActionSheetGroup,
  ActionSheetItem,
  ActionSheetCancel,

  // ========== 装饰/动画组件 ==========
  AnimatedBeam,
  AnimatedGridPattern,
  AnimatedShinyText,
  BentoGrid,
  BentoCard,
  BlurFade,
  BorderBeam,
  Confetti,
  Dock,
  DockIcon,
  DotPattern,
  Globe,
  GridPattern,
  HeroVideoDialog,
  HyperText,
  IconCloud,
  MagicCard,
  Marquee,
  Meteors,
  NumberTicker,
  OrbitingCircles,
  Particles,
  RainbowButton,
  RetroGrid,
  Ripple,
  Safari,
  ShimmerButton,
  ShineBorder,
  TextReveal,
  TypingAnimation,
  WordRotate,
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
