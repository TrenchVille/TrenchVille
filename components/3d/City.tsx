"use client"

import { useTexture } from "@react-three/drei"
import { useMemo, useState, useEffect } from "react"
import * as THREE from "three"
import { useProceduralBuildings } from "@/hooks/useProceduralBuildings"

interface BuildingProps {
  position: [number, number, number]
  width: number
  height: number
  depth: number
  textureSet?: number
}

const TEXTURE_SETS = {
  1: [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_01.jpg-k6WkGCAi1iYs7Oz4a1CZHVDWofZE3Q.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_01_rough.jpg-c7KXJZnY8PtBwIt1lBxYtlzE2V4eps.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_01_em.jpg-YIdqsDP7gynEpjEW7NxtVYZDN1binN.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_01_spec.jpg-dz8lXYJlKhGddb9Z9Wbs1f2YoSWz0h.jpeg",
  ],
  2: [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_02.jpg-lIps1KICtKPcpJdEBnNJjnGbi1Pe3u.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_02_rough.jpg-EvWgozMFdozW5SRN6G4HI8KXywsTs3.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_02_em.jpg-ykOHO5RUCecvYIEq1H4eR2chRPpgP7.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_02_spec.jpg-99uzHzK4hzLKUg8FkxmJNxt1KXoLah.jpeg",
  ],
  3: [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_03.jpg-H08rK1vc3j4kIo6z3K7ZqotpU5PTSd.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_03_rough.jpg-AV342bD9idcAN6nQorxy0pOk33OWti.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_03_em.jpg-1AB1nPO3j3WSG1VY29k8FaZM4C3vKp.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_03_spec.jpg-UTOkjLHxgfZG5AQCys0HU8tpROxgYJ.jpeg",
  ],
  4: [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_04.jpg-J7FS56sabmVIKJuNK7DHGkONPN864V.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_04_rough.jpg-2wEJRqpxgeO4bga7hreONGmR9MeMD4.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_04_em.jpg-3gsvImsNHKfS9rcA9H1GM01LrfjEhK.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_04_spec.jpg-g7RnSleDBSkO07GME0quA8qGpjUtVZ.jpeg",
  ],
  5: [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_05.jpg-aenPsYGWamoqO3uKkFJIJZDsITBVuG.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_05_rough.jpg-s9xGDsvstdgiAvY1jXbpcGgG9cxbMK.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_05_em.jpg-gD4mUeBqoDk9LrhLgYDa2S4ScuMAKT.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_05_spec.jpg-EILBwb8w7bwjyaTAGtiSxSOxuHbB99.jpeg",
  ],
  6: [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_06.jpg-cPEkGxyo0NylyDtNRfn6MQBZGCwTVd.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_06_rough.jpg-SIFZA12E6aLOopQF8O3puZAXn7mccj.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_06_em.jpg-ca8nZnVDmJcL4lH1HoF5h7mngyVQ7M.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_06_spec.jpg-mRY4YFyVCIsZ9KVHRRTuHu9uxp6xww.jpeg",
  ],
  7: [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_07.jpg-vRzKp7S6zdaMtjIep0Iiy3OMLsddic.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_07_rough.jpg-wG2cc4NKgbwTVAIeZXHLLDJRfn9vpU.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_07_em.jpg-IazasW1anv3uQYrdRUhAC5VzbDxWUk.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_07_spec.jpg-WFYkrei0s9vIMHWOsHZZfwdNzQxTnX.jpeg",
  ],
  8: [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_08.jpg-CWENiRAwfEzW0KeXCecIge7ZwjSKvC.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_08_rough.jpg-ENa1UkCXilsf6hRy517erASXoR3rM4.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_08_em.jpg-lTg7cRvbtvXIxGjbk87W8foH5ikFNA.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_08_spec.jpg-LitizUngKkta6dM0qYcYB54NYSnhN5.jpeg",
  ],
  9: [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_09.jpg-Z2zuvJxJppaefagoi6Wi7LrAYSmHBT.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_09_rough.jpg-MK7VG3kl5Gjunbj2vebMKM4iLURoeJ.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_09_em.jpg-saU7vtL17vJ2eeCQpoh7EkjKVoiu27.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_09_spec.jpg-QMmlGy1ROY2dqqtQLPtDF5EKtcGw9D.jpeg",
  ],
  10: [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_10.jpg-r6jDtwKEhA5z0rsF3lS6MlPJYO4Ohz.jpeg", // building_10.jpg
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_10_rough.jpg-P48FnhWfJP2QuYUpVugDW53ckCxSMp.jpeg", // building_10_rough.jpg
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_10_em.jpg-jgk2ULLbTjsykrZqJb3ZgVaDN5ot3n.jpeg", // building_10_em.jpg
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/building_10_spec.jpg-UdAudHpXNvOuZudfSiK7sxTVM5Vl4n.jpeg", // building_10_spec.jpg
  ],
}

