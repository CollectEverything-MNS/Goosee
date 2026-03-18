import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';

type UserDialogType = 'create' | 'edit' | 'delete'

interface UserContextType {
  open: UserDialogType | null
  setOpen: (str: UserDialogType | null) => void
  currentRow: any | null
  setCurrentRow: React.Dispatch<React.SetStateAction<any | null>>
}

const UserContext = React.createContext<UserContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function UsersProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<UserDialogType>(null)
  const [currentRow, setCurrentRow] = useState<any | null>(null)

  return (
    <UserContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const announcesContext = React.useContext(UserContext)

  if (!announcesContext) {
    throw new Error('useUser has to be used within <UserContext>')
  }

  return announcesContext
}
