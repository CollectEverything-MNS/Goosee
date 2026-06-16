import Link from 'next/link';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface TBreadcrumbItem {
  label: string;
  href?: string;
}

interface GenericBreadcrumbProps {
  items: TBreadcrumbItem[];
}

export function AdminBreadcrumbGeneric({ items }: GenericBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <BreadcrumbItem key={index}>
              {!isLast ? (
                <>
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href || '#'}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator className="text-muted-foreground/60" />
                </>
              ) : (
                <BreadcrumbPage className="font-medium text-foreground">
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
