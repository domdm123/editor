'use client'

import type { AnyNodeId } from '@pascal-app/core'
import { LevelNode, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import {
  AppWindow,
  ArrowRight,
  Box,
  Building2,
  Camera,
  Copy,
  DoorOpen,
  Eye,
  EyeOff,
  FileJson,
  Grid3X3,
  Hexagon,
  Layers,
  Map,
  Maximize2,
  Minimize2,
  Moon,
  MousePointer2,
  Package,
  PencilLine,
  Plus,
  Redo2,
  Square,
  SquareStack,
  Sun,
  Trash2,
  Undo2,
  Video,
} from 'lucide-react'
import { useEffect } from 'react'
import { deleteLevelWithFallbackSelection } from '../../../lib/level-selection'
import { useCommandRegistry } from '../../../store/use-command-registry'
import type { StructureTool } from '../../../store/use-editor'
import useEditor from '../../../store/use-editor'
import { useCommandPalette } from './index'

export function EditorCommands() {
  const register = useCommandRegistry((s) => s.register)
  const { navigateTo, setInputValue, setOpen } = useCommandPalette()

  const { setPhase, setMode, setTool, setStructureLayer, isPreviewMode, setPreviewMode } =
    useEditor()

  const exportScene = useViewer((s) => s.exportScene)

  // Re-register when exportScene availability changes (it's a conditional action)
  useEffect(() => {
    const run = (fn: () => void) => {
      fn()
      setOpen(false)
    }

    const activateTool = (tool: StructureTool) => {
      run(() => {
        setPhase('structure')
        setMode('build')
        if (tool === 'zone') setStructureLayer('zones')
        setTool(tool)
      })
    }

    return register([
      // ── Scene ────────────────────────────────────────────────────────────
      // ── Escena ────────────────────────────────────────────────────────
      {
        id: 'editor.tool.wall',
        label: 'Herramienta Muro',
        group: 'Escena',
        icon: <Square className="h-4 w-4" />,
        keywords: ['muro', 'pared', 'dibujar', 'construir', 'estructura'],
        execute: () => activateTool('wall'),
      },
      {
        id: 'editor.tool.slab',
        label: 'Herramienta Losa',
        group: 'Escena',
        icon: <Layers className="h-4 w-4" />,
        keywords: ['losa', 'piso', 'construir'],
        execute: () => activateTool('slab'),
      },
      {
        id: 'editor.tool.ceiling',
        label: 'Herramienta Cielorraso',
        group: 'Escena',
        icon: <Grid3X3 className="h-4 w-4" />,
        keywords: ['cielorraso', 'techo', 'construir'],
        execute: () => activateTool('ceiling'),
      },
      {
        id: 'editor.tool.door',
        label: 'Herramienta Puerta',
        group: 'Escena',
        icon: <DoorOpen className="h-4 w-4" />,
        keywords: ['puerta', 'abertura', 'entrada'],
        execute: () => activateTool('door'),
      },
      {
        id: 'editor.tool.window',
        label: 'Herramienta Ventana',
        group: 'Escena',
        icon: <AppWindow className="h-4 w-4" />,
        keywords: ['ventana', 'abertura', 'vidrio'],
        execute: () => activateTool('window'),
      },
      {
        id: 'editor.tool.item',
        label: 'Herramienta Mobiliario',
        group: 'Escena',
        icon: <Package className="h-4 w-4" />,
        keywords: ['mueble', 'objeto', 'mobiliario', 'amueblar'],
        execute: () => activateTool('item'),
      },
      {
        id: 'editor.tool.zone',
        label: 'Herramienta Zona',
        group: 'Escena',
        icon: <Hexagon className="h-4 w-4" />,
        keywords: ['zona', 'ambiente', 'espacio', 'habitación'],
        execute: () => activateTool('zone'),
      },
      {
        id: 'editor.delete-selection',
        label: 'Eliminar selección',
        group: 'Escena',
        icon: <Trash2 className="h-4 w-4" />,
        keywords: ['eliminar', 'borrar', 'quitar'],
        shortcut: ['⌫'],
        when: () => useViewer.getState().selection.selectedIds.length > 0,
        execute: () =>
          run(() => {
            const { selectedIds } = useViewer.getState().selection
            useScene.getState().deleteNodes(selectedIds as any[])
          }),
      },

      // ── Plantas ────────────────────────────────────────────────────────
      {
        id: 'editor.level.goto',
        label: 'Ir a planta',
        group: 'Plantas',
        icon: <ArrowRight className="h-4 w-4" />,
        keywords: ['planta', 'piso', 'nivel', 'ir', 'navegar', 'cambiar', 'seleccionar'],
        navigate: true,
        when: () => Object.values(useScene.getState().nodes).some((n) => n.type === 'level'),
        execute: () => navigateTo('goto-level'),
      },
      {
        id: 'editor.level.add',
        label: 'Agregar planta',
        group: 'Plantas',
        icon: <Plus className="h-4 w-4" />,
        keywords: ['planta', 'piso', 'nivel', 'agregar', 'crear', 'nueva'],
        execute: () =>
          run(() => {
            const { nodes } = useScene.getState()
            const building = Object.values(nodes).find((n) => n.type === 'building')
            if (!building) return
            const newLevel = LevelNode.parse({
              level: building.children.length,
              children: [],
              parentId: building.id,
            })
            useScene.getState().createNode(newLevel, building.id)
            useViewer.getState().setSelection({ levelId: newLevel.id })
          }),
      },
      {
        id: 'editor.level.rename',
        label: 'Renombrar planta',
        group: 'Plantas',
        icon: <PencilLine className="h-4 w-4" />,
        keywords: ['planta', 'piso', 'nivel', 'renombrar', 'nombre'],
        navigate: true,
        when: () => !!useViewer.getState().selection.levelId,
        execute: () => {
          const activeLevelId = useViewer.getState().selection.levelId
          if (!activeLevelId) return
          const level = useScene.getState().nodes[activeLevelId as AnyNodeId] as LevelNode
          setInputValue(level?.name ?? '')
          navigateTo('rename-level')
        },
      },
      {
        id: 'editor.level.delete',
        label: 'Eliminar planta',
        group: 'Plantas',
        icon: <Trash2 className="h-4 w-4" />,
        keywords: ['planta', 'piso', 'nivel', 'eliminar', 'borrar'],
        when: () => {
          const levelId = useViewer.getState().selection.levelId
          if (!levelId) return false
          const node = useScene.getState().nodes[levelId as AnyNodeId] as LevelNode
          return node?.type === 'level' && node.level !== 0
        },
        execute: () =>
          run(() => {
            const activeLevelId = useViewer.getState().selection.levelId
            if (!activeLevelId) return
            deleteLevelWithFallbackSelection(activeLevelId as AnyNodeId)
          }),
      },

      // ── Controles del visor ───────────────────────────────────────────
      {
        id: 'editor.viewer.wall-mode',
        label: 'Modo de muros',
        group: 'Controles del visor',
        icon: <Layers className="h-4 w-4" />,
        keywords: ['muro', 'corte', 'alto', 'bajo', 'vista'],
        badge: () => {
          const mode = useViewer.getState().wallMode
          return { cutaway: 'Corte', up: 'Alto', down: 'Bajo' }[mode]
        },
        navigate: true,
        execute: () => navigateTo('wall-mode'),
      },
      {
        id: 'editor.viewer.level-mode',
        label: 'Modo de plantas',
        group: 'Controles del visor',
        icon: <SquareStack className="h-4 w-4" />,
        keywords: ['planta', 'piso', 'explosionado', 'apilado', 'solo'],
        badge: () => {
          const mode = useViewer.getState().levelMode
          return { manual: 'Manual', stacked: 'Apilado', exploded: 'Explosionado', solo: 'Solo' }[mode]
        },
        navigate: true,
        execute: () => navigateTo('level-mode'),
      },
      {
        id: 'editor.viewer.camera-mode',
        label: () => {
          const mode = useViewer.getState().cameraMode
          return `Cámara: Cambiar a ${mode === 'perspective' ? 'Ortográfica' : 'Perspectiva'}`
        },
        group: 'Controles del visor',
        icon: <Video className="h-4 w-4" />,
        keywords: ['cámara', 'ortográfica', 'perspectiva', '2d', '3d', 'vista'],
        execute: () =>
          run(() => {
            const { cameraMode, setCameraMode } = useViewer.getState()
            setCameraMode(cameraMode === 'perspective' ? 'orthographic' : 'perspective')
          }),
      },
      {
        id: 'editor.viewer.theme',
        label: () => {
          const theme = useViewer.getState().theme
          return theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
        },
        group: 'Controles del visor',
        icon: <Sun className="h-4 w-4" />,
        keywords: ['tema', 'oscuro', 'claro', 'apariencia', 'color'],
        execute: () =>
          run(() => {
            const { theme, setTheme } = useViewer.getState()
            setTheme(theme === 'dark' ? 'light' : 'dark')
          }),
      },
      {
        id: 'editor.viewer.camera-snapshot',
        label: 'Vista guardada',
        group: 'Controles del visor',
        icon: <Camera className="h-4 w-4" />,
        keywords: ['cámara', 'vista', 'captura', 'guardar', 'marcador'],
        navigate: true,
        execute: () => navigateTo('camera-view'),
      },

      // ── Vista ──────────────────────────────────────────────────────────
      {
        id: 'editor.view.preview',
        label: () => (isPreviewMode ? 'Salir de vista previa' : 'Vista previa'),
        group: 'Vista',
        icon: isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />,
        keywords: ['vista previa', 'presentar', 'solo lectura'],
        execute: () => run(() => setPreviewMode(!isPreviewMode)),
      },
      {
        id: 'editor.view.fullscreen',
        label: 'Pantalla completa',
        group: 'Vista',
        icon: <Maximize2 className="h-4 w-4" />,
        keywords: ['pantalla completa', 'maximizar', 'expandir', 'ventana'],
        execute: () =>
          run(() => {
            if (document.fullscreenElement) document.exitFullscreen()
            else document.documentElement.requestFullscreen()
          }),
      },

      // ── Historial ─────────────────────────────────────────────────────
      {
        id: 'editor.history.undo',
        label: 'Deshacer',
        group: 'Historial',
        icon: <Undo2 className="h-4 w-4" />,
        keywords: ['deshacer', 'revertir', 'atrás'],
        execute: () => run(() => useScene.temporal.getState().undo()),
      },
      {
        id: 'editor.history.redo',
        label: 'Rehacer',
        group: 'Historial',
        icon: <Redo2 className="h-4 w-4" />,
        keywords: ['rehacer', 'adelante', 'repetir'],
        execute: () => run(() => useScene.temporal.getState().redo()),
      },

      // ── Exportar y compartir ──────────────────────────────────────────
      {
        id: 'editor.export.json',
        label: 'Exportar escena (JSON)',
        group: 'Exportar y compartir',
        icon: <FileJson className="h-4 w-4" />,
        keywords: ['exportar', 'descargar', 'json', 'guardar', 'datos'],
        execute: () =>
          run(() => {
            const { nodes, rootNodeIds } = useScene.getState()
            const blob = new Blob([JSON.stringify({ nodes, rootNodeIds }, null, 2)], {
              type: 'application/json',
            })
            const url = URL.createObjectURL(blob)
            Object.assign(document.createElement('a'), {
              href: url,
              download: `escena_${new Date().toISOString().split('T')[0]}.json`,
            }).click()
            URL.revokeObjectURL(url)
          }),
      },
      ...(exportScene
        ? [
            {
              id: 'editor.export.glb',
              label: 'Exportar modelo 3D (GLB)',
              group: 'Exportar y compartir',
              icon: <Box className="h-4 w-4" />,
              keywords: ['exportar', 'glb', 'gltf', '3d', 'modelo', 'descargar'],
              execute: () => run(() => exportScene()),
            },
          ]
        : []),
      {
        id: 'editor.export.share-link',
        label: 'Copiar enlace',
        group: 'Exportar y compartir',
        icon: <Copy className="h-4 w-4" />,
        keywords: ['compartir', 'copiar', 'url', 'enlace'],
        execute: () => run(() => navigator.clipboard.writeText(window.location.href)),
      },
      {
        id: 'editor.export.screenshot',
        label: 'Captura de pantalla',
        group: 'Exportar y compartir',
        icon: <Camera className="h-4 w-4" />,
        keywords: ['captura', 'pantalla', 'imagen', 'foto', 'png'],
        execute: () =>
          run(() => {
            const canvas = document.querySelector('canvas')
            if (!canvas) return
            Object.assign(document.createElement('a'), {
              href: canvas.toDataURL('image/png'),
              download: `captura_${new Date().toISOString().split('T')[0]}.png`,
            }).click()
          }),
      },
    ])
  }, [
    register,
    navigateTo,
    setInputValue,
    setOpen,
    setPhase,
    setMode,
    setTool,
    setStructureLayer,
    isPreviewMode,
    setPreviewMode,
    exportScene,
  ])

  return null
}
