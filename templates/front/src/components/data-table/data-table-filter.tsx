import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CirclePlus } from 'lucide-react'

interface Props {
  title: string
  options: { label: string; value: string }[]
  column: string
  table: any
}

export function DataTableFilter({ title, options, column, table }: Props) {
  const [selected, setSelected] = useState<{
    label: string
    value: string
  } | null>(null)
  const [count, setCount] = useState<number>(table.getRowModel().rows.length)

  useEffect(() => {
    const filteredCount = table.getFilteredRowModel().rows.length
    setCount(filteredCount)
  }, [table.getState().columnFilters, table])

  useEffect(() => {
    const filterValue = table.getColumn(column)?.getFilterValue()
    if (!filterValue) {
      setSelected(null)
    }
  }, [table.getState().columnFilters, column, table])

  const handleFilter = (value: string | null, label?: string) => {
    table.getColumn(column)?.setFilterValue(value)
    setSelected(value ? { label: label!, value } : null)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 px-2 lg:px-3">
          {selected ? (
            <>{selected.label}</>
          ) : (
            <div className={'flex items-center gap-x-2'}>
              <CirclePlus /> {title}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => handleFilter(opt.value, opt.label)}
            className={'flex items-center justify-between'}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
