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
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, title, subtitle, description, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn('py-12 md:py-16 lg:py-20', className)}
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
        {children}
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

export { Hero, Section, Container };
