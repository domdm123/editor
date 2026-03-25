'use client'

import { LayoutTemplate } from 'lucide-react'
import { useState } from 'react'
import { TEMPLATES, type Template, type TemplateWall } from '../../data/templates'
import { applySceneGraphToEditor } from '../../lib/scene'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './primitives/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from './primitives/tooltip'

// ─── Floor plan SVG preview ──────────────────────────────────────────────────

function FloorPlanPreview({ walls }: { walls: TemplateWall[] }) {
  const PAD = 6
  const SIZE = 96

  const allX = walls.flatMap((w) => [w.start[0], w.end[0]])
  const allZ = walls.flatMap((w) => [w.start[1], w.end[1]])
  const minX = Math.min(...allX)
  const maxX = Math.max(...allX)
  const minZ = Math.min(...allZ)
  const maxZ = Math.max(...allZ)

  const spanX = maxX - minX || 1
  const spanZ = maxZ - minZ || 1
  const scale = Math.min((SIZE - 2 * PAD) / spanX, (SIZE - 2 * PAD) / spanZ)
  const offX = PAD + ((SIZE - 2 * PAD) - spanX * scale) / 2
  const offZ = PAD + ((SIZE - 2 * PAD) - spanZ * scale) / 2

  const px = (x: number) => offX + (x - minX) * scale
  const pz = (z: number) => offZ + (z - minZ) * scale

  return (
    <svg
      className="rounded-md bg-accent/30"
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
    >
      {walls.map((w, i) => (
        <line
          key={i}
          stroke={w.exterior ? '#f97316' : '#6b7280'}
          strokeLinecap="round"
          strokeWidth={w.exterior ? 2.5 : 1.2}
          x1={px(w.start[0])}
          x2={px(w.end[0])}
          y1={pz(w.start[1])}
          y2={pz(w.end[1])}
        />
      ))}
    </svg>
  )
}

// ─── Template card ───────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onLoad,
}: {
  template: Template
  onLoad: () => void
}) {
  const [floor, setFloor] = useState(0)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-orange-500/40 hover:bg-accent/30">
      {/* Floor plan preview */}
      <div className="flex items-center justify-center gap-2">
        <FloorPlanPreview walls={template.previewWalls[floor]!} />
        {template.floors > 1 && (
          <div className="flex flex-col gap-1">
            {template.previewWalls.map((_, i) => (
              <button
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                  floor === i
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
                key={i}
                onClick={() => setFloor(i)}
                type="button"
              >
                {i === 0 ? 'PB' : 'PA'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <div className="flex items-baseline justify-between">
          <h3 className="font-semibold text-sm">{template.name}</h3>
          <span className="font-medium text-muted-foreground text-xs">{template.area} m²</span>
        </div>
        <p className="mb-1 text-muted-foreground text-xs">{template.subtitle}</p>
        <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
          {template.description}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-muted-foreground text-xs">
        <span>🛏 {template.bedrooms} dorm.</span>
        <span>🚿 {template.bathrooms} baño{template.bathrooms > 1 ? 's' : ''}</span>
        <span>🏠 {template.floors} planta{template.floors > 1 ? 's' : ''}</span>
      </div>

      {/* Load button */}
      <button
        className="mt-1 w-full rounded-lg bg-orange-500/15 py-1.5 font-medium text-orange-400 text-sm transition-colors hover:bg-orange-500/25"
        onClick={onLoad}
        type="button"
      >
        Usar esta plantilla
      </button>
    </div>
  )
}

// ─── Dialog ──────────────────────────────────────────────────────────────────

export function TemplatePickerDialog() {
  const [open, setOpen] = useState(false)

  function loadTemplate(template: Template) {
    applySceneGraphToEditor(template.scene as any)
    setOpen(false)
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button
              className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
              type="button"
            >
              <LayoutTemplate className="h-4 w-4" />
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">Plantillas de vivienda</TooltipContent>
      </Tooltip>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-orange-400" />
            Plantillas de vivienda argentina
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            Las 5 tipologías más populares. Seleccioná una para cargar el plano base y personalizar
            desde ahí.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3 lg:grid-cols-5">
          {TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              onLoad={() => loadTemplate(template)}
              template={template}
            />
          ))}
        </div>

        <p className="mt-2 text-center text-muted-foreground text-xs">
          ⚠️ Cargar una plantilla reemplaza el proyecto actual. Guardá tu trabajo antes de
          continuar.
        </p>
      </DialogContent>
    </Dialog>
  )
}
