/**
 * SlottedSidebar - 侧边栏包装组件
 * 自动包含 SidebarProvider，简化 DSL 使用
 */

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from '@/components/ui/sidebar';

interface SlottedSidebarProps extends React.ComponentProps<typeof Sidebar> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SlottedSidebar: React.FC<SlottedSidebarProps> = ({
  header,
  footer,
  children,
  defaultOpen = true,
  open,
  onOpenChange,
  ...props
}) => {
  return (
    <SidebarProvider defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
      <Sidebar {...props}>
        {header && <SidebarHeader>{header}</SidebarHeader>}
        <SidebarContent>{children}</SidebarContent>
        {footer && <SidebarFooter>{footer}</SidebarFooter>}
      </Sidebar>
    </SidebarProvider>
  );
};
