import * as React from 'react';
import { cn } from '@/lib/utils';
import { Inbox, FileX, Search, FolderOpen } from 'lucide-react';

type EmptyStateType = 'default' | 'no-data' | 'no-results' | 'empty-folder';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: EmptyStateType;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const defaultConfig: Record<EmptyStateType, { icon: React.ReactNode; title: string; description: string }> = {
  default: {
    icon: <Inbox className="h-12 w-12" />,
    title: '暂无内容',
    description: '目前没有可显示的内容',
  },
  'no-data': {
    icon: <FileX className="h-12 w-12" />,
    title: '暂无数据',
    description: '还没有任何数据记录',
  },
  'no-results': {
    icon: <Search className="h-12 w-12" />,
    title: '未找到结果',
    description: '没有符合搜索条件的结果',
  },
  'empty-folder': {
    icon: <FolderOpen className="h-12 w-12" />,
    title: '文件夹为空',
    description: '此文件夹中没有任何文件',
  },
};

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      type = 'default',
      icon,
      title,
      description,
      action,
      children,
      ...props
    },
    ref
  ) => {
    const config = defaultConfig[type];

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-12 px-4 text-center',
          className
        )}
        {...props}
      >
        <div className="text-muted-foreground/50 mb-4">
          {icon || config.icon}
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          {title || config.title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description || config.description}
        </p>
        {action && <div>{action}</div>}
        {children}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

export { EmptyState };
