export function LoaderError({message}: {message: string}) {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center">
      <p className="text-destructive">Erreur lors du chargement</p>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}