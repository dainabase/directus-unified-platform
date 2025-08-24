import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode;
  children: React.ReactNode;
}

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
  isCurrentPage?: boolean;
  children: React.ReactNode;
}

export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn('text-sm text-muted-foreground hover:text-foreground transition-colors', className)}
        {...props}
      >
        {children}
      </a>
    );
  }
);
BreadcrumbLink.displayName = 'BreadcrumbLink';

export const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, isCurrentPage, children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn('inline-flex items-center gap-1.5', className)}
        aria-current={isCurrentPage ? 'page' : undefined}
        {...props}
      >
        {children}
      </li>
    );
  }
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

export const BreadcrumbSeparator: React.FC<{ children?: React.ReactNode }> = ({ 
  children = '/' 
}) => {
  return (
    <span role="presentation" className="text-muted-foreground">
      {children}
    </span>
  );
};

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator = '/', children, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn('relative', className)}
        {...props}
      >
        <ol className="flex items-center gap-1.5 text-sm">
          {React.Children.map(children, (child, index) => {
            if (index > 0 && separator) {
              return (
                <>
                  <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
                  {child}
                </>
              );
            }
            return child;
          })}
        </ol>
      </nav>
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

// Additional sub-components for showcase compatibility
export const BreadcrumbList = React.forwardRef<HTMLOListElement, React.HTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => {
    return <ol ref={ref} className={cn('flex items-center gap-1.5 text-sm', className)} {...props} />;
  }
);
BreadcrumbList.displayName = 'BreadcrumbList';

export const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    return <span ref={ref} className={cn('text-slate-600 font-medium', className)} {...props} />;
  }
);
BreadcrumbPage.displayName = 'BreadcrumbPage';

export const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children = '...', ...props }, ref) => {
    return <span ref={ref} className={cn('text-slate-500', className)} {...props}>{children}</span>;
  }
);
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

export default Breadcrumb;
