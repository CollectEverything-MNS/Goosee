interface Props {
  title: string
  description: string
  action: string
  onClick?: () => void
}

export function AdminModalSettingsRaw({ title, description, action, onClick, }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted" onClick={onClick}>
        {action}
      </button>
    </div>
  )
}
