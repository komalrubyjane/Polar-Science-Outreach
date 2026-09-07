import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-primary dark:bg-primary/20',
        accent: 'border-transparent bg-accent/10 text-accent dark:bg-accent/20',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground',
        success:
          'border-transparent bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
        warning:
          'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300',
        danger: 'border-transparent bg-destructive/12 text-destructive',
        demo: 'border-dashed border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
