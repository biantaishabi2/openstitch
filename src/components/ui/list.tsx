import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  divided?: boolean;
}

const List = React.forwardRef<HTMLUListElement, ListProps>(
  ({ className, divided = false, children, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn(
          'w-full',
          divided && 'divide-y divide-border',
          className
        )}
        {...props}
      >
        {children}
      </ul>
    );
  }
);
List.displayName = 'List';

interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  avatar?: React.ReactNode;
  extra?: React.ReactNode;
  action?: React.ReactNode;
  clickable?: boolean;
  selected?: boolean;
}

const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  (
    {
      className,
      title,
      description,
      icon,
      avatar,
      extra,
      action,
      clickable = false,
      selected = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <li
        ref={ref}
        className={cn(
          'flex items-center gap-4 py-3 px-4',
          clickable && 'cursor-pointer hover:bg-muted/50 transition-colors',
          selected && 'bg-muted',
          className
        )}
        {...props}
      >
        {/* 左侧图标或头像 */}
        {(icon || avatar) && (
          <div className="flex-shrink-0">
            {avatar || (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                {icon}
              </div>
            )}
          </div>
        )}

        {/* 主内容 */}
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-medium text-foreground truncate">
              {title}
            </p>
          )}
          {description && (
            <p className="text-sm text-muted-foreground truncate">
              {description}
            </p>
          )}
          {children}
        </div>

        {/* 右侧额外内容 */}
        {extra && (
          <div className="flex-shrink-0 text-sm text-muted-foreground">
            {extra}
          </div>
        )}

        {/* 右侧操作 */}
        {action && <div className="flex-shrink-0">{action}</div>}

        {/* 可点击时显示箭头 */}
        {clickable && !action && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </li>
    );
  }
);
ListItem.displayName = 'ListItem';

export { List, ListItem };
