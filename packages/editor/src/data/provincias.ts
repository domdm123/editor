export interface ProvinciaRegulacion {
  nombre: string
  retiro_frente: number
  retiro_lateral: number
  retiro_fondo: number
  fos_max: number
  fot_max: number
  nota?: string
}

export const PROVINCIAS: Record<string, ProvinciaRegulacion> = {
  CABA: {
    nombre: 'Ciudad Autónoma de Buenos Aires',
    retiro_frente: 3,
    retiro_lateral: 0,
    retiro_fondo: 3,
    fos_max: 0.6,
    fot_max: 2.0,
    nota: 'Varía por zona. Consultar CPUAM.',
  },
  GBA: {
    nombre: 'Buenos Aires — GBA',
    retiro_frente: 3,
    retiro_lateral: 2.5,
    retiro_fondo: 3,
    fos_max: 0.6,
    fot_max: 1.2,
    nota: 'Decreto-Ley 8912/77. Verificar ordenanza municipal.',
  },
  BA_INTERIOR: {
    nombre: 'Buenos Aires — Interior',
    retiro_frente: 4,
    retiro_lateral: 3,
    retiro_fondo: 4,
    fos_max: 0.6,
    fot_max: 1.2,
    nota: 'Decreto-Ley 8912/77. Verificar ordenanza municipal.',
  },
  CORDOBA: {
    nombre: 'Córdoba',
    retiro_frente: 3,
    retiro_lateral: 3,
    retiro_fondo: 3,
    fos_max: 0.6,
    fot_max: 1.5,
    nota: 'Ordenanza 9387. Varía por zona.',
  },
  SANTA_FE: {
    nombre: 'Santa Fe',
    retiro_frente: 3,
    retiro_lateral: 3,
    retiro_fondo: 4,
    fos_max: 0.55,
    fot_max: 1.2,
    nota: 'Verificar código urbano municipal.',
  },
  MENDOZA: {
    nombre: 'Mendoza',
    retiro_frente: 4,
    retiro_lateral: 3,
    retiro_fondo: 4,
    fos_max: 0.5,
    fot_max: 1.0,
    nota: 'Normas antisísmicas INPRES-CIRSOC. Retiro mínimo de 4 m.',
  },
  TUCUMAN: {
    nombre: 'Tucumán',
    retiro_frente: 3,
    retiro_lateral: 2.5,
    retiro_fondo: 3,
    fos_max: 0.55,
    fot_max: 1.2,
  },
  ENTRE_RIOS: {
    nombre: 'Entre Ríos',
    retiro_frente: 4,
    retiro_lateral: 3,
    retiro_fondo: 3,
    fos_max: 0.6,
    fot_max: 1.2,
  },
  NEUQUEN: {
    nombre: 'Neuquén',
    retiro_frente: 4,
    retiro_lateral: 3,
    retiro_fondo: 4,
    fos_max: 0.5,
    fot_max: 1.0,
    nota: 'Reglamento General de Construcciones.',
  },
  SALTA: {
    nombre: 'Salta',
    retiro_frente: 3,
    retiro_lateral: 2.5,
    retiro_fondo: 3,
    fos_max: 0.55,
    fot_max: 1.2,
  },
}

export const PROVINCIAS_OPTIONS = Object.entries(PROVINCIAS).map(([id, p]) => ({
  id,
  label: p.nombre,
}))
