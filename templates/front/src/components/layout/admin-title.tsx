import React from 'react'
import { cn } from '@/lib/utils'

interface Props {
  size: 'h1' | 'h2' | 'h3'
  title: string
}

export function AdminTitle({ size, title }: Props) {
  const Tag = size
  return (
    <Tag
      className={cn({
        'mb-6 text-2xl font-semibold text-primary': size === 'h1',
        'mb-4 text-xl': size === 'h2',
        'mb-2 text-lg': size === 'h3',
      })}
    >
      {title}
    </Tag>
  )
}
