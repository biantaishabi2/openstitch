import * as React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatisticProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'prefix'> {
  title?: string;
  value: string | number;
  valuePrefix?: React.ReactNode;
  valueSuffix?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
  loading?: boolean;
}

const Statistic = React.forwardRef<HTMLDivElement, StatisticProps>(
  (
    {
      className,
      title,
      value,
      valuePrefix,
      valueSuffix,
      trend,
      trendValue,
      description,
      loading = false,
      ...props
    },
    ref
  ) => {
    const TrendIcon = {
      up: TrendingUp,
      down: TrendingDown,
      neutral: Minus,
    }[trend || 'neutral'];

    const trendColor = {
      up: 'text-green-500',
      down: 'text-red-500',
      neutral: 'text-muted-foreground',
    }[trend || 'neutral'];

    if (loading) {
      return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          {description && <div className="h-3 w-24 animate-pulse rounded bg-muted" />}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('space-y-1', className)} {...props}>
        {title && (
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        )}
        <div className="flex items-baseline gap-2">
          <div className="flex items-baseline gap-1">
            {valuePrefix && <span className="text-2xl text-muted-foreground">{valuePrefix}</span>}
            <span className="text-3xl font-bold tracking-tight">{value}</span>
            {valueSuffix && <span className="text-lg text-muted-foreground">{valueSuffix}</span>}
          </div>
          {trend && trendValue && (
            <div className={cn('flex items-center gap-0.5 text-sm', trendColor)}>
              <TrendIcon className="h-4 w-4" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    );
  }
);
Statistic.displayName = 'Statistic';

// 统计卡片组件
interface StatisticCardProps extends StatisticProps {
  icon?: React.ReactNode;
}

const StatisticCard = React.forwardRef<HTMLDivElement, StatisticCardProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border bg-card p-6 shadow-sm',
          className
        )}
      >
        <div className="flex items-start justify-between">
          <Statistic {...props} />
          {icon && (
            <div className="rounded-full bg-muted p-2.5">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);
StatisticCard.displayName = 'StatisticCard';

export { Statistic, StatisticCard };
