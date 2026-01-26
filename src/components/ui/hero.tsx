import * as React from 'react';
import { cn } from '@/lib/utils';

interface HeroProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'full';
  overlay?: boolean;
  actions?: React.ReactNode;
}

const Hero = React.forwardRef<HTMLDivElement, HeroProps>(
  (
    {
      className,
      title,
      subtitle,
      description,
      backgroundImage,
      backgroundColor = 'bg-gradient-to-br from-slate-900 to-slate-800',
      align = 'center',
      size = 'lg',
      overlay = true,
      actions,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'min-h-[300px] py-12',
      md: 'min-h-[400px] py-16',
      lg: 'min-h-[500px] py-20',
      full: 'min-h-screen py-24',
    };

    const alignClasses = {
      left: 'text-left items-start',
      center: 'text-center items-center',
      right: 'text-right items-end',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex flex-col justify-center overflow-hidden',
          sizeClasses[size],
          !backgroundImage && backgroundColor,
          className
        )}
        style={
          backgroundImage
            ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
        {...props}
      >
        {/* 遮罩层 */}
        {overlay && backgroundImage && (
          <div className="absolute inset-0 bg-black/50" />
        )}

        {/* 内容 */}
        <div
          className={cn(
            'relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-6',
            alignClasses[align]
          )}
        >
          {subtitle && (
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              {subtitle}
            </span>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-lg text-slate-300 sm:text-xl">
              {description}
            </p>
          )}
          {actions && <div className="flex gap-4 mt-4">{actions}</div>}
          {children}
        </div>
      </div>
    );
  }
);
Hero.displayName = 'Hero';

// 简单的Section组件
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  description?: string;
  /** 布局模式: auto(自动检测), grid(网格), flex(弹性), none(不包裹) */
  layout?: 'auto' | 'grid' | 'flex' | 'none';
  /** 网格列数 */
  columns?: 1 | 2 | 3 | 4;
  /** 子元素间距 */
  gap?: 2 | 4 | 6 | 8;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, title, subtitle, description, layout = 'auto', columns, gap = 6, children, ...props }, ref) => {
    // 计算子元素数量
    const childCount = React.Children.count(children);

    // 自动检测布局模式
    const effectiveLayout = React.useMemo(() => {
      if (layout !== 'auto') return layout;
      // 多个子元素时自动使用 grid
      if (childCount > 1) return 'grid';
      return 'none';
    }, [layout, childCount]);

    // 自动计算列数
    const effectiveColumns = React.useMemo(() => {
      if (columns) return columns;
      if (effectiveLayout !== 'grid') return 1;
      // 根据子元素数量自动选择列数
      if (childCount <= 2) return 2;
      if (childCount === 3) return 3;
      return 4; // 4个或更多用4列
    }, [columns, effectiveLayout, childCount]);

    // 容器样式
    const containerClasses = React.useMemo(() => {
      const gapClass = `gap-${gap}`;

      if (effectiveLayout === 'grid') {
        const colsClass = {
          1: 'grid-cols-1',
          2: 'grid-cols-1 md:grid-cols-2',
          3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        }[effectiveColumns];
        return cn('grid', colsClass, gapClass);
      }

      if (effectiveLayout === 'flex') {
        return cn('flex flex-wrap', gapClass, 'justify-center');
      }

      return '';
    }, [effectiveLayout, effectiveColumns, gap]);

    // 渲染子元素
    const renderedChildren = effectiveLayout === 'none'
      ? children
      : <div className={containerClasses}>{children}</div>;

    return (
      <section
        ref={ref}
        className={cn('py-12 md:py-16 lg:py-20 px-4 md:px-6', className)}
        {...props}
      >
        {(title || subtitle || description) && (
          <div className="mx-auto max-w-2xl text-center mb-12">
            {subtitle && (
              <span className="text-sm font-medium uppercase tracking-widest text-primary">
                {subtitle}
              </span>
            )}
            {title && (
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-lg text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        {renderedChildren}
      </section>
    );
  }
);
Section.displayName = 'Section';

// Container组件
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-full',
    };

    return (
      <div
        ref={ref}
        className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Container.displayName = 'Container';

// 页头组件
interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, sticky, children, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b bg-background',
          sticky && 'sticky top-0 z-50',
          className
        )}
        {...props}
      >
        {children}
      </header>
    );
  }
);
Header.displayName = 'Header';

// 页脚组件
interface FooterProps extends React.HTMLAttributes<HTMLElement> {}

const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn(
          'flex items-center justify-between px-4 py-6 border-t bg-muted/40',
          className
        )}
        {...props}
      >
        {children}
      </footer>
    );
  }
);
Footer.displayName = 'Footer';

export { Hero, Section, Container, Header, Footer };
