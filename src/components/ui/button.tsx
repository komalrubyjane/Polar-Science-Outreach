import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group/btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 ease-editorial focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg:last-child]:translate-x-1',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-border bg-transparent hover:border-foreground/40 hover:bg-secondary/60',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
        ghost: 'hover:bg-secondary hover:text-secondary-foreground',
        link: 'text-accent underline-offset-4 hover:underline [&_svg:last-child]:hover:translate-x-1',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 px-3.5 text-[0.8rem]',
        lg: 'h-12 px-7 text-[0.95rem] tracking-[0.02em]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