const EMISSIVE_COLORS = {
  1: new THREE.Color(0x66ffff),
  2: new THREE.Color(0x66ffff),
  3: new THREE.Color(0x66ff99),
  4: new THREE.Color(0x33cccc),
  5: new THREE.Color(0x3366ff),
  6: new THREE.Color(0x0099ff),
  7: new THREE.Color(0x00ffff),
  8: new THREE.Color(0x4488ff),
  9: new THREE.Color(0x00ffee),
  10: new THREE.Color(0x33ff99), // Green-blue gradient color
}

const TEXTURE_SCALES = {
  1: 10,
  2: 10,
  3: 10,
  4: 5,
  5: 3,
  6: 2,
  7: 4,
  8: 3,
  9: 1,
  10: 3, // Scale for the industrial grate pattern
}

function Building({ position, width, height, depth, textureSet = 1 }: BuildingProps) {
  const [baseTexture, roughnessMap, emissiveMap, specularMap] = useTexture(
    TEXTURE_SETS[textureSet as keyof typeof TEXTURE_SETS],
  )

  const textures = useMemo(() => {
    const maps = [baseTexture, roughnessMap, emissiveMap, specularMap]
    maps.forEach((map) => {
      map.wrapS = map.wrapT = THREE.RepeatWrapping
      const repeatScale = TEXTURE_SCALES[textureSet as keyof typeof TEXTURE_SCALES]
      map.repeat.set(width / repeatScale, height / repeatScale)
    })
    return maps
  }, [baseTexture, roughnessMap, emissiveMap, specularMap, width, height, textureSet])

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: textures[0],
      roughnessMap: textures[1],
      emissiveMap: textures[2],
      emissive: EMISSIVE_COLORS[textureSet as keyof typeof EMISSIVE_COLORS],
      emissiveIntensity: textureSet === 1 ? 0.5 : textureSet === 10 ? 1.8 : 1.2, // Higher intensity for set 10
      metalness: 0.8,
      roughness: 0.5,
    })
  }, [textures, textureSet])

  const geometry = useMemo(() => new THREE.BoxGeometry(width, height, depth), [width, height, depth])

  return <mesh geometry={geometry} material={material} position={position} castShadow receiveShadow />
}

function Ground() {
  const [baseTexture, emissiveMap] = useTexture([
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ground.jpg-iM2tuckFuid3M8NDVVd7SgYXzvGtOS.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ground_em.jpg-oMYijlbgyMojVJ5zYgb2MDaVMcfxOg.jpeg",
  ])

  const material = useMemo(() => {
    baseTexture.wrapS = baseTexture.wrapT = THREE.RepeatWrapping
    emissiveMap.wrapS = emissiveMap.wrapT = THREE.RepeatWrapping
    baseTexture.repeat.set(10, 10)
    emissiveMap.repeat.set(10, 10)

    return new THREE.MeshStandardMaterial({
      map: baseTexture,
      emissiveMap: emissiveMap,
      emissive: new THREE.Color(0x66ffff),
      emissiveIntensity: 0.5,
      roughness: 0.7,
      metalness: 0.3,
    })
  }, [baseTexture, emissiveMap])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[300, 300]} />
      {material && <primitive object={material} attach="material" />}
    </mesh>
  )
}

interface CityProps {
  buildingCount: number
}

export default function City({ buildingCount }: CityProps) {
  const [isDay, setIsDay] = useState(true)

  // Function to check if it's daytime in EST
  const checkDayTime = () => {
    const estTime = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    })
    const hour = new Date(estTime).getHours()
    return hour >= 6 && hour < 18
  }

  useEffect(() => {
    const updateTime = () => {
      setIsDay(checkDayTime())
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [checkDayTime]) // Added checkDayTime to dependencies

  const buildings = useProceduralBuildings(buildingCount, 200)

  return (
    <>
      <fog attach="fog" args={[isDay ? "#ff9966" : "#000033", 100, 500]} />
      <ambientLight intensity={0.1} />
      <pointLight position={[100, 100, 100]} intensity={0.5} />
      <pointLight position={[-100, 100, -100]} intensity={0.5} color="#66ffff" />
      <Ground />
      {buildings.map((building, index) => (
        <Building key={index} {...building} textureSet={Math.floor(Math.random() * 10) + 1} />
      ))}
    </>
  )
}

