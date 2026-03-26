'use client'

import { useScene } from '@pascal-app/core'
import { ChevronDown, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PROVINCIAS_OPTIONS } from '../../../../../data/provincias'
import useNormativa from '../../../../../store/use-normativa'

// ─── FOS/FOT calculation helpers ─────────────────────────────────────────────

function polygonArea(pts: [number, number][]): number {
  if (pts.length < 3) return 0
  let a = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, z1] = pts[i]!
    const [x2, z2] = pts[(i + 1) % pts.length]!
    a += x1 * z2 - x2 * z1
  }
  return Math.abs(a) / 2
}

export function useFosFot() {
  const nodes = useScene((s) => s.nodes)
  const rootNodeIds = useScene((s) => s.rootNodeIds)

  return useMemo(() => {
    const siteId = rootNodeIds.find((id) => (nodes[id] as any)?.type === 'site')
    const siteNode = siteId ? (nodes[siteId] as any) : null
    const siteArea = siteNode?.polygon?.points
      ? polygonArea(siteNode.polygon.points as [number, number][])
      : 0

    if (siteArea === 0) return { fos: 0, fot: 0, siteArea: 0 }

    let groundSlabArea = 0
    let totalSlabArea = 0

    for (const node of Object.values(nodes) as any[]) {
      if (node.type !== 'slab') continue
      const slabArea = polygonArea((node.polygon ?? []) as [number, number][])

      // Find parent level to get level number
      const level = nodes[node.parentId] as any
      const levelNum = level?.level ?? 0
      if (levelNum === 0) groundSlabArea += slabArea
      totalSlabArea += slabArea
    }

    return {
      fos: siteArea > 0 ? groundSlabArea / siteArea : 0,
      fot: siteArea > 0 ? totalSlabArea / siteArea : 0,
      siteArea,
    }
  }, [nodes, rootNodeIds])
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.round(value * 100)
  const maxPct = Math.round(max * 100)
  const ratio = value / max
  const color =
    ratio > 1 ? 'text-red-400 bg-red-500/15' : ratio > 0.85 ? 'text-amber-400 bg-amber-500/15' : 'text-green-400 bg-green-500/15'

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`rounded px-1.5 py-0.5 font-mono font-semibold text-[11px] ${color}`}>
          {pct}% / {maxPct}%
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-accent/60">
        <div
          className={`h-full rounded-full transition-all ${ratio > 1 ? 'bg-red-500' : ratio > 0.85 ? 'bg-amber-500' : 'bg-green-500'}`}
          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
        />
      </div>
    </div>
  )
}

// ─── Retiro row ───────────────────────────────────────────────────────────────

