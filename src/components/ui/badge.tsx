import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[0.68rem] font-medium uppercase tracking-[0.12em] transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        accent: 'bg-accent/12 text-accent',
        secondary: 'bg-secondary text-muted-foreground',
        outline: 'border border-border text-muted-foreground',
        success: 'bg-success/14 text-success',
        warning: 'bg-warning/16 text-warning',
        danger: 'bg-destructive/12 text-destructive',
        demo: 'border border-dashed border-warning/50 bg-warning/[0.08] text-warning',
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
