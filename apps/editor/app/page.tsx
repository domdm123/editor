'use client'

import { Editor } from '@pascal-app/editor'
import { useEffect, useState } from 'react'

function MobileBlockScreen() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#1a1a2e] px-8 text-center text-white">
      <div className="mb-6 text-6xl">🏗️</div>
      <h1 className="mb-4 font-bold text-3xl">
        ¡Opa, esto no va en el celu!
      </h1>
      <p className="mb-2 max-w-md text-lg text-gray-300">
        Nuestro diseñador de planos 3D necesita una pantalla grande para que puedas
        laburar cómodo. Abrilo desde la compu y vas a ver que es otra cosa.
      </p>
      <p className="mt-4 text-base text-gray-400">
        🖥️ Te esperamos desde la PC o notebook
      </p>
      <a
        href="https://servidos.ar"
        className="mt-8 rounded-xl bg-white/10 px-6 py-3 font-medium text-white transition hover:bg-white/20"
      >
        Volver a Servidos.ar
      </a>
    </div>
  )
}

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    setReady(true)
  }, [])

  if (!ready) return null

  if (isMobile) {
    return <MobileBlockScreen />
  }

  return (
    <div className="h-screen w-screen">
      <Editor projectId="local-editor" />
    </div>
  )
}
