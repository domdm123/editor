export type SceneGraph = { nodes: Record<string, unknown>; rootNodeIds: string[] }

export interface TemplateWall {
  start: [number, number]
  end: [number, number]
  exterior: boolean
}

export interface Template {
  id: string
  name: string
  subtitle: string
  description: string
  area: number
  floors: number
  bedrooms: number
  bathrooms: number
  previewWalls: TemplateWall[][]
  scene: SceneGraph
}

// ─── helpers ────────────────────────────────────────────────────────────────

function n_wall(
  id: string,
  parentId: string,
  start: [number, number],
  end: [number, number],
  exterior = false,
) {
  return {
    object: 'node',
    id,
    type: 'wall',
    parentId,
    visible: true,
    metadata: {},
    children: [],
    start,
    end,
    frontSide: exterior ? 'exterior' : 'unknown',
    backSide: exterior ? 'interior' : 'unknown',
  }
}

function n_slab(id: string, parentId: string, polygon: [number, number][]) {
  return {
    object: 'node',
    id,
    type: 'slab',
    parentId,
    visible: true,
    metadata: {},
    polygon,
    holes: [],
    elevation: 0.05,
  }
}

function n_level(
  id: string,
  parentId: string,
  levelNum: number,
  name: string,
  children: string[],
) {
  return {
    object: 'node',
    id,
    type: 'level',
    parentId,
    visible: true,
    metadata: {},
    name,
    level: levelNum,
    children,
  }
}

function n_building(id: string, parentId: string, children: string[]) {
  return {
    object: 'node',
    id,
    type: 'building',
    parentId,
    visible: true,
    metadata: {},
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    children,
  }
}

function n_site(id: string, polygon: [number, number][], children: string[]) {
  return {
    object: 'node',
    id,
    type: 'site',
    parentId: null,
    visible: true,
    metadata: {},
    polygon: { type: 'polygon', points: polygon },
    children,
  }
}

function makeScene(nodeList: object[]): SceneGraph {
  const nodes: Record<string, unknown> = {}
  for (const n of nodeList) nodes[(n as any).id] = n
  return { nodes, rootNodeIds: [(nodeList[0] as any).id] }
}

// ─── Template 1 · Casa Mínima FONAVI (~50 m²) ────────────────────────────────
// 6 m × 8.5 m · 1 PB · Living, 2 dorm, cocina, baño
{
}
const T1_PID = 'level_t1_0'
const t1Walls: ReturnType<typeof n_wall>[] = [
  n_wall('wall_t1_01', T1_PID, [-3, -4.25], [3, -4.25], true),
  n_wall('wall_t1_02', T1_PID, [3, -4.25], [3, 4.25], true),
  n_wall('wall_t1_03', T1_PID, [3, 4.25], [-3, 4.25], true),
  n_wall('wall_t1_04', T1_PID, [-3, 4.25], [-3, -4.25], true),
  n_wall('wall_t1_05', T1_PID, [-3, 0], [3, 0]),
  n_wall('wall_t1_06', T1_PID, [0, 0], [0, 4.25]),
  n_wall('wall_t1_07', T1_PID, [-3, 2.25], [3, 2.25]),
]
const t1Level = n_level(T1_PID, 'building_t1', 0, 'Planta Baja', [
  'slab_t1',
  ...t1Walls.map((w) => w.id),
])
const t1Slab = n_slab('slab_t1', T1_PID, [
  [-3, -4.25],
  [3, -4.25],
  [3, 4.25],
  [-3, 4.25],
])
const t1Building = n_building('building_t1', 'site_t1', [T1_PID])
const t1Site = n_site('site_t1', [[-4.5, -6], [4.5, -6], [4.5, 6], [-4.5, 6]], ['building_t1'])

// ─── Template 2 · Casa Estándar 3 Amb (~72 m²) ───────────────────────────────
// 8 m × 9 m · 1 PB · Living, cocina/comedor, 3 dorm, baño
const T2_PID = 'level_t2_0'
const t2Walls: ReturnType<typeof n_wall>[] = [
  n_wall('wall_t2_01', T2_PID, [-4, -4.5], [4, -4.5], true),
  n_wall('wall_t2_02', T2_PID, [4, -4.5], [4, 4.5], true),
  n_wall('wall_t2_03', T2_PID, [4, 4.5], [-4, 4.5], true),
  n_wall('wall_t2_04', T2_PID, [-4, 4.5], [-4, -4.5], true),
  n_wall('wall_t2_05', T2_PID, [-4, 0], [4, 0]),
  n_wall('wall_t2_06', T2_PID, [-1, -4.5], [-1, 0]),
  n_wall('wall_t2_07', T2_PID, [0, 0], [0, 4.5]),
  n_wall('wall_t2_08', T2_PID, [0, 2], [4, 2]),
  n_wall('wall_t2_09', T2_PID, [-4, 2.5], [0, 2.5]),
]
const t2Level = n_level(T2_PID, 'building_t2', 0, 'Planta Baja', [
  'slab_t2',
  ...t2Walls.map((w) => w.id),
])
const t2Slab = n_slab('slab_t2', T2_PID, [
  [-4, -4.5],
  [4, -4.5],
  [4, 4.5],
  [-4, 4.5],
])
const t2Building = n_building('building_t2', 'site_t2', [T2_PID])
const t2Site = n_site('site_t2', [[-5.5, -6], [5.5, -6], [5.5, 6], [-5.5, 6]], ['building_t2'])

