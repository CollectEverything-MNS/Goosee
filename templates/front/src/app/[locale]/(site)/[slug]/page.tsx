'use client'

import { notFound, useParams } from 'next/navigation'
import { useGetPageBySlug } from '@/features/personnalisation/pages/usecases/get-page-by-slug/use-get-page-by-slug'
import { PageRenderer } from '@/components/page-blocks/block-renderer'
import { PageStatus } from '@/features/personnalisation/pages/types/page.types'
import { Loader2 } from 'lucide-react'

export default function PublicPage() {
  const params = useParams()
  const slug = params.slug as string

  const { data: page, isLoading, error } = useGetPageBySlug(slug)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !page) {
    notFound()
  }

  if (page.status !== PageStatus.PUBLISHED) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <PageRenderer components={page.components} context={{ mode: 'front' }} />
    </main>
  )
}
