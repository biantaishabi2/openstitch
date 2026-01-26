"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * MobileShell - 移动端外壳组件
 *
 * 提供移动端页面的基础布局结构，包括：
 * - safe-area 安全区域处理（刘海屏、底部横条）
 * - 全屏高度布局
 * - 滚动区域管理
 */

interface MobileShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否有底部导航栏，自动添加底部 padding */
  hasBottomNav?: boolean
  /** 是否有顶部导航栏，自动添加顶部 padding */
  hasTopNav?: boolean
}

function MobileShell({
  className,
  children,
  hasBottomNav = false,
  hasTopNav = false,
  ...props
}: MobileShellProps) {
  return (
    <div
      data-slot="mobile-shell"
      className={cn(
        // 基础布局：全屏、flex 列布局
        "flex min-h-screen w-full flex-col bg-background",
        // 安全区域：顶部
        hasTopNav ? "pt-[env(safe-area-inset-top)]" : "",
        // 安全区域：底部（如果有底部导航，由 BottomTabs 处理）
        !hasBottomNav && "pb-[env(safe-area-inset-bottom)]",
        // 防止 iOS 橡皮筋滚动
        "overscroll-none",
        // 触摸滚动优化
        "[&_*]:[-webkit-overflow-scrolling:touch]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * MobileContent - 移动端主内容区
 *
 * 可滚动的主内容区域，自动处理底部导航的避让
 */
interface MobileContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 底部预留空间（用于底部导航避让） */
  bottomOffset?: number
}

function MobileContent({
  className,
  children,
  bottomOffset = 0,
  ...props
}: MobileContentProps) {
  return (
    <div
      data-slot="mobile-content"
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden",
        // 兜底 padding，防止内容贴边
        "p-3",
        // 滚动容器不影响外层
        "overscroll-contain",
        className
      )}
      style={{
        paddingBottom: bottomOffset > 0 ? `calc(${bottomOffset}px + env(safe-area-inset-bottom))` : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * MobileHeader - 移动端顶部导航栏
 */
interface MobileHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 标题 */
  title?: string
  /** 左侧内容 */
  left?: React.ReactNode
  /** 右侧内容 */
  right?: React.ReactNode
}

function MobileHeader({
  className,
  title,
  left,
  right,
  children,
  ...props
}: MobileHeaderProps) {
  return (
    <header
      data-slot="mobile-header"
      className={cn(
        // 固定在顶部
        "sticky top-0 z-40",
        // 安全区域
        "pt-[env(safe-area-inset-top)]",
        // 基础样式
        "flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
      {...props}
    >
      {/* 左侧区域 */}
      <div className="flex min-w-[60px] items-center justify-start">
        {left}
      </div>

      {/* 标题区域 */}
      <div className="flex flex-1 items-center justify-center">
        {title ? (
          <h1 className="text-base font-semibold">{title}</h1>
        ) : (
          children
        )}
      </div>

      {/* 右侧区域 */}
      <div className="flex min-w-[60px] items-center justify-end">
        {right}
      </div>
    </header>
  )
}

export { MobileShell, MobileContent, MobileHeader }
export type { MobileShellProps, MobileContentProps, MobileHeaderProps }
