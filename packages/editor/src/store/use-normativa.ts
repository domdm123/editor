'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PROVINCIAS, type ProvinciaRegulacion } from '../data/provincias'

export interface NormativaState extends ProvinciaRegulacion {
  provincia: string | null
  show_overlay: boolean
  setProvincia: (id: string | null) => void
  setCustomValue: (key: keyof ProvinciaRegulacion, value: number) => void
  toggleOverlay: () => void
}

const DEFAULTS: ProvinciaRegulacion = {
  nombre: 'Personalizado',
  retiro_frente: 3,
  retiro_lateral: 2.5,
  retiro_fondo: 3,
  fos_max: 0.6,
  fot_max: 1.2,
}

const useNormativa = create<NormativaState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      provincia: null,
      show_overlay: true,

      setProvincia: (id) => {
        if (!id) {
          set({ provincia: null, ...DEFAULTS })
          return
        }
        const reg = PROVINCIAS[id]
        if (reg) set({ provincia: id, ...reg })
      },

      setCustomValue: (key, value) => {
        set({ provincia: null, [key]: value })
      },

      toggleOverlay: () => set({ show_overlay: !get().show_overlay }),
    }),
    { name: 'servidos-normativa' },
  ),
)

export default useNormativa
