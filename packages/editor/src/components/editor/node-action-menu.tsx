'use client'

import { Copy, Move, Trash2 } from 'lucide-react'
import type { MouseEventHandler, PointerEventHandler } from 'react'

type NodeActionMenuProps = {
  onDelete: MouseEventHandler<HTMLButtonElement>
  onDuplicate: MouseEventHandler<HTMLButtonElement>
  onMove: MouseEventHandler<HTMLButtonElement>
  onPointerDown?: PointerEventHandler<HTMLDivElement>
  onPointerUp?: PointerEventHandler<HTMLDivElement>
  onPointerEnter?: PointerEventHandler<HTMLDivElement>
  onPointerLeave?: PointerEventHandler<HTMLDivElement>
}

export function NodeActionMenu({
  onDelete,
  onDuplicate,
  onMove,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
}: NodeActionMenuProps) {
  return (
    <div
      className="pointer-events-auto flex items-center gap-1 rounded-lg border border-border bg-background/95 p-1 shadow-xl backdrop-blur-md"
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerUp={onPointerUp}
    >
      <button
        aria-label="Mover"
        className="tooltip-trigger rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        onClick={onMove}
        title="Mover"
        type="button"
      >
        <Move className="h-4 w-4" />
      </button>
      <button
        aria-label="Duplicar"
        className="tooltip-trigger rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        onClick={onDuplicate}
        title="Duplicar"
        type="button"
      >
        <Copy className="h-4 w-4" />
      </button>
      <button
        aria-label="Eliminar"
        className="tooltip-trigger rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        onClick={onDelete}
        title="Eliminar"
        type="button"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
