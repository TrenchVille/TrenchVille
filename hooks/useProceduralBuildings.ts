"use client"

import { useMemo } from "react"

export function useProceduralBuildings(count: number, areaSize: number) {
  return useMemo(() => {
    const gridSize = Math.ceil(Math.sqrt(count))
    const spacing = areaSize / gridSize

    return Array.from({ length: count }, (_, index) => {
      const row = Math.floor(index / gridSize)
      const col = index % gridSize

      const x = (col - gridSize / 2 + 0.5) * spacing
      const z = (row - gridSize / 2 + 0.5) * spacing

      const width = Math.random() * 5 + 5 // 5-10 units wide
      const height = Math.random() * 100 + 20 // 20-120 units tall
      const depth = Math.random() * 5 + 5 // 5-10 units deep

      return {
        position: [x, height / 2, z] as [number, number, number],
        width,
        height,
        depth,
      }
    })
  }, [count, areaSize])
}

