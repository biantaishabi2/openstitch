'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep?: number;
  orientation?: 'horizontal' | 'vertical';
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ className, currentStep = 0, orientation = 'horizontal', children, ...props }, ref) => {
    const steps = React.Children.toArray(children);

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
          className
        )}
        {...props}
      >
        {steps.map((child, index) => {
          if (React.isValidElement<StepProps>(child)) {
            const status =
              index < currentStep ? 'completed' : index === currentStep ? 'current' : 'pending';
            return React.cloneElement(child, {
              status,
              stepNumber: index + 1,
              isLast: index === steps.length - 1,
              orientation,
            });
          }
          return child;
        })}
      </div>
    );
  }
);
Stepper.displayName = 'Stepper';

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  status?: 'completed' | 'current' | 'pending';
  stepNumber?: number;
  isLast?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

const Step = React.forwardRef<HTMLDivElement, StepProps>(
  (
    {
      className,
      title,
      description,
      icon,
      status = 'pending',
      stepNumber,
      isLast = false,
      orientation = 'horizontal',
      ...props
    },
    ref
  ) => {
    const isHorizontal = orientation === 'horizontal';

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          isHorizontal ? 'flex-1 items-center' : 'flex-row items-start',
          className
        )}
        {...props}
      >
        <div className={cn('flex', isHorizontal ? 'flex-col items-center' : 'flex-row items-start')}>
          {/* 步骤圆圈 */}
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
              {
                'border-primary bg-primary text-primary-foreground': status === 'completed',
                'border-primary bg-background text-primary': status === 'current',
                'border-muted bg-background text-muted-foreground': status === 'pending',
              }
            )}
          >
            {status === 'completed' ? (
              <Check className="h-5 w-5" />
            ) : icon ? (
              icon
            ) : (
              stepNumber
            )}
          </div>

          {/* 标题和描述 */}
          <div
            className={cn(
              'flex flex-col',
              isHorizontal ? 'mt-2 items-center text-center' : 'ml-4'
            )}
          >
            {title && (
              <span
                className={cn('text-sm font-medium', {
                  'text-foreground': status !== 'pending',
                  'text-muted-foreground': status === 'pending',
                })}
              >
                {title}
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </div>
        </div>

        {/* 连接线 */}
        {!isLast && (
          <div
            className={cn(
              'transition-colors',
              isHorizontal
                ? 'mx-4 h-0.5 flex-1 self-start mt-5'
                : 'ml-5 mt-2 w-0.5 min-h-[2rem]',
              {
                'bg-primary': status === 'completed',
                'bg-muted': status !== 'completed',
              }
            )}
          />
        )}
      </div>
    );
  }
);
Step.displayName = 'Step';

export { Stepper, Step };