// ─── Template 3 · Casa Chorizo (~80 m²) ──────────────────────────────────────
// 5 m × 16 m · 1 PB · Tipología lineal porteña
const T3_PID = 'level_t3_0'
const t3Walls: ReturnType<typeof n_wall>[] = [
  n_wall('wall_t3_01', T3_PID, [-2.5, -8], [2.5, -8], true),
  n_wall('wall_t3_02', T3_PID, [2.5, -8], [2.5, 8], true),
  n_wall('wall_t3_03', T3_PID, [2.5, 8], [-2.5, 8], true),
  n_wall('wall_t3_04', T3_PID, [-2.5, 8], [-2.5, -8], true),
  n_wall('wall_t3_05', T3_PID, [-2.5, -4], [2.5, -4]),
  n_wall('wall_t3_06', T3_PID, [-2.5, 0], [2.5, 0]),
  n_wall('wall_t3_07', T3_PID, [-2.5, 4], [2.5, 4]),
  n_wall('wall_t3_08', T3_PID, [0, 4], [0, 8]),
]
const t3Level = n_level(T3_PID, 'building_t3', 0, 'Planta Baja', [
  'slab_t3',
  ...t3Walls.map((w) => w.id),
])
const t3Slab = n_slab('slab_t3', T3_PID, [
  [-2.5, -8],
  [2.5, -8],
  [2.5, 8],
  [-2.5, 8],
])
const t3Building = n_building('building_t3', 'site_t3', [T3_PID])
const t3Site = n_site('site_t3', [[-4, -10], [4, -10], [4, 10], [-4, 10]], ['building_t3'])

// ─── Template 4 · Casa Tipo Ranch (~100 m²) ──────────────────────────────────
// 10 m × 10 m · 1 PB · Living grande, 3 dorm, 2 baños, galería
const T4_PID = 'level_t4_0'
const t4Walls: ReturnType<typeof n_wall>[] = [
  n_wall('wall_t4_01', T4_PID, [-5, -5], [5, -5], true),
  n_wall('wall_t4_02', T4_PID, [5, -5], [5, 5], true),
  n_wall('wall_t4_03', T4_PID, [5, 5], [-5, 5], true),
  n_wall('wall_t4_04', T4_PID, [-5, 5], [-5, -5], true),
  n_wall('wall_t4_05', T4_PID, [-5, -1], [5, -1]),
  n_wall('wall_t4_06', T4_PID, [-5, 2], [5, 2]),
  n_wall('wall_t4_07', T4_PID, [1, -5], [1, -1]),
  n_wall('wall_t4_08', T4_PID, [1, -1], [1, 2]),
  n_wall('wall_t4_09', T4_PID, [3, -1], [3, 2]),
  n_wall('wall_t4_10', T4_PID, [-1, 2], [-1, 5]),
  n_wall('wall_t4_11', T4_PID, [1, 2], [1, 5]),
]
const t4Level = n_level(T4_PID, 'building_t4', 0, 'Planta Baja', [
  'slab_t4',
  ...t4Walls.map((w) => w.id),
])
const t4Slab = n_slab('slab_t4', T4_PID, [
  [-5, -5],
  [5, -5],
  [5, 5],
  [-5, 5],
])
const t4Building = n_building('building_t4', 'site_t4', [T4_PID])
const t4Site = n_site('site_t4', [[-7, -7], [7, -7], [7, 7], [-7, 7]], ['building_t4'])

// ─── Template 5 · Casa Dos Plantas (~120 m²) ─────────────────────────────────
// 6 m × 10 m · PB + PA · PB: garage/living/cocina/baño | PA: 3 dorm + baño
const T5_PB = 'level_t5_0'
const T5_PA = 'level_t5_1'

const t5WallsPB: ReturnType<typeof n_wall>[] = [
  n_wall('wall_t5_01', T5_PB, [-3, -5], [3, -5], true),
  n_wall('wall_t5_02', T5_PB, [3, -5], [3, 5], true),
  n_wall('wall_t5_03', T5_PB, [3, 5], [-3, 5], true),
  n_wall('wall_t5_04', T5_PB, [-3, 5], [-3, -5], true),
  n_wall('wall_t5_05', T5_PB, [-3, -2], [3, -2]),
  n_wall('wall_t5_06', T5_PB, [1, -2], [1, 2]),
  n_wall('wall_t5_07', T5_PB, [-3, 2], [3, 2]),
  n_wall('wall_t5_08', T5_PB, [0, 2], [0, 5]),
]

