import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'

interface Props {
  table: any
}

export function DataTableSearch({ table }: Props) {
  const [value, setValue] = useState('')
  const t = useTranslations()

  useEffect(() => {
    const timeout = setTimeout(() => {
      table.setGlobalFilter(value || undefined)
    }, 200)

    return () => clearTimeout(timeout)
  }, [value, table])

  return (
    <Input
      type="text"
      placeholder={t('admin.search')}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="focus:none h-8 w-64 bg-white"
    />
  )
}
