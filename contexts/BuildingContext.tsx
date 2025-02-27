"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface BuildingContextType {
  buildingCount: number
  setBuildingCount: (count: number) => void
}

const BuildingContext = createContext<BuildingContextType | undefined>(undefined)

export function BuildingProvider({ children }: { children: React.ReactNode }) {
  const [buildingCount, setBuildingCount] = useState(1) // Changed to 10 buildings

  return <BuildingContext.Provider value={{ buildingCount, setBuildingCount }}>{children}</BuildingContext.Provider>
}

export function useBuildingContext() {
  const context = useContext(BuildingContext)
  if (context === undefined) {
    throw new Error("useBuildingContext must be used within a BuildingProvider")
  }
  return context
}
