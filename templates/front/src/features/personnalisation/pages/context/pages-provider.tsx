import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'

type PageDialogType = 'edit' | 'delete'

interface PageContextType {
  open: PageDialogType | null
  setOpen: (str: PageDialogType | null) => void
  currentRow: any | null
  setCurrentRow: React.Dispatch<React.SetStateAction<any | null>>
}

const PageContext = React.createContext<PageContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function PagesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<PageDialogType>(null)
  const [currentRow, setCurrentRow] = useState<any | null>(null)

  return (
    <PageContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PageContext.Provider>
  )
}

export const usePage = () => {
  const announcesContext = React.useContext(PageContext)

  if (!announcesContext) {
    throw new Error('usePage has to be used within <PageContext>')
  }

  return announcesContext
}
