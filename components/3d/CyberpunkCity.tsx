"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Suspense, useEffect, useState, useMemo } from "react"
import * as THREE from "three"
import City from "./City"

function Sky() {
  const [isDay, setIsDay] = useState(true)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  // Function to check if it's daytime in EST
  const checkDayTime = () => {
    const estTime = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    })
    const hour = new Date(estTime).getHours()
    return hour >= 6 && hour < 18 // Day time between 6 AM and 6 PM
  }

  useEffect(() => {
    const updateTime = () => {
      setIsDay(checkDayTime())
    }

    // Initial check
    updateTime()

    // Update every minute
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [checkDayTime]) // Added checkDayTime to dependencies

  // Load and manage textures
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader()
    const dayTexture = textureLoader.load(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sky_day.jpg-AZCgGc26AnTOCBcBy69hON86wwVakQ.jpeg",
    )
    const nightTexture = textureLoader.load(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sky_night.jpg-oP2bcwrBKu4EGW48hbrM0O5WnsYzmM.jpeg",
    )

    setTexture(isDay ? dayTexture : nightTexture)
  }, [isDay])

  const geometry = useMemo(() => new THREE.SphereGeometry(1000, 60, 40), [])
  const material = useMemo(() => {
    if (!texture) return null
    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
    })
  }, [texture])

  if (!material) return null

  return <mesh geometry={geometry} material={material} />
}

export default function CyberpunkCity() {
  const buildingCount = 100 // Fixed number of buildings

  return (
    <Canvas camera={{ position: [100, 100, 100], fov: 75 }}>
      <Suspense fallback={<LoadingFallback />}>
        <Sky />
        <City buildingCount={buildingCount} />
        <ambientLight intensity={0.1} />
        <pointLight position={[100, 100, 100]} intensity={0.5} />
        <pointLight position={[-100, 100, -100]} intensity={0.5} color="#66ffff" />
        <OrbitControls />
      </Suspense>
    </Canvas>
  )
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="white" />
    </mesh>
  )
}

