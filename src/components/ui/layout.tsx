import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================
// 类型定义
// ============================================

type SlotContent = React.ReactNode;
type Slots = Record<string, SlotContent>;

// ============================================
// Grid 网格布局
// ============================================

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  slots?: Slots;
}

const gridColsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

const gapMap: Record<number, string> = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
};

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, columns = 3, gap = 4, slots, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('grid', gridColsMap[columns], gapMap[gap], className)}
        {...props}
      >
        {slots
          ? Object.entries(slots)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([key, content]) => (
                <div key={key} data-slot={key}>
                  {content}
                </div>
              ))
          : children}
      </div>
    );
  }
);
Grid.displayName = 'Grid';

// ============================================
// Columns 多列布局（语义化）
// ============================================

interface ColumnsProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: string; // "1:2:1" 或 "equal"
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
  slots?: Slots;
}

const Columns = React.forwardRef<HTMLDivElement, ColumnsProps>(
  ({ className, layout = '1:1', gap = 4, slots, children, ...props }, ref) => {
    const ratios = layout === 'equal' ? [] : layout.split(':').map(Number);

    return (
      <div ref={ref} className={cn('flex', gapMap[gap], className)} {...props}>
        {slots
          ? Object.entries(slots).map(([key, content], index) => (
              <div
                key={key}
                data-slot={key}
                style={ratios.length > 0 ? { flex: ratios[index] || 1 } : { flex: 1 }}
              >
                {content}
              </div>
            ))
          : children}
      </div>
    );
  }
);
Columns.displayName = 'Columns';

// ============================================
// Split 左右分栏
// ============================================

interface SplitProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: string; // "1:1" 或 "1:2" 或 "2:1"
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
  vertical?: boolean;
  slots?: {
    left?: SlotContent;
    right?: SlotContent;
    top?: SlotContent;
    bottom?: SlotContent;
  };
}

const Split = React.forwardRef<HTMLDivElement, SplitProps>(
  ({ className, ratio = '1:1', gap = 4, vertical = false, slots, ...props }, ref) => {
    const [first, second] = ratio.split(':').map(Number);

    return (
      <div
        ref={ref}
        className={cn('flex', vertical ? 'flex-col' : 'flex-row', gapMap[gap], className)}
        {...props}
      >
        <div style={{ flex: first }} data-slot={vertical ? 'top' : 'left'}>
          {vertical ? slots?.top : slots?.left}
        </div>
        <div style={{ flex: second }} data-slot={vertical ? 'bottom' : 'right'}>
          {vertical ? slots?.bottom : slots?.right}
        </div>
      </div>
    );
  }
);
Split.displayName = 'Split';

// ============================================
// Stack 垂直堆叠
// ============================================

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

const alignMap: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, gap = 4, align = 'stretch', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col', gapMap[gap], alignMap[align], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Stack.displayName = 'Stack';

// ============================================
// Flex 弹性布局
// ============================================

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
}

const directionMap: Record<string, string> = {
  row: 'flex-row',
  col: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'col-reverse': 'flex-col-reverse',
};

const justifyMap: Record<string, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const flexAlignMap: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      direction = 'row',
      justify = 'start',
      align = 'stretch',
      wrap = false,
      gap = 0,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionMap[direction],
          justifyMap[justify],
          flexAlignMap[align],
          wrap && 'flex-wrap',
          gapMap[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Flex.displayName = 'Flex';

// ============================================
// Rows 多行布局
// ============================================

interface RowsProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
  slots?: Slots;
}

const Rows = React.forwardRef<HTMLDivElement, RowsProps>(
  ({ className, gap = 4, slots, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col', gapMap[gap], className)} {...props}>
        {slots
          ? Object.entries(slots)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([key, content]) => (
                <div key={key} data-slot={key}>
                  {content}
                </div>
              ))
          : children}
      </div>
    );
  }
);
Rows.displayName = 'Rows';

// ============================================
// Page 页面容器
// ============================================

interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  fullHeight?: boolean;
  centered?: boolean;
  padding?: 0 | 4 | 6 | 8 | 12;
}

const paddingMap: Record<number, string> = {
  0: 'p-0',
  4: 'p-4',
  6: 'p-6',
  8: 'p-8',
  12: 'p-12',
};

const Page = React.forwardRef<HTMLDivElement, PageProps>(
  ({ className, fullHeight = true, centered = false, padding = 0, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full bg-background',
          fullHeight && 'min-h-screen',
          centered && 'flex flex-col items-center justify-center',
          paddingMap[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Page.displayName = 'Page';

// ============================================
// Center 居中容器
// ============================================

interface CenterProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthMap: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

const Center = React.forwardRef<HTMLDivElement, CenterProps>(
  ({ className, maxWidth, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center',
          maxWidth && maxWidthMap[maxWidth],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Center.displayName = 'Center';

// ============================================
// Spacer 间隔组件
// ============================================

interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20;
}

const spacerSizeMap: Record<number, string> = {
  1: 'h-1',
  2: 'h-2',
  3: 'h-3',
  4: 'h-4',
  5: 'h-5',
  6: 'h-6',
  8: 'h-8',
  10: 'h-10',
  12: 'h-12',
  16: 'h-16',
  20: 'h-20',
};

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, size = 4, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('w-full', spacerSizeMap[size], className)}
        {...props}
      />
    );
  }
);
Spacer.displayName = 'Spacer';

// ============================================
// Divider 分割线（带布局功能）
// ============================================

interface LayoutDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

const LayoutDivider = React.forwardRef<HTMLDivElement, LayoutDividerProps>(
  ({ className, orientation = 'horizontal', label, ...props }, ref) => {
    if (label) {
      return (
        <div
          ref={ref}
          className={cn('flex items-center gap-4', className)}
          {...props}
        >
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">{label}</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
          'bg-border',
          className
        )}
        {...props}
      />
    );
  }
);
LayoutDivider.displayName = 'LayoutDivider';

export {
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
};
