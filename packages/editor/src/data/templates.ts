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

// ─── node helpers ───────────────────────────────────────────────────────────

type WallObj = ReturnType<typeof n_wall>

function n_wall(
  id: string,
  parentId: string,
  start: [number, number],
  end: [number, number],
  exterior = false,
  childIds: string[] = [],
) {
  return {
    object: 'node' as const,
    id,
    type: 'wall' as const,
    parentId,
    visible: true,
    metadata: {},
    children: childIds,
    start,
    end,
    frontSide: exterior ? ('exterior' as const) : ('unknown' as const),
    backSide: exterior ? ('interior' as const) : ('unknown' as const),
  }
}

function n_door(
  id: string,
  wallId: string,
  xPos: number,
  width = 0.9,
  height = 2.1,
  side: 'front' | 'back' = 'front',
) {
  return {
    object: 'node',
    id,
    type: 'door',
    parentId: wallId,
    wallId,
    visible: true,
    metadata: {},
    position: [xPos, 0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    side,
    width,
    height,
    frameThickness: 0.05,
    frameDepth: 0.07,
    threshold: true,
    thresholdHeight: 0.02,
    hingesSide: 'left' as const,
    swingDirection: 'inward' as const,
    segments: [
      { type: 'panel', heightRatio: 0.4, columnRatios: [1], dividerThickness: 0.03, panelDepth: 0.01, panelInset: 0.04 },
      { type: 'panel', heightRatio: 0.6, columnRatios: [1], dividerThickness: 0.03, panelDepth: 0.01, panelInset: 0.04 },
    ],
    handle: true,
    handleHeight: 1.05,
    handleSide: 'right' as const,
    contentPadding: [0.04, 0.04] as [number, number],
    doorCloser: false,
    panicBar: false,
    panicBarHeight: 1.0,
  }
}

function n_window(
  id: string,
  wallId: string,
  xPos: number,
  width = 1.5,
  height = 1.2,
  side: 'front' | 'back' = 'front',
) {
  return {
    object: 'node',
    id,
    type: 'window',
    parentId: wallId,
    wallId,
    visible: true,
    metadata: {},
    position: [xPos, 1.0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    side,
    width,
    height,
    frameThickness: 0.05,
    frameDepth: 0.07,
    columnRatios: [0.5, 0.5],
    rowRatios: [1],
    columnDividerThickness: 0.03,
    rowDividerThickness: 0.03,
    sill: true,
    sillDepth: 0.08,
    sillThickness: 0.03,
  }
}

function n_ceiling(id: string, parentId: string, polygon: [number, number][], height = 2.6) {
  return {
    object: 'node',
    id,
    type: 'ceiling',
    parentId,
    visible: true,
    metadata: {},
    children: [],
    polygon,
    holes: [],
    height,
  }
}

function n_zone(
  id: string,
  parentId: string,
  name: string,
  polygon: [number, number][],
  color: string,
) {
  return {
    object: 'node',
    id,
    type: 'zone',
    parentId,
    visible: true,
    metadata: {},
    name,
    polygon,
    color,
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

// Zone colours by room type
const C_LIVING = '#f59e0b'
const C_DORM = '#3b82f6'
const C_COCINA = '#10b981'
const C_BANO = '#8b5cf6'
const C_COMEDOR = '#ef4444'
const C_GARAGE = '#6b7280'
const C_PASILLO = '#a3a3a3'
const C_GALERIA = '#06b6d4'
const C_LAVADERO = '#78716c'
const C_PATIO = '#84cc16'

// ═══════════════════════════════════════════════════════════════════════════════
// Template 1 · Casa Chorizo (~85 m²)
// Source: Wikipedia Casa Chorizo, Col·legi Arquitectes de Catalunya, Buenos
//         Aires Connect. The canonical Argentine typology (1880-1930).
// Lot: 8.66 m × 20 m (10 varas × ~23 varas). Rooms 4×4 m in sequence along
// one medianera wall, open patio/gallery on the other side. Zaguán entry,
// sala (street-facing), 2 dormitorios, comedor, cocina + baño at rear.
// Ceiling 4.5 m main rooms, 3.2 m service rooms. No internal hallways —
// circulation via gallery running along patio.
// ═══════════════════════════════════════════════════════════════════════════════
const L1 = 'level_t1_0'

// Building footprint: rooms on left (x: -4.33 to 0), gallery+patio on right (x: 0 to 4.33)
// Y axis: street at y = -10, fondo at y = 10
// Rooms (each ~4m deep): Zaguán/Sala y=-10..-6, Dorm1 y=-6..-2, Dorm2 y=-2..2, Comedor y=2..6, Cocina+Baño y=6..9

// Wall lengths for reference:
// wall_t1_01: [-4.33,-10] to [4.33,-10] = 8.66m horizontal (street facade)
// wall_t1_02: [4.33,-10] to [4.33,9] = 19m vertical (right medianera)
// wall_t1_03: [4.33,9] to [-4.33,9] = 8.66m horizontal (rear wall)
// wall_t1_05: [0,-10] to [0,9] = 19m vertical (gallery divider)
// wall_t1_06 to 09: [-4.33,y] to [0,y] = 4.33m horizontal (room dividers)
// wall_t1_10: [0,6] to [4.33,6] = 4.33m horizontal
// wall_t1_14: [-1.5,6] to [-1.5,9] = 3m vertical

// Doors — xPos is distance from wall.start along wall direction
const t1_door_entry  = n_door('door_t1_01', 'wall_t1_01', 2.0, 1.2, 2.8, 'front')   // street door at ~2m from left edge (wall len 8.66m)
const t1_door_dorm1  = n_door('door_t1_02', 'wall_t1_05', 5.0, 0.9, 2.6, 'front')   // gallery wall: dorm1 door at y=-5 (5m from start at y=-10)
const t1_door_dorm2  = n_door('door_t1_03', 'wall_t1_05', 9.0, 0.9, 2.6, 'front')   // gallery wall: dorm2 door at y=-1 (9m from start)
const t1_door_comedor = n_door('door_t1_04', 'wall_t1_05', 13.0, 0.9, 2.6, 'front') // gallery wall: comedor door at y=3 (13m from start)
const t1_door_cocina = n_door('door_t1_05', 'wall_t1_10', 1.0, 0.8, 2.4, 'front')   // service area wall (4.33m), door at 1m
const t1_door_bano   = n_door('door_t1_06', 'wall_t1_14', 1.5, 0.7, 2.4, 'front')   // baño divider (3m), door at 1.5m

// Windows — xPos is distance from wall.start
const t1_win_sala1   = n_window('window_t1_01', 'wall_t1_01', 1.0, 1.0, 2.0, 'front')  // street window left (at 1m from left)
const t1_win_sala2   = n_window('window_t1_02', 'wall_t1_01', 6.5, 1.0, 2.0, 'front')  // street window right (at 6.5m from left)
const t1_win_cocina  = n_window('window_t1_03', 'wall_t1_03', 6.0, 0.8, 0.8, 'front')  // rear wall (8.66m), kitchen window at 6m

// Exterior walls (full lot perimeter)
// Interior walls divide rooms + gallery partition
const t1Walls: WallObj[] = [
  // Perimeter (8.66m wide × 19m deep building footprint)
  n_wall('wall_t1_01', L1, [-4.33, -10], [4.33, -10], true, ['door_t1_01', 'window_t1_01', 'window_t1_02']),   // street facade
  n_wall('wall_t1_02', L1, [4.33, -10], [4.33, 9], true),                                                       // right medianera
  n_wall('wall_t1_03', L1, [4.33, 9], [-4.33, 9], true, ['window_t1_03']),                                      // rear wall
  n_wall('wall_t1_04', L1, [-4.33, 9], [-4.33, -10], true),                                                     // left medianera
  // Gallery/patio divider — wall between rooms (x=-4.33..0) and gallery/patio (x=0..4.33)
  n_wall('wall_t1_05', L1, [0, -10], [0, 9], false, ['door_t1_02', 'door_t1_03', 'door_t1_04']),
  // Room dividers (horizontal, left half only) — no doors on these, doors are on gallery wall
  n_wall('wall_t1_06', L1, [-4.33, -6], [0, -6], false),     // sala / dorm1
  n_wall('wall_t1_07', L1, [-4.33, -2], [0, -2], false),     // dorm1 / dorm2
  n_wall('wall_t1_08', L1, [-4.33, 2], [0, 2], false),       // dorm2 / comedor
  n_wall('wall_t1_09', L1, [-4.33, 6], [0, 6], false),       // comedor / service
  n_wall('wall_t1_10', L1, [0, 6], [4.33, 6], false, ['door_t1_05']),  // gallery / service area
  // Service area split: cocina (left) + baño (right)
  n_wall('wall_t1_14', L1, [-1.5, 6], [-1.5, 9], false, ['door_t1_06']),  // cocina/baño divider
]

const t1Zones = [
  n_zone('zone_t1_01', L1, 'Zaguán / Sala', [[-4.33, -10], [0, -10], [0, -6], [-4.33, -6]], C_LIVING),
  n_zone('zone_t1_02', L1, 'Dormitorio 1', [[-4.33, -6], [0, -6], [0, -2], [-4.33, -2]], C_DORM),
  n_zone('zone_t1_03', L1, 'Dormitorio 2', [[-4.33, -2], [0, -2], [0, 2], [-4.33, 2]], C_DORM),
  n_zone('zone_t1_04', L1, 'Comedor', [[-4.33, 2], [0, 2], [0, 6], [-4.33, 6]], C_COMEDOR),
  n_zone('zone_t1_05', L1, 'Galería / Patio', [[0, -10], [4.33, -10], [4.33, 6], [0, 6]], C_PATIO),
  n_zone('zone_t1_06', L1, 'Cocina', [[-4.33, 6], [-1.5, 6], [-1.5, 9], [-4.33, 9]], C_COCINA),
  n_zone('zone_t1_07', L1, 'Baño', [[-1.5, 6], [4.33, 6], [4.33, 9], [-1.5, 9]], C_BANO),
]

const t1Ceiling = n_ceiling('ceiling_t1', L1, [[-4.33, -10], [4.33, -10], [4.33, 9], [-4.33, 9]], 4.5)
const t1Slab = n_slab('slab_t1', L1, [[-4.33, -10], [4.33, -10], [4.33, 9], [-4.33, 9]])
const t1AllNodes = [t1_door_entry, t1_door_dorm1, t1_door_dorm2, t1_door_comedor, t1_door_cocina, t1_door_bano, t1_win_sala1, t1_win_sala2, t1_win_cocina]

const t1Level = n_level(L1, 'building_t1', 0, 'Planta Baja', [
  'slab_t1', 'ceiling_t1',
  ...t1Walls.map((w) => w.id),
  ...t1Zones.map((z) => z.id),
])
const t1Building = n_building('building_t1', 'site_t1', [L1])
const t1Site = n_site('site_t1', [[-4.33, -10], [4.33, -10], [4.33, 10], [-4.33, 10]], ['building_t1'])

// ═══════════════════════════════════════════════════════════════════════════════
// Template 2 · Casa Cajón (~60 m²)
// Source: FAUD Library / Buenos Aires Connect. Post-1930s compact suburban type
//         that replaced the casa chorizo nationwide.
// Lot: 8.66 m × 20 m. Building: 8.66 m × 7.5 m compact rectangle at front.
// 4 quadrants, no pasillo/gallery. Living-comedor (front), 2 dormitorios +
// cocina + baño (rear). Lavadero/patio at back. Ceiling 2.7 m.
// ═══════════════════════════════════════════════════════════════════════════════
const L2 = 'level_t2_0'

// Y axis: street at y=-3.75, rear at y=3.75. Front half = living-comedor, rear half = dorms+service
// Wall lengths: t2_01=8.66m, t2_02=7.5m, t2_03=8.66m, t2_04=7.5m, t2_05=8.66m, t2_07=4.33m, t2_08=2m
// wall_t2_05 goes x=-4.33 to x=4.33: Dorm1 is x=-4.33..0 (0-4.33m), Dorm2 is x=0..2.5 (4.33-6.83m)
const t2_door_entry   = n_door('door_t2_01', 'wall_t2_01', 4.33, 0.9, 2.1, 'front')  // center of 8.66m wall
const t2_door_dorm1   = n_door('door_t2_02', 'wall_t2_05', 2.0, 0.8, 2.1, 'front')   // into Dorm1 (x=-2.33), 2m from wall start
const t2_door_dorm2   = n_door('door_t2_03', 'wall_t2_05', 5.5, 0.8, 2.1, 'front')   // into Dorm2 (x=1.17), 5.5m from wall start
const t2_door_cocina  = n_door('door_t2_04', 'wall_t2_07', 2.0, 0.8, 2.1, 'front')   // 4.33m wall, door at 2m
const t2_door_bano    = n_door('door_t2_05', 'wall_t2_08', 1.0, 0.7, 2.1, 'front')   // 2m wall, door at 1m

const t2_win_living1  = n_window('window_t2_01', 'wall_t2_01', 1.5, 1.4, 1.2, 'front')  // 8.66m wall, window at 1.5m
const t2_win_living2  = n_window('window_t2_02', 'wall_t2_01', 6.5, 1.4, 1.2, 'front')  // 8.66m wall, window at 6.5m
const t2_win_dorm1    = n_window('window_t2_03', 'wall_t2_04', 5.5, 1.0, 1.0, 'front')  // 7.5m left wall, window in rear (dorm1 area)
const t2_win_dorm2    = n_window('window_t2_04', 'wall_t2_02', 5.5, 1.0, 1.0, 'front')  // 7.5m right wall, window in rear
const t2_win_cocina   = n_window('window_t2_05', 'wall_t2_03', 2.0, 0.8, 0.8, 'front')  // rear wall (x=4.33 to -4.33), 2m from start = x=2.33 (in cocina)

const t2Walls: WallObj[] = [
  // Perimeter 8.66 × 7.5
  n_wall('wall_t2_01', L2, [-4.33, -3.75], [4.33, -3.75], true, ['door_t2_01', 'window_t2_01', 'window_t2_02']),
  n_wall('wall_t2_02', L2, [4.33, -3.75], [4.33, 3.75], true, ['window_t2_04']),
  n_wall('wall_t2_03', L2, [4.33, 3.75], [-4.33, 3.75], true, ['window_t2_05']),
  n_wall('wall_t2_04', L2, [-4.33, 3.75], [-4.33, -3.75], true, ['window_t2_03']),
  // Front/rear divider
  n_wall('wall_t2_05', L2, [-4.33, 0], [4.33, 0], false, ['door_t2_02', 'door_t2_03']),
  // Rear left/right divider (dorms separated)
  n_wall('wall_t2_06', L2, [0, 0], [0, 3.75], false),
  // Cocina/baño split on right rear
  n_wall('wall_t2_07', L2, [0, 2], [4.33, 2], false, ['door_t2_04']),
  n_wall('wall_t2_08', L2, [2.5, 0], [2.5, 2], false, ['door_t2_05']),
]

const t2Zones = [
  n_zone('zone_t2_01', L2, 'Living / Comedor', [[-4.33, -3.75], [4.33, -3.75], [4.33, 0], [-4.33, 0]], C_LIVING),
  n_zone('zone_t2_02', L2, 'Dormitorio 1', [[-4.33, 0], [0, 0], [0, 3.75], [-4.33, 3.75]], C_DORM),
  n_zone('zone_t2_03', L2, 'Dormitorio 2', [[0, 0], [2.5, 0], [2.5, 2], [0, 2]], C_DORM),
  n_zone('zone_t2_04', L2, 'Baño', [[2.5, 0], [4.33, 0], [4.33, 2], [2.5, 2]], C_BANO),
  n_zone('zone_t2_05', L2, 'Cocina', [[0, 2], [4.33, 2], [4.33, 3.75], [0, 3.75]], C_COCINA),
]

const t2Ceiling = n_ceiling('ceiling_t2', L2, [[-4.33, -3.75], [4.33, -3.75], [4.33, 3.75], [-4.33, 3.75]], 2.7)
const t2Slab = n_slab('slab_t2', L2, [[-4.33, -3.75], [4.33, -3.75], [4.33, 3.75], [-4.33, 3.75]])
const t2AllNodes = [t2_door_entry, t2_door_dorm1, t2_door_dorm2, t2_door_cocina, t2_door_bano, t2_win_living1, t2_win_living2, t2_win_dorm1, t2_win_dorm2, t2_win_cocina]

const t2Level = n_level(L2, 'building_t2', 0, 'Planta Baja', [
  'slab_t2', 'ceiling_t2',
  ...t2Walls.map((w) => w.id),
  ...t2Zones.map((z) => z.id),
])
const t2Building = n_building('building_t2', 'site_t2', [L2])
const t2Site = n_site('site_t2', [[-4.33, -10], [4.33, -10], [4.33, 10], [-4.33, 10]], ['building_t2'])

// ═══════════════════════════════════════════════════════════════════════════════
// Template 3 · PH – Propiedad Horizontal (~55 m²)
// Source: Ley 13.512, iProfesional, A24, Infobae real-estate listings.
// Ground-floor PH unit off shared pasillo. Half-width of casa chorizo lot:
// 4.33 m × 12 m. Living-comedor, 1 dormitorio, cocina, baño, patio propio.
// High ceilings (3.5 m) typical of older converted chorizo PH.
// ═══════════════════════════════════════════════════════════════════════════════
const L3 = 'level_t3_0'

// Unit: 4.33m wide × 12m deep. Pasillo access from street side.
// y=-6 = pasillo/entry, y=6 = patio at rear
// Wall lengths: t3_01=4.32m, t3_02=12m, t3_03=4.32m, t3_05/06/07=4.32m, t3_08=2.5m
const t3_door_entry  = n_door('door_t3_01', 'wall_t3_01', 2.16, 0.9, 2.4, 'front')  // 4.32m wall, door at center
const t3_door_dorm   = n_door('door_t3_02', 'wall_t3_05', 2.16, 0.8, 2.4, 'front')  // 4.32m wall, door at center
const t3_door_cocina = n_door('door_t3_03', 'wall_t3_06', 1.5, 0.8, 2.4, 'front')   // 4.32m wall, door at 1.5m
const t3_door_bano   = n_door('door_t3_04', 'wall_t3_08', 1.25, 0.7, 2.4, 'front')  // 2.5m wall, door at center
const t3_door_patio  = n_door('door_t3_05', 'wall_t3_07', 2.16, 0.9, 2.4, 'front')  // 4.32m wall, door at center

const t3_win_living  = n_window('window_t3_01', 'wall_t3_01', 0.8, 1.0, 1.8, 'front')   // 4.32m wall, window at 0.8m
const t3_win_dorm    = n_window('window_t3_02', 'wall_t3_02', 6.0, 1.0, 1.4, 'front')   // 12m wall, window at 6m (y=0, center of dorm area y=-2 to 2)
const t3_win_cocina  = n_window('window_t3_03', 'wall_t3_03', 2.16, 0.6, 0.6, 'front')  // 4.32m rear wall, window at center

const t3Walls: WallObj[] = [
  // Perimeter 4.33 × 12
  n_wall('wall_t3_01', L3, [-2.16, -6], [2.16, -6], true, ['door_t3_01', 'window_t3_01']),  // pasillo side
  n_wall('wall_t3_02', L3, [2.16, -6], [2.16, 6], true, ['window_t3_02']),                   // right wall
  n_wall('wall_t3_03', L3, [2.16, 6], [-2.16, 6], true, ['window_t3_03']),                   // rear (patio side)
  n_wall('wall_t3_04', L3, [-2.16, 6], [-2.16, -6], true),                                   // left medianera
  // Living / dorm divider
  n_wall('wall_t3_05', L3, [-2.16, -2], [2.16, -2], false, ['door_t3_02']),
  // Dorm / service divider
  n_wall('wall_t3_06', L3, [-2.16, 2], [2.16, 2], false, ['door_t3_03']),
  // Service / patio divider
  n_wall('wall_t3_07', L3, [-2.16, 4.5], [2.16, 4.5], false, ['door_t3_05']),
  // Cocina / baño divider
  n_wall('wall_t3_08', L3, [0, 2], [0, 4.5], false, ['door_t3_04']),
]

const t3Zones = [
  n_zone('zone_t3_01', L3, 'Living / Comedor', [[-2.16, -6], [2.16, -6], [2.16, -2], [-2.16, -2]], C_LIVING),
  n_zone('zone_t3_02', L3, 'Dormitorio', [[-2.16, -2], [2.16, -2], [2.16, 2], [-2.16, 2]], C_DORM),
  n_zone('zone_t3_03', L3, 'Cocina', [[-2.16, 2], [0, 2], [0, 4.5], [-2.16, 4.5]], C_COCINA),
  n_zone('zone_t3_04', L3, 'Baño', [[0, 2], [2.16, 2], [2.16, 4.5], [0, 4.5]], C_BANO),
  n_zone('zone_t3_05', L3, 'Patio', [[-2.16, 4.5], [2.16, 4.5], [2.16, 6], [-2.16, 6]], C_PATIO),
]

const t3Ceiling = n_ceiling('ceiling_t3', L3, [[-2.16, -6], [2.16, -6], [2.16, 6], [-2.16, 6]], 3.5)
const t3Slab = n_slab('slab_t3', L3, [[-2.16, -6], [2.16, -6], [2.16, 6], [-2.16, 6]])
const t3AllNodes = [t3_door_entry, t3_door_dorm, t3_door_cocina, t3_door_bano, t3_door_patio, t3_win_living, t3_win_dorm, t3_win_cocina]

const t3Level = n_level(L3, 'building_t3', 0, 'Planta Baja', [
  'slab_t3', 'ceiling_t3',
  ...t3Walls.map((w) => w.id),
  ...t3Zones.map((z) => z.id),
])
const t3Building = n_building('building_t3', 'site_t3', [L3])
const t3Site = n_site('site_t3', [[-4.33, -8], [4.33, -8], [4.33, 8], [-4.33, 8]], ['building_t3'])

// ═══════════════════════════════════════════════════════════════════════════════
// Template 4 · Casa Suburbana GBA (~95 m²)
// Source: Britannica ("ranch-style concrete homes with tile roofs"), Argenprop
//         and Inmuebles Clarín listings (GBA Zona Sur/Norte/Oeste patterns).
// Lot: 10 m × 30 m. Building: 10 m × 12 m. Living-comedor, cocina-comedor
// diario, 3 dormitorios, 1 baño completo, lavadero, galería semicubierta
// with quincho/parrilla. Ceiling 2.7 m. L-shaped circulation.
// ═══════════════════════════════════════════════════════════════════════════════
const L4 = 'level_t4_0'

// Layout: y=-6..6 building. Front (street) at y=-6.
// Zone A (front): Living-comedor y=-6..0, Cocina-comedor diario y=-6..0 (right)
// Zone B (rear): 3 dorms + baño + lavadero y=0..6
// Galería at rear y=4..6 right side
// Wall lengths: t4_01=10m, t4_02=12m, t4_03=10m, t4_04=12m, t4_05=10m, t4_06=6m, t4_07=4m, t4_09=3m, t4_10=3m, t4_11=3.5m
const t4_door_entry    = n_door('door_t4_01', 'wall_t4_01', 3.0, 1.0, 2.1, 'front')   // 10m wall, door at 3m from left
const t4_door_cocina   = n_door('door_t4_02', 'wall_t4_06', 3.0, 0.9, 2.1, 'front')   // 6m wall, door at 3m
const t4_door_dorm1    = n_door('door_t4_03', 'wall_t4_05', 2.0, 0.8, 2.1, 'front')   // 10m wall, door at 2m
const t4_door_dorm2    = n_door('door_t4_04', 'wall_t4_07', 2.0, 0.8, 2.1, 'front')   // 4m wall, door at 2m
const t4_door_dorm3    = n_door('door_t4_05', 'wall_t4_05', 6.5, 0.8, 2.1, 'front')   // 10m wall, door at 6.5m
const t4_door_bano     = n_door('door_t4_06', 'wall_t4_09', 1.5, 0.7, 2.1, 'front')   // 3m wall, door at 1.5m
const t4_door_lavadero = n_door('door_t4_07', 'wall_t4_10', 1.5, 0.8, 2.1, 'front')   // 3m wall, door at 1.5m
const t4_door_galeria  = n_door('door_t4_08', 'wall_t4_11', 1.75, 1.5, 2.1, 'front')  // 3.5m wall, door at center

const t4_win_living1   = n_window('window_t4_01', 'wall_t4_01', 1.5, 1.8, 1.4, 'front')  // 10m wall, large window at 1.5m (x=-3.5, in living area)
const t4_win_living2   = n_window('window_t4_02', 'wall_t4_04', 8.0, 1.2, 1.2, 'front')  // 12m wall, window at 8m (rear area)
const t4_win_cocina    = n_window('window_t4_03', 'wall_t4_02', 2.0, 0.8, 0.8, 'front')  // 12m wall, window at 2m
const t4_win_dorm1     = n_window('window_t4_04', 'wall_t4_04', 4.0, 1.2, 1.0, 'front')  // 12m wall, window at 4m
const t4_win_dorm2     = n_window('window_t4_05', 'wall_t4_02', 8.0, 1.2, 1.0, 'front')  // 12m wall, window at 8m
const t4_win_dorm3     = n_window('window_t4_06', 'wall_t4_03', 7.0, 1.2, 1.0, 'front')  // 10m rear wall, window at 7m

const t4Walls: WallObj[] = [
  // Perimeter 10 × 12
  n_wall('wall_t4_01', L4, [-5, -6], [5, -6], true, ['door_t4_01', 'window_t4_01']),
  n_wall('wall_t4_02', L4, [5, -6], [5, 6], true, ['window_t4_03', 'window_t4_05']),
  n_wall('wall_t4_03', L4, [5, 6], [-5, 6], true, ['window_t4_06']),
  n_wall('wall_t4_04', L4, [-5, 6], [-5, -6], true, ['window_t4_02', 'window_t4_04']),
  // Front/rear divider (pasillo runs along x=0)
  n_wall('wall_t4_05', L4, [-5, 0], [5, 0], false, ['door_t4_03', 'door_t4_05']),
  // Front half: living/cocina split
  n_wall('wall_t4_06', L4, [2, -6], [2, 0], false, ['door_t4_02']),
  // Rear: dorm2/dorm3 split
  n_wall('wall_t4_07', L4, [-1.5, 0], [-1.5, 4], false, ['door_t4_04']),
  // Rear: dorm3/service split
  n_wall('wall_t4_08', L4, [2, 0], [2, 6], false),
  // Baño
  n_wall('wall_t4_09', L4, [2, 2.5], [5, 2.5], false, ['door_t4_06']),
  // Lavadero
  n_wall('wall_t4_10', L4, [2, 4.5], [5, 4.5], false, ['door_t4_07']),
  // Galería rear wall opening
  n_wall('wall_t4_11', L4, [-5, 4], [-1.5, 4], false, ['door_t4_08']),
]

const t4Zones = [
  n_zone('zone_t4_01', L4, 'Living / Comedor', [[-5, -6], [2, -6], [2, 0], [-5, 0]], C_LIVING),
  n_zone('zone_t4_02', L4, 'Cocina', [[2, -6], [5, -6], [5, 0], [2, 0]], C_COCINA),
  n_zone('zone_t4_03', L4, 'Dormitorio 1', [[-5, 0], [-1.5, 0], [-1.5, 4], [-5, 4]], C_DORM),
  n_zone('zone_t4_04', L4, 'Dormitorio 2', [[-1.5, 0], [2, 0], [2, 4], [-1.5, 4]], C_DORM),
  n_zone('zone_t4_05', L4, 'Dormitorio 3', [[-5, 4], [-1.5, 4], [-1.5, 6], [-5, 6]], C_DORM),
  n_zone('zone_t4_06', L4, 'Baño', [[2, 0], [5, 0], [5, 2.5], [2, 2.5]], C_BANO),
  n_zone('zone_t4_07', L4, 'Lavadero', [[2, 2.5], [5, 2.5], [5, 4.5], [2, 4.5]], C_LAVADERO),
  n_zone('zone_t4_08', L4, 'Galería / Quincho', [[-1.5, 4], [2, 4], [2, 6], [-1.5, 6]], C_GALERIA),
  n_zone('zone_t4_09', L4, 'Patio', [[2, 4.5], [5, 4.5], [5, 6], [2, 6]], C_PATIO),
]

const t4Ceiling = n_ceiling('ceiling_t4', L4, [[-5, -6], [5, -6], [5, 6], [-5, 6]], 2.7)
const t4Slab = n_slab('slab_t4', L4, [[-5, -6], [5, -6], [5, 6], [-5, 6]])
const t4AllNodes = [t4_door_entry, t4_door_cocina, t4_door_dorm1, t4_door_dorm2, t4_door_dorm3, t4_door_bano, t4_door_lavadero, t4_door_galeria, t4_win_living1, t4_win_living2, t4_win_cocina, t4_win_dorm1, t4_win_dorm2, t4_win_dorm3]

const t4Level = n_level(L4, 'building_t4', 0, 'Planta Baja', [
  'slab_t4', 'ceiling_t4',
  ...t4Walls.map((w) => w.id),
  ...t4Zones.map((z) => z.id),
])
const t4Building = n_building('building_t4', 'site_t4', [L4])
const t4Site = n_site('site_t4', [[-5, -15], [5, -15], [5, 15], [-5, 15]], ['building_t4'])

// ═══════════════════════════════════════════════════════════════════════════════
// Template 5 · Casa Dos Plantas (~130 m²)
// Source: Argenprop/Clarin real-estate listings for GBA 2-story homes, growing
//         trend in suburban developments.
// Lot: 8.66 m × 25 m. Building: 8.66 m × 10 m (both floors).
// PB (65 m²): Garage + living-comedor + cocina + toilette + lavadero + galería
// PA (65 m²): 3 dormitorios (principal en suite con vestidor) + baño completo
// Ceiling 2.6 m both floors.
// ═══════════════════════════════════════════════════════════════════════════════
const L5_PB = 'level_t5_0'
const L5_PA = 'level_t5_1'

// Building: 8.66 × 10 centred at origin. y=-5 = street, y=5 = rear/patio.
// PB layout:
//   Garage: x=-4.33..-1, y=-5..-1.5
//   Living-comedor: x=-1..4.33, y=-5..-1.5 + x=-4.33..4.33, y=-1.5..2
//   Cocina: x=1.5..4.33, y=2..5
//   Toilette: x=-1..1.5, y=2..3.5
//   Lavadero: x=-4.33..-1, y=2..5
//   Galería: x=-1..1.5, y=3.5..5

// PB doors/windows
// Wall lengths: t5_01=8.66m, t5_02=10m, t5_05=3.5m, t5_07=3m, t5_08=2.5m, t5_09=1.5m, t5_10=3.33m
const t5_door_garage   = n_door('door_t5_01', 'wall_t5_01', 1.66, 2.5, 2.1, 'front')    // 8.66m wall, portón at 1.66m
const t5_door_entry    = n_door('door_t5_02', 'wall_t5_01', 6.0, 0.9, 2.1, 'front')     // 8.66m wall, puerta at 6m
const t5_door_living   = n_door('door_t5_03', 'wall_t5_05', 1.75, 0.9, 2.1, 'front')    // 3.5m wall, door at center
const t5_door_cocina   = n_door('door_t5_04', 'wall_t5_07', 1.5, 0.9, 2.1, 'front')     // 3m wall, door at 1.5m
const t5_door_toilette = n_door('door_t5_05', 'wall_t5_09', 0.75, 0.6, 2.1, 'front')    // 1.5m wall, door at center
const t5_door_lavadero = n_door('door_t5_06', 'wall_t5_10', 1.66, 0.8, 2.1, 'front')    // 3.33m wall, door at center
const t5_door_galeria  = n_door('door_t5_07', 'wall_t5_08', 1.25, 1.5, 2.1, 'front')    // 2.5m wall, door at center

const t5_win_living    = n_window('window_t5_01', 'wall_t5_01', 7.5, 1.5, 1.2, 'front')  // 8.66m wall, window at 7.5m
const t5_win_cocina    = n_window('window_t5_02', 'wall_t5_02', 8.0, 0.8, 0.8, 'front')  // 10m wall, window at 8m (rear)
const t5_win_livside   = n_window('window_t5_03', 'wall_t5_02', 3.0, 1.2, 1.2, 'front')  // 10m wall, window at 3m

// PA doors/windows
// Wall lengths: t5_13=8.66m, t5_14=10m, t5_15=8.66m, t5_17=4.33m, t5_18=4m, t5_19=4.33m, t5_20=2m, t5_21=4.33m
const t5_door_dorm_pr  = n_door('door_t5_08', 'wall_t5_17', 2.16, 0.9, 2.1, 'front')     // 4.33m wall, door at center
const t5_door_dorm2    = n_door('door_t5_09', 'wall_t5_18', 2.0, 0.8, 2.1, 'front')      // 4m wall, door at 2m
const t5_door_dorm3    = n_door('door_t5_10', 'wall_t5_19', 2.16, 0.8, 2.1, 'front')     // 4.33m wall, door at center
const t5_door_bano_pr  = n_door('door_t5_11', 'wall_t5_20', 1.0, 0.7, 2.1, 'front')      // 2m wall, door at 1m
const t5_door_bano     = n_door('door_t5_12', 'wall_t5_21', 2.16, 0.7, 2.1, 'front')     // 4.33m wall, door at center

const t5_win_dorm_pr   = n_window('window_t5_04', 'wall_t5_13', 1.66, 1.4, 1.2, 'front')  // 8.66m wall, window at 1.66m
const t5_win_dorm2     = n_window('window_t5_05', 'wall_t5_13', 6.5, 1.2, 1.0, 'front')   // 8.66m wall, window at 6.5m
const t5_win_dorm3     = n_window('window_t5_06', 'wall_t5_15', 6.5, 1.2, 1.0, 'front')   // 8.66m rear wall, window at 6.5m
const t5_win_pasillo   = n_window('window_t5_07', 'wall_t5_14', 5.0, 0.6, 0.6, 'front')   // 10m wall, window at 5m

const t5WallsPB: WallObj[] = [
  n_wall('wall_t5_01', L5_PB, [-4.33, -5], [4.33, -5], true, ['door_t5_01', 'door_t5_02', 'window_t5_01']),
  n_wall('wall_t5_02', L5_PB, [4.33, -5], [4.33, 5], true, ['window_t5_02', 'window_t5_03']),
  n_wall('wall_t5_03', L5_PB, [4.33, 5], [-4.33, 5], true),
  n_wall('wall_t5_04', L5_PB, [-4.33, 5], [-4.33, -5], true),
  // Garage/living divider
  n_wall('wall_t5_05', L5_PB, [-1, -5], [-1, -1.5], false, ['door_t5_03']),
  // Living rear wall
  n_wall('wall_t5_06', L5_PB, [-4.33, 2], [4.33, 2], false),
  // Cocina divider
  n_wall('wall_t5_07', L5_PB, [1.5, 2], [1.5, 5], false, ['door_t5_04']),
  // Galería rear
  n_wall('wall_t5_08', L5_PB, [-1, 3.5], [1.5, 3.5], false, ['door_t5_07']),
  // Toilette
  n_wall('wall_t5_09', L5_PB, [-1, 2], [-1, 3.5], false, ['door_t5_05']),
  // Lavadero
  n_wall('wall_t5_10', L5_PB, [-4.33, 3.5], [-1, 3.5], false, ['door_t5_06']),
  // Garage/living horizontal divider
  n_wall('wall_t5_11', L5_PB, [-4.33, -1.5], [-1, -1.5], false),
]

const t5WallsPA: WallObj[] = [
  n_wall('wall_t5_13', L5_PA, [-4.33, -5], [4.33, -5], true, ['window_t5_04', 'window_t5_05']),
  n_wall('wall_t5_14', L5_PA, [4.33, -5], [4.33, 5], true, ['window_t5_07']),
  n_wall('wall_t5_15', L5_PA, [4.33, 5], [-4.33, 5], true, ['window_t5_06']),
  n_wall('wall_t5_16', L5_PA, [-4.33, 5], [-4.33, -5], true),
  // Dorm principal (front left, large: -4.33..0, -5..-1)
  n_wall('wall_t5_17', L5_PA, [-4.33, -1], [0, -1], false, ['door_t5_08']),
  // Dorm2 (front right: 0..4.33, -5..-1)
  n_wall('wall_t5_18', L5_PA, [0, -5], [0, -1], false, ['door_t5_09']),
  // Dorm3 (rear left: -4.33..0, 1..5)
  n_wall('wall_t5_19', L5_PA, [-4.33, 1], [0, 1], false, ['door_t5_10']),
  // En suite bathroom (inside dorm principal: -4.33..-2, -1..1)
  n_wall('wall_t5_20', L5_PA, [-2, -1], [-2, 1], false, ['door_t5_11']),
  // Baño completo (right rear: 0..4.33, 1..3)
  n_wall('wall_t5_21', L5_PA, [0, 1], [4.33, 1], false, ['door_t5_12']),
  // Pasillo (centre: 0..4.33 or -4.33..0, -1..1)
  n_wall('wall_t5_22', L5_PA, [0, -1], [4.33, -1], false),
  // Baño/pasillo rear
  n_wall('wall_t5_23', L5_PA, [0, 3], [4.33, 3], false),
]

const t5ZonesPB = [
  n_zone('zone_t5_01', L5_PB, 'Garage', [[-4.33, -5], [-1, -5], [-1, -1.5], [-4.33, -1.5]], C_GARAGE),
  n_zone('zone_t5_02', L5_PB, 'Living / Comedor', [[-1, -5], [4.33, -5], [4.33, 2], [-4.33, 2], [-4.33, -1.5], [-1, -1.5]], C_LIVING),
  n_zone('zone_t5_03', L5_PB, 'Cocina', [[1.5, 2], [4.33, 2], [4.33, 5], [1.5, 5]], C_COCINA),
  n_zone('zone_t5_04', L5_PB, 'Toilette', [[-1, 2], [-1, 3.5], [1.5, 3.5], [1.5, 2]], C_BANO),
  n_zone('zone_t5_05', L5_PB, 'Lavadero', [[-4.33, 2], [-1, 2], [-1, 3.5], [-4.33, 3.5]], C_LAVADERO),
  n_zone('zone_t5_06', L5_PB, 'Galería', [[-4.33, 3.5], [1.5, 3.5], [1.5, 5], [-4.33, 5]], C_GALERIA),
]

const t5ZonesPA = [
  n_zone('zone_t5_07', L5_PA, 'Dormitorio Principal', [[-4.33, -5], [0, -5], [0, -1], [-4.33, -1]], C_DORM),
  n_zone('zone_t5_08', L5_PA, 'Dormitorio 2', [[0, -5], [4.33, -5], [4.33, -1], [0, -1]], C_DORM),
  n_zone('zone_t5_09', L5_PA, 'Baño en Suite', [[-4.33, -1], [-2, -1], [-2, 1], [-4.33, 1]], C_BANO),
  n_zone('zone_t5_10', L5_PA, 'Pasillo', [[-2, -1], [4.33, -1], [4.33, 1], [-2, 1]], C_PASILLO),
  n_zone('zone_t5_11', L5_PA, 'Dormitorio 3', [[-4.33, 1], [0, 1], [0, 5], [-4.33, 5]], C_DORM),
  n_zone('zone_t5_12', L5_PA, 'Baño Completo', [[0, 1], [4.33, 1], [4.33, 3], [0, 3]], C_BANO),
  n_zone('zone_t5_13', L5_PA, 'Balcón / Terraza', [[0, 3], [4.33, 3], [4.33, 5], [0, 5]], C_GALERIA),
]

const t5CeilingPB = n_ceiling('ceiling_t5_pb', L5_PB, [[-4.33, -5], [4.33, -5], [4.33, 5], [-4.33, 5]], 2.6)
const t5CeilingPA = n_ceiling('ceiling_t5_pa', L5_PA, [[-4.33, -5], [4.33, -5], [4.33, 5], [-4.33, 5]], 2.6)
const t5SlabPB = n_slab('slab_t5_pb', L5_PB, [[-4.33, -5], [4.33, -5], [4.33, 5], [-4.33, 5]])
const t5SlabPA = n_slab('slab_t5_pa', L5_PA, [[-4.33, -5], [4.33, -5], [4.33, 5], [-4.33, 5]])

const t5AllPB = [t5_door_garage, t5_door_entry, t5_door_living, t5_door_cocina, t5_door_toilette, t5_door_lavadero, t5_door_galeria, t5_win_living, t5_win_cocina, t5_win_livside]
const t5AllPA = [t5_door_dorm_pr, t5_door_dorm2, t5_door_dorm3, t5_door_bano_pr, t5_door_bano, t5_win_dorm_pr, t5_win_dorm2, t5_win_dorm3, t5_win_pasillo]

const t5LevelPB = n_level(L5_PB, 'building_t5', 0, 'Planta Baja', [
  'slab_t5_pb', 'ceiling_t5_pb',
  ...t5WallsPB.map((w) => w.id),
  ...t5ZonesPB.map((z) => z.id),
])
const t5LevelPA = n_level(L5_PA, 'building_t5', 1, 'Planta Alta', [
  'slab_t5_pa', 'ceiling_t5_pa',
  ...t5WallsPA.map((w) => w.id),
  ...t5ZonesPA.map((z) => z.id),
])
const t5Building = n_building('building_t5', 'site_t5', [L5_PB, L5_PA])
const t5Site = n_site('site_t5', [[-4.33, -12.5], [4.33, -12.5], [4.33, 12.5], [-4.33, 12.5]], ['building_t5'])

// ═══════════════════════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════════════════════

function toWalls(walls: WallObj[]): TemplateWall[] {
  return walls.map((w) => ({
    start: w.start as [number, number],
    end: w.end as [number, number],
    exterior: w.frontSide === 'exterior',
  }))
}

export const TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Casa Chorizo',
    subtitle: '~85 m² · 1 planta',
    description: 'Tipología porteña clásica (1880–1930): habitaciones de 4×4 m en secuencia a lo largo de galería/patio lateral. Zaguán, sala, 2 dormitorios, comedor, cocina y baño. Techos de 4,5 m. Lote 8,66 m × 20 m.',
    area: 85,
    floors: 1,
    bedrooms: 2,
    bathrooms: 1,
    previewWalls: [toWalls(t1Walls)],
    scene: makeScene([t1Site, t1Building, t1Level, t1Slab, t1Ceiling, ...t1Walls, ...t1Zones, ...t1AllNodes]),
  },
  {
    id: 't2',
    name: 'Casa Cajón',
    subtitle: '~60 m² · 1 planta',
    description: 'Tipología suburbana compacta (post-1930): rectángulo dividido en cuadrantes sin pasillo. Living-comedor al frente, 2 dormitorios, cocina y baño. Techos de 2,7 m. Lote 8,66 m × 20 m.',
    area: 60,
    floors: 1,
    bedrooms: 2,
    bathrooms: 1,
    previewWalls: [toWalls(t2Walls)],
    scene: makeScene([t2Site, t2Building, t2Level, t2Slab, t2Ceiling, ...t2Walls, ...t2Zones, ...t2AllNodes]),
  },
  {
    id: 't3',
    name: 'PH (Propiedad Horizontal)',
    subtitle: '~55 m² · 1 planta',
    description: 'Unidad PH en planta baja, la tipología más buscada en Buenos Aires. Living-comedor, 1 dormitorio, cocina, baño y patio propio. Techos altos de 3,5 m. Acceso por pasillo compartido.',
    area: 55,
    floors: 1,
    bedrooms: 1,
    bathrooms: 1,
    previewWalls: [toWalls(t3Walls)],
    scene: makeScene([t3Site, t3Building, t3Level, t3Slab, t3Ceiling, ...t3Walls, ...t3Zones, ...t3AllNodes]),
  },
  {
    id: 't4',
    name: 'Casa Suburbana GBA',
    subtitle: '~95 m² · 1 planta',
    description: 'Ranch-style de hormigón con techo de tejas, la más construida hoy en GBA. Living-comedor, cocina, 3 dormitorios, baño, lavadero, galería con quincho/parrilla. Techos de 2,7 m. Lote 10 × 30 m.',
    area: 95,
    floors: 1,
    bedrooms: 3,
    bathrooms: 1,
    previewWalls: [toWalls(t4Walls)],
    scene: makeScene([t4Site, t4Building, t4Level, t4Slab, t4Ceiling, ...t4Walls, ...t4Zones, ...t4AllNodes]),
  },
  {
    id: 't5',
    name: 'Casa Dos Plantas',
    subtitle: '~130 m² · 2 plantas',
    description: 'Tendencia creciente en GBA. PB: garage, living-comedor, cocina, toilette, lavadero y galería. PA: dormitorio principal en suite, 2 dormitorios, baño completo y balcón terraza. Lote 8,66 × 25 m.',
    area: 130,
    floors: 2,
    bedrooms: 3,
    bathrooms: 2,
    previewWalls: [toWalls(t5WallsPB), toWalls(t5WallsPA)],
    scene: makeScene([
      t5Site, t5Building, t5LevelPB, t5LevelPA,
      t5SlabPB, t5SlabPA, t5CeilingPB, t5CeilingPA,
      ...t5WallsPB, ...t5WallsPA,
      ...t5ZonesPB, ...t5ZonesPA,
      ...t5AllPB, ...t5AllPA,
    ]),
  },
]
