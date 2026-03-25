'use client'

import { useScene } from '@pascal-app/core'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import useNormativa from '../../store/use-normativa'

function buildLineLoop(pts: [number, number][], y: number): Float32Array {
  const verts: number[] = []
  for (let i = 0; i <= pts.length; i++) {
    const [x, z] = pts[i % pts.length]!
    verts.push(x, y, z)
  }
  return new Float32Array(verts)
}

function insetBbox(
  pts: [number, number][],
  frente: number,
  lateral: number,
  fondo: number,
): [number, number][] | null {
  if (pts.length < 3) return null
  const xs = pts.map((p) => p[0])
  const zs = pts.map((p) => p[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minZ = Math.min(...zs)
  const maxZ = Math.max(...zs)

  const x1 = minX + lateral
  const x2 = maxX - lateral
  const z1 = minZ + frente
  const z2 = maxZ - fondo

  if (x1 >= x2 || z1 >= z2) return null
  return [
    [x1, z1],
    [x2, z1],
    [x2, z2],
    [x1, z2],
  ]
}

function makeLine(pts: [number, number][], color: string, opacity: number): THREE.Line {
  const verts = buildLineLoop(pts, 0.06)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  return new THREE.Line(geo, mat)
}

export function RetiroOverlay() {
  const { show_overlay, retiro_frente, retiro_lateral, retiro_fondo } = useNormativa()
  const nodes = useScene((s) => s.nodes)
  const rootNodeIds = useScene((s) => s.rootNodeIds)
  const groupRef = useRef<THREE.Group | null>(null)

  const lines = useMemo(() => {
    if (!show_overlay) return null

    const siteId = rootNodeIds.find((id) => (nodes[id] as any)?.type === 'site')
    const siteNode = siteId ? (nodes[siteId] as any) : null
    const pts: [number, number][] = siteNode?.polygon?.points ?? []
    if (pts.length < 3) return null

    const inset = insetBbox(pts, retiro_frente, retiro_lateral, retiro_fondo)
    if (!inset) return null

    return {
      outer: makeLine(pts, '#f97316', 0.25),
      inner: makeLine(inset, '#f97316', 0.9),
    }
  }, [show_overlay, nodes, rootNodeIds, retiro_frente, retiro_lateral, retiro_fondo])

  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    // Remove old children
    while (group.children.length) group.remove(group.children[0]!)
    if (lines) {
      group.add(lines.outer)
      group.add(lines.inner)
    }
    return () => {
      lines?.outer.geometry.dispose()
      lines?.inner.geometry.dispose()
    }
  }, [lines])

  // groupRef is attached to a THREE.Group injected into the Canvas via the ref pattern
  return (
    <group
      ref={(g) => {
        groupRef.current = g as THREE.Group | null
      }}
    />
  )
}