function RetiroRow({
  label,
  field,
  value,
}: {
  label: string
  field: 'retiro_frente' | 'retiro_lateral' | 'retiro_fondo' | 'fos_max' | 'fot_max'
  value: number
}) {
  const setCustomValue = useNormativa((s) => s.setCustomValue)
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <div className="flex items-center gap-1">
        <input
          className="w-14 rounded border border-border/50 bg-accent/50 px-1.5 py-0.5 text-right text-foreground text-xs focus:border-orange-500/60 focus:outline-none"
          max={20}
          min={0}
          onChange={(e) => setCustomValue(field, parseFloat(e.target.value) || 0)}
          step={0.5}
          type="number"
          value={value}
        />
        <span className="text-muted-foreground text-xs">
          {field.startsWith('fos') || field.startsWith('fot') ? '' : 'm'}
        </span>
      </div>
    </div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function NormativaSection() {
  const [expanded, setExpanded] = useState(false)
  const {
    provincia,
    retiro_frente,
    retiro_lateral,
    retiro_fondo,
    fos_max,
    fot_max,
    show_overlay,
    nota,
    setProvincia,
    toggleOverlay,
  } = useNormativa()
  const { fos, fot } = useFosFot()

  const fosViolation = fos > fos_max
  const fotViolation = fot > fot_max
  const hasViolation = fosViolation || fotViolation

  return (
    <div className="border-border/50 border-b">
      {/* Header */}
      <div
        className="relative flex w-full cursor-pointer items-center justify-between py-2 pr-3 pl-10 text-left"
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded(!expanded)
          }
        }}
        role="button"
        tabIndex={0}
      >
        {/* Tree decorations */}
        <div className="absolute top-0 bottom-0 left-[21px] w-px bg-border/50" />
        <div className="absolute top-1/2 left-[21px] h-px w-4 bg-border/50" />

        <div className="flex items-center gap-2">
          <ShieldCheck
            className={`h-4 w-4 ${hasViolation ? 'text-red-400' : provincia ? 'text-green-400' : 'text-muted-foreground'}`}
          />
          <span className="font-medium text-sm">Normativa</span>
          {provincia && !hasViolation && (
            <span className="rounded bg-green-500/15 px-1.5 py-0.5 font-medium text-[10px] text-green-400">
              OK
            </span>
          )}
          {hasViolation && (
            <span className="rounded bg-red-500/15 px-1.5 py-0.5 font-medium text-[10px] text-red-400">
              Violación
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation()
              toggleOverlay()
            }}
            title={show_overlay ? 'Ocultar retiros' : 'Mostrar retiros'}
            type="button"
          >
            {show_overlay ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          <ChevronDown
            className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? 'rotate-0' : '-rotate-90'}`}
          />
        </div>
      </div>

      {/* Collapsed summary */}
      {!expanded && provincia && (
        <div className="flex gap-3 pb-2 pl-10 pr-3">
          <span className="text-muted-foreground text-xs">
            FOS{' '}
            <span className={fosViolation ? 'font-semibold text-red-400' : 'text-foreground'}>
              {Math.round(fos * 100)}%
            </span>
            /{Math.round(fos_max * 100)}%
          </span>
          <span className="text-muted-foreground text-xs">
            FOT{' '}
            <span className={fotViolation ? 'font-semibold text-red-400' : 'text-foreground'}>
              {Math.round(fot * 100)}%
            </span>
            /{Math.round(fot_max * 100)}%
          </span>
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="flex flex-col gap-3 pb-3 pl-10 pr-3">
          {/* Province selector */}
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-xs">Provincia / jurisdicción</label>
            <select
              className="w-full rounded border border-border/50 bg-accent/50 px-2 py-1 text-foreground text-xs focus:border-orange-500/60 focus:outline-none"
              onChange={(e) => setProvincia(e.target.value || null)}
              value={provincia ?? ''}
            >
              <option value="">— Personalizado —</option>
              {PROVINCIAS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            {nota && <p className="text-muted-foreground text-[10px] leading-relaxed">{nota}</p>}
            <p className="text-muted-foreground/60 text-[9px] italic leading-relaxed">
              Valores orientativos. Las regulaciones varían por municipio. Consultá con un arquitecto matriculado.
            </p>
          </div>

          {/* Retiro inputs */}
          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-muted-foreground text-[10px] uppercase tracking-wide">
              Retiros mínimos
            </label>
            <RetiroRow field="retiro_frente" label="Frente (calle)" value={retiro_frente} />
            <RetiroRow field="retiro_lateral" label="Lateral (medianera)" value={retiro_lateral} />
            <RetiroRow field="retiro_fondo" label="Fondo" value={retiro_fondo} />
          </div>

          {/* FOS/FOT limits */}
          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-muted-foreground text-[10px] uppercase tracking-wide">
              Ocupación máxima
            </label>
            <RetiroRow field="fos_max" label="FOS máx. (cobertura PB)" value={fos_max} />
            <RetiroRow field="fot_max" label="FOT máx. (total plantas)" value={fot_max} />
          </div>

          {/* Live FOS/FOT */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-muted-foreground text-[10px] uppercase tracking-wide">
              Ocupación actual
            </label>
            <StatusBadge label="FOS — cobertura planta baja" max={fos_max} value={fos} />
            <StatusBadge label="FOT — total superficies" max={fot_max} value={fot} />
          </div>
        </div>
      )}
    </div>
  )
}