const t5WallsPA: ReturnType<typeof n_wall>[] = [
  n_wall('wall_t5_09', T5_PA, [-3, -5], [3, -5], true),
  n_wall('wall_t5_10', T5_PA, [3, -5], [3, 5], true),
  n_wall('wall_t5_11', T5_PA, [3, 5], [-3, 5], true),
  n_wall('wall_t5_12', T5_PA, [-3, 5], [-3, -5], true),
  n_wall('wall_t5_13', T5_PA, [-3, -2], [3, -2]),
  n_wall('wall_t5_14', T5_PA, [0, -2], [0, 2]),
  n_wall('wall_t5_15', T5_PA, [-3, 2], [3, 2]),
  n_wall('wall_t5_16', T5_PA, [0, 2], [0, 5]),
]

const t5LevelPB = n_level(T5_PB, 'building_t5', 0, 'Planta Baja', [
  'slab_t5_pb',
  ...t5WallsPB.map((w) => w.id),
])
const t5LevelPA = n_level(T5_PA, 'building_t5', 1, 'Planta Alta', [
  'slab_t5_pa',
  ...t5WallsPA.map((w) => w.id),
])
const t5SlabPB = n_slab('slab_t5_pb', T5_PB, [
  [-3, -5],
  [3, -5],
  [3, 5],
  [-3, 5],
])
const t5SlabPA = n_slab('slab_t5_pa', T5_PA, [
  [-3, -5],
  [3, -5],
  [3, 5],
  [-3, 5],
])
const t5Building = n_building('building_t5', 'site_t5', [T5_PB, T5_PA])
const t5Site = n_site('site_t5', [[-5, -7], [5, -7], [5, 7], [-5, 7]], ['building_t5'])

// ─── Export ──────────────────────────────────────────────────────────────────

function toWalls(walls: ReturnType<typeof n_wall>[]): TemplateWall[] {
  return walls.map((w) => ({
    start: w.start as [number, number],
    end: w.end as [number, number],
    exterior: w.frontSide === 'exterior',
  }))
}

export const TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Casa Mínima',
    subtitle: '~50 m² · 1 planta',
    description: 'Living/comedor amplio + 2 dormitorios + cocina + baño. Tipología FONAVI, ideal para lotes angostos.',
    area: 51,
    floors: 1,
    bedrooms: 2,
    bathrooms: 1,
    previewWalls: [toWalls(t1Walls)],
    scene: makeScene([t1Site, t1Building, t1Level, t1Slab, ...t1Walls]),
  },
  {
    id: 't2',
    name: 'Casa Estándar',
    subtitle: '~72 m² · 1 planta',
    description: 'Living, cocina/comedor separada, 3 dormitorios y baño completo. La planta más común en el GBA.',
    area: 72,
    floors: 1,
    bedrooms: 3,
    bathrooms: 1,
    previewWalls: [toWalls(t2Walls)],
    scene: makeScene([t2Site, t2Building, t2Level, t2Slab, ...t2Walls]),
  },
  {
    id: 't3',
    name: 'Casa Chorizo',
    subtitle: '~80 m² · 1 planta',
    description: 'Tipología porteña clásica: habitaciones en secuencia sobre lote largo y angosto. Living, comedor, 2 dormitorios, cocina y baño.',
    area: 80,
    floors: 1,
    bedrooms: 2,
    bathrooms: 1,
    previewWalls: [toWalls(t3Walls)],
    scene: makeScene([t3Site, t3Building, t3Level, t3Slab, ...t3Walls]),
  },
  {
    id: 't4',
    name: 'Casa Tipo Ranch',
    subtitle: '~100 m² · 1 planta',
    description: 'Planta cuadrada con living grande, 3 dormitorios, 2 baños y espacio para galería. Común en Córdoba, Santa Fe e interior.',
    area: 100,
    floors: 1,
    bedrooms: 3,
    bathrooms: 2,
    previewWalls: [toWalls(t4Walls)],
    scene: makeScene([t4Site, t4Building, t4Level, t4Slab, ...t4Walls]),
  },
  {
    id: 't5',
    name: 'Casa Dos Plantas',
    subtitle: '~120 m² · 2 plantas',
    description: 'PB con garage, living, cocina y baño social. PA con 3 dormitorios y baño completo. Tendencia creciente en GBA.',
    area: 120,
    floors: 2,
    bedrooms: 3,
    bathrooms: 2,
    previewWalls: [toWalls(t5WallsPB), toWalls(t5WallsPA)],
    scene: makeScene([
      t5Site,
      t5Building,
      t5LevelPB,
      t5LevelPA,
      t5SlabPB,
      t5SlabPA,
      ...t5WallsPB,
      ...t5WallsPA,
    ]),
  },
]
