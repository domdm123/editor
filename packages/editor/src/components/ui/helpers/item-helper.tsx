import { ShortcutToken } from '../primitives/shortcut-token'

interface ItemHelperProps {
  showEsc?: boolean
}

export function ItemHelper({ showEsc }: ItemHelperProps) {
  return (
    <div className="pointer-events-none fixed top-1/2 right-4 z-40 flex -translate-y-1/2 flex-col gap-2 rounded-lg border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 text-sm">
        <ShortcutToken value="Click izq." />
        <span className="text-muted-foreground">Colocar elemento</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <ShortcutToken value="R" />
        <span className="text-muted-foreground">Rotar en sentido antihorario</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <ShortcutToken value="T" />
        <span className="text-muted-foreground">Rotar en sentido horario</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <ShortcutToken value="Shift" />
        <span className="text-muted-foreground">Colocación libre</span>
      </div>
      {showEsc && (
        <div className="flex items-center gap-2 text-sm">
          <ShortcutToken value="Esc" />
          <span className="text-muted-foreground">Cancelar</span>
        </div>
      )}
      {!showEsc && (
        <div className="flex items-center gap-2 text-sm">
          <ShortcutToken value="Click der." />
          <span className="text-muted-foreground">Cancelar</span>
        </div>
      )}
    </div>
  )
}
