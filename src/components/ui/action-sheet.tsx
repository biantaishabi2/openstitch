"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

/**
 * ActionSheet - 移动端操作菜单
 *
 * 基于 Sheet 的底部弹出操作菜单，类似 iOS ActionSheet
 * - 从底部滑入
 * - 支持标题和描述
 * - 操作项列表
 * - 取消按钮
 */

const ActionSheet = SheetPrimitive.Root

const ActionSheetTrigger = SheetPrimitive.Trigger

const ActionSheetClose = SheetPrimitive.Close

const ActionSheetPortal = SheetPrimitive.Portal

const ActionSheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    data-slot="action-sheet-overlay"
    className={cn(
      "fixed inset-0 z-50 bg-black/50",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
ActionSheetOverlay.displayName = "ActionSheetOverlay"

/**
 * ActionSheetContent - 操作菜单内容容器
 */
const ActionSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ActionSheetPortal>
    <ActionSheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      data-slot="action-sheet-content"
      className={cn(
        // 固定在底部
        "fixed inset-x-0 bottom-0 z-50",
        // 安全区域
        "pb-[env(safe-area-inset-bottom)]",
        // 基础样式
        "flex flex-col gap-2 bg-background p-4",
        // 圆角（只有顶部）
        "rounded-t-xl",
        // 动画
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        "duration-300",
        className
      )}
      {...props}
    >
      {/* 顶部拖拽指示条 */}
      <div className="mx-auto h-1 w-12 shrink-0 rounded-full bg-muted" />
      {children}
    </SheetPrimitive.Content>
  </ActionSheetPortal>
))
ActionSheetContent.displayName = "ActionSheetContent"

/**
 * ActionSheetHeader - 操作菜单头部
 */
const ActionSheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="action-sheet-header"
    className={cn("flex flex-col items-center gap-1 py-2 text-center", className)}
    {...props}
  />
))
ActionSheetHeader.displayName = "ActionSheetHeader"

/**
 * ActionSheetTitle - 操作菜单标题
 */
const ActionSheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    data-slot="action-sheet-title"
    className={cn("text-sm font-medium text-muted-foreground", className)}
    {...props}
  />
))
ActionSheetTitle.displayName = "ActionSheetTitle"

/**
 * ActionSheetDescription - 操作菜单描述
 */
const ActionSheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    data-slot="action-sheet-description"
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
))
ActionSheetDescription.displayName = "ActionSheetDescription"

/**
 * ActionSheetGroup - 操作项分组
 */
const ActionSheetGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="action-sheet-group"
    className={cn(
      "flex flex-col overflow-hidden rounded-xl bg-muted/50",
      className
    )}
    {...props}
  />
))
ActionSheetGroup.displayName = "ActionSheetGroup"

/**
 * ActionSheetItem - 操作项
 */
interface ActionSheetItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 是否为危险操作（红色） */
  destructive?: boolean
}

const ActionSheetItem = React.forwardRef<HTMLButtonElement, ActionSheetItemProps>(
  ({ className, destructive, ...props }, ref) => (
    <button
      ref={ref}
      data-slot="action-sheet-item"
      className={cn(
        // 基础样式
        "flex min-h-[50px] w-full items-center justify-center",
        // 字体
        "text-base font-normal",
        // 分隔线
        "border-b border-border last:border-b-0",
        // 颜色
        destructive ? "text-destructive" : "text-foreground",
        // 触摸反馈
        "active:bg-muted/80 transition-colors",
        // 禁用状态
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)
ActionSheetItem.displayName = "ActionSheetItem"

/**
 * ActionSheetCancel - 取消按钮
 */
const ActionSheetCancel = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Close>
>(({ className, children, ...props }, ref) => (
  <SheetPrimitive.Close
    ref={ref}
    data-slot="action-sheet-cancel"
    className={cn(
      // 基础样式
      "flex min-h-[50px] w-full items-center justify-center rounded-xl bg-muted/50",
      // 字体
      "text-base font-semibold text-primary",
      // 触摸反馈
      "active:bg-muted/80 transition-colors",
      className
    )}
    {...props}
  >
    {children || "取消"}
  </SheetPrimitive.Close>
))
ActionSheetCancel.displayName = "ActionSheetCancel"

export {
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
}
