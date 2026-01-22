import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';

type ClientDialogType = 'edit' | 'delete'

interface ClientContextType {
  open: ClientDialogType | null
  setOpen: (str: ClientDialogType | null) => void
  currentRow: any | null
  setCurrentRow: React.Dispatch<React.SetStateAction<any | null>>
}

const ClientContext = React.createContext<ClientContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ClientsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ClientDialogType>(null)
  const [currentRow, setCurrentRow] = useState<any | null>(null)

  return (
    <ClientContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ClientContext.Provider>
  )
}

export const useClient = () => {
  const announcesContext = React.useContext(ClientContext)

  if (!announcesContext) {
    throw new Error('useClient has to be used within <ClientContext>')
  }

  return announcesContext
}
