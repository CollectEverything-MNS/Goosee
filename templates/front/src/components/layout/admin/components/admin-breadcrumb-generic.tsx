import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import Link from 'next/link'

export interface TBreadcrumbItem {
  label: string
  href?: string
}

interface GenericBreadcrumbProps {
  items: TBreadcrumbItem[]
}

export function AdminBreadcrumbGeneric({ items }: GenericBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <BreadcrumbItem key={index}>
              {!isLast ? (
                <>
                  <BreadcrumbLink asChild>
                    <Link href={item.href || '#'} className={'!text-white hover:underline'}>
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator className={'!text-white'} />
                </>
              ) : (
                <BreadcrumbPage className={'font-semibold text-white'}>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
