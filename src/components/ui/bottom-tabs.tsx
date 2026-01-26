"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import * as LucideIcons from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * BottomTabs - 移动端底部标签栏
 *
 * 基于 Radix Tabs 的移动端底部导航组件，特点：
 * - 固定在屏幕底部
 * - 支持 safe-area 安全区域
 * - 触摸友好（44px 最小点击区域）
 * - 支持图标 + 文字布局
 */

/**
 * 根据图标名称获取 Lucide 图标组件
 */
function getIconComponent(iconName: string): React.ComponentType<{ className?: string }> | null {
  const IconComponent = (LucideIcons as Record<string, unknown>)[iconName] as
    | React.ComponentType<{ className?: string }>
    | undefined
  return IconComponent || null
}

const BottomTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    data-slot="bottom-tabs"
    className={cn("flex min-h-screen flex-col", className)}
    {...props}
  />
))
BottomTabs.displayName = "BottomTabs"

/**
 * BottomTabsList - 底部标签栏容器
 *
 * 固定定位在底部，处理 safe-area
 */
const BottomTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-slot="bottom-tabs-list"
    className={cn(
      // 固定在底部
      "fixed inset-x-0 bottom-0 z-50",
      // 安全区域：底部横条
      "pb-[env(safe-area-inset-bottom)]",
      // 基础样式
      "flex h-16 items-center justify-around border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      // 阴影
      "shadow-[0_-1px_3px_rgba(0,0,0,0.05)]",
      className
    )}
    {...props}
  />
))
BottomTabsList.displayName = "BottomTabsList"

/**
 * BottomTabsTrigger - 底部标签项
 *
 * 支持图标 + 文字的垂直布局
 */
interface BottomTabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /** 图标组件或图标名称 */
  icon?: React.ReactNode | string
  /** 标签文字 */
  label?: string
}

const BottomTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  BottomTabsTriggerProps
>(({ className, icon, label, children, ...props }, ref) => {
  // 处理图标：支持字符串名称或 React 节点
  let iconElement: React.ReactNode = null
  if (icon) {
    if (typeof icon === 'string') {
      const IconComponent = getIconComponent(icon)
      if (IconComponent) {
        iconElement = <IconComponent className="h-5 w-5" />
      }
    } else {
      iconElement = icon
    }
  }

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="bottom-tabs-trigger"
      className={cn(
        // 布局：垂直居中
        "flex flex-1 flex-col items-center justify-center gap-1",
        // 最小点击区域 44px
        "min-h-[44px] min-w-[44px]",
        // 触摸反馈
        "active:scale-[0.97] transition-transform duration-100",
        // 颜色状态
        "text-muted-foreground",
        "data-[state=active]:text-primary",
        // 禁用选中高亮
        "focus-visible:outline-none",
        className
      )}
      {...props}
    >
      {/* 图标 */}
      {iconElement && (
        <span className="flex h-6 w-6 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
          {iconElement}
        </span>
      )}
      {/* 文字 */}
      {label && (
        <span className="text-[10px] font-medium leading-none">{label}</span>
      )}
      {/* 自定义内容 */}
      {!icon && !label && children}
    </TabsPrimitive.Trigger>
  )
})
BottomTabsTrigger.displayName = "BottomTabsTrigger"

/**
 * BottomTabsContent - 标签内容区
 *
 * 自动处理底部导航的避让空间
 */
const BottomTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    data-slot="bottom-tabs-content"
    className={cn(
      // 占满剩余空间
      "flex-1 overflow-y-auto overflow-x-hidden",
      // 底部留出 TabBar 空间 + safe-area
      "pb-[calc(4rem+env(safe-area-inset-bottom)+1rem)]",
      // 滚动优化
      "overscroll-contain",
      // 动画
      "data-[state=inactive]:hidden",
      className
    )}
    {...props}
  />
))
BottomTabsContent.displayName = "BottomTabsContent"

export { BottomTabs, BottomTabsList, BottomTabsTrigger, BottomTabsContent }
