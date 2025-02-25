
"use client"

// Core imports
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils"

// React Three Fiber & Drei imports
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, useGLTF, useAnimations, Html, Sky, Stars } from "@react-three/drei"
import { EffectComposer, Bloom, ChromaticAberration, Noise } from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"

// Query imports
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"

// Constants
const TOTAL_SUPPLY = 1000000000
const ARROW_COLOR = {
  base: '#22c55e',     // Base green color
  emissive: '#4ade80', // Emissive green color
  intensity: 2,        // Base emission intensity
  metalness: 0.7,      // Material metalness
  roughness: 0.2       // Material roughness
}

// Helper function to get EST time
function getESTTime() {
  const now = new Date()
  const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  return {
    hours: est.getHours(),
    minutes: est.getMinutes(),
    seconds: est.getSeconds()
  }
}

// Helper function to format time
function formatTime(date: Date) {
  return date.toLocaleString('en-US', { 
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  })
}

// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

// Night sky component with rotating stars
function NightSky() {
  const starsRef1 = useRef()
  const starsRef2 = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (starsRef1.current) starsRef1.current.rotation.y = t * 0.05
    if (starsRef2.current) {
      starsRef2.current.rotation.y = -t * 0.03
      starsRef2.current.rotation.x = t * 0.02
    }
  })

  return (
    <>
      <Stars
        ref={starsRef1}
        radius={300}
        depth={50}
        count={3000}
        factor={6}
        saturation={0}
        fade
        speed={1}
      />
      <Stars
        ref={starsRef2}
        radius={250}
        depth={50}
        count={2000}
        factor={4}
        saturation={0}
        fade
        speed={1.5}
      />
    </>
  )
}

// Building lights configuration for night mode
function BuildingLights() {
  const lights = [
    { p: [10, 2, 10], c: "#ffb224", i: 1.5 },
    { p: [-10, 2, -10], c: "#fff4e6", i: 1.2 },
    { p: [15, 3, -5], c: "#ffd700", i: 1.5 },
    { p: [-8, 2, 15], c: "#ffe4b5", i: 1.3 },
    { p: [5, 2.5, -15], c: "#fff8dc", i: 1.2 },
    { p: [0, 4, 0], c: "#4444ff", i: 0.3 },
    { p: [-15, 2, 5], c: "#ffb224", i: 1.2 },
    { p: [12, 2, 8], c: "#fff4e6", i: 1.3 },
    { p: [8, 1.5, 12], c: "#ffd700", i: 0.8 },
    { p: [-12, 1.5, -8], c: "#ffe4b5", i: 0.8 },
  ]

  return (
    <group>
      {lights.map((l, i) => (
        <group key={i}>
          <pointLight
            position={l.p}
            color={l.c}
            intensity={l.i}
            distance={15}
            decay={2.2}
          />
        </group>
      ))}
    </group>
  )
}

// Moon component with craters and glow effect
function Moon() {
  const moonRef = useRef()
  const moonGlowRef = useRef()
  const craterRefs = useRef([])
  
  // Crater configurations: [x, y, z, size, depth]
  const craters = [
    [0.3, 0.2, 0.48, 0.15, 0.02],
    [-0.2, 0.4, 0.45, 0.12, 0.015],
    [0.1, -0.3, 0.47, 0.18, 0.025],
    [-0.4, -0.1, 0.44, 0.14, 0.018],
    [0.4, 0.3, 0.46, 0.11, 0.016],
    [-0.15, -0.25, 0.45, 0.13, 0.02],
    [0.25, -0.15, 0.47, 0.09, 0.014],
    [-0.3, 0.15, 0.46, 0.16, 0.022],
    [0.15, 0.35, 0.45, 0.10, 0.015],
    [-0.25, -0.35, 0.44, 0.12, 0.017]
  ]

  // Initialize moon texture and material
  useEffect(() => {
    if (moonRef.current) {
      moonRef.current.material = new THREE.MeshStandardMaterial({
        color: "#C2C5CC",
        roughness: 0.9,
        metalness: 0.1,
        bumpScale: 0.02,
      })

      // Create procedural moon texture
      const canvas = document.createElement('canvas')
      canvas.width = 1024
      canvas.height = 1024
      const ctx = canvas.getContext('2d')
      
      ctx.fillStyle = '#C2C5CC'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add random crater-like details
      for (let i = 0; i < 10000; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const radius = Math.random() * 2 + 0.5
        const alpha = Math.random() * 0.1 + 0.1
        
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(80, 80, 80, ${alpha})`
        ctx.fill()
      }

      const texture = new THREE.CanvasTexture(canvas)
      moonRef.current.material.map = texture
      texture.needsUpdate = true
    }
  }, [])

  // Animate moon and craters
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    
    if (moonRef.current) {
      moonRef.current.rotation.y = t * 0.05
    }
    
    if (moonGlowRef.current) {
      const glowScale = 1 + Math.sin(t * 0.5) * 0.03
      moonGlowRef.current.scale.set(glowScale, glowScale, glowScale)
    }

    craterRefs.current.forEach((crater, i) => {
      if (crater) {
        crater.scale.y = 1 + Math.sin(t * 0.5 + i) * 0.02
      }
    })
  })

  return (
    <group>
      <mesh ref={moonRef}>
        <sphereGeometry args={[8, 64, 64]} />
        <meshStandardMaterial
          color="#C2C5CC"
          transparent={true}
          opacity={1}
        />
      </mesh>

      {craters.map((crater, index) => (
        <mesh
          key={index}
          ref={el => craterRefs.current[index] = el}
          position={[crater[0] * 8, crater[1] * 8, crater[2] * 8]}
        >
          <sphereGeometry args={[crater[3] * 8, 32, 32]} />
          <meshStandardMaterial
            color="#A1A4AB"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      ))}

      <mesh ref={moonGlowRef}>
        <sphereGeometry args={[8.4, 32, 32]} />
        <meshBasicMaterial
          color="#C2C5CC"
          transparent={true}
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

// Sun component with day/night transition
function Sun({ isNight }) {
  const sunRef = useRef()
  const sunGlowRef = useRef()
  const moonGroupRef = useRef()
  const [transitionProgress, setTransitionProgress] = useState(isNight ? 1 : 0)

  // Handle day/night transition
  useEffect(() => {
    const targetProgress = isNight ? 1 : 0
    const startProgress = transitionProgress
    const startTime = Date.now()

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      const progress = Math.min(elapsed / 2, 1)
      
      const newProgress = startProgress + (targetProgress - startProgress) * progress
      setTransitionProgress(newProgress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [isNight])

  // Animate sun and moon positions
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    
    if (sunRef.current) {
      sunRef.current.rotation.z = t * 0.2
    }

    const angle = (Math.PI * transitionProgress) + Math.PI / 2
    const radius = 50
    const heightOffset = 25
    const sunX = radius * Math.cos(angle)
    const sunY = radius * Math.sin(angle) + heightOffset
    const moonX = radius * Math.cos(angle + Math.PI)
    const moonY = radius * Math.sin(angle + Math.PI) + heightOffset

    const sunOpacity = Math.max(0, Math.min(1, (sunY + 25) / 50))
    const moonOpacity = Math.max(0, Math.min(1, (moonY + 25) / 50))

    // Update sun position and visibility
    if (sunRef.current) {
      sunRef.current.position.x = sunX
      sunRef.current.position.y = sunY
      sunRef.current.material.opacity = sunOpacity
      sunRef.current.visible = sunOpacity > 0.01
    }

    // Update moon position and visibility
    if (moonGroupRef.current) {
      moonGroupRef.current.position.x = moonX
      moonGroupRef.current.position.y = moonY
      moonGroupRef.current.visible = moonOpacity > 0.01
    }

    // Update sun glow effect
    if (sunGlowRef.current) {
      const glowScale = 1 + Math.sin(t) * 0.05
      sunGlowRef.current.scale.set(glowScale, glowScale, 1)
      sunGlowRef.current.position.x = sunX
      sunGlowRef.current.position.y = sunY
      sunGlowRef.current.material.opacity = 0.4 * sunOpacity
      sunGlowRef.current.visible = sunOpacity > 0.01
    }
  })

  return (
    <group position={[0, 0, -50]}>
      <mesh ref={sunRef}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial 
          color="#FDB813" 
          transparent={true}
          opacity={1}
        />
      </mesh>
      <mesh ref={sunGlowRef}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial
          color="#FDB813"
          transparent={true}
          opacity={0.4}
          side={THREE.BackSide}
        />
      </mesh>

      <group ref={moonGroupRef}>
        <Moon />
      </group>
    </group>
  )
}

// Selection arrow component that appears above selected characters
function SelectionArrow({ position }) {
  const ref = useRef()
  const { scene } = useGLTF("/textures/arrow.glb")

  useEffect(() => {
    if (ref.current) {
      const fixedScale = 2.5

      scene.scale.set(fixedScale, fixedScale, fixedScale)
      scene.rotation.set(0, 0, -Math.PI/2)

      // Apply consistent green material to all arrow meshes
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: ARROW_COLOR.base,
            emissive: ARROW_COLOR.emissive,
            emissiveIntensity: ARROW_COLOR.intensity,
            metalness: ARROW_COLOR.metalness,
            roughness: ARROW_COLOR.roughness,
            toneMapped: false
          })
        }
      })
    }
  }, [scene])

  useFrame((state) => {
    if (ref.current) {
      // Rotate and bob the arrow
      ref.current.rotation.y += 0.02
      ref.current.position.y = position[1] + 8 + Math.sin(Date.now() * 0.003) * 0.5

      // Pulse the emission intensity
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.emissiveIntensity = ARROW_COLOR.intensity * (0.75 + Math.sin(state.clock.elapsedTime * 2) * 0.25)
        }
      })
    }
  })

  return (
    <>
      <group 
        ref={ref} 
        position={[position[0], position[1] + 8, position[2]]}
      >
        <primitive object={scene.clone()} />
      </group>
      <pointLight
        position={[position[0], position[1] + 8, position[2]]}
        color={ARROW_COLOR.emissive}
        intensity={ARROW_COLOR.intensity}
        distance={10}
      />
    </>
  )
}

// Information card that displays holder details
function CitizenInfoCard({ holder, position, onClose }) {
  const [show, setShow] = useState(false)

  useEffect(() => setShow(true), [])

  if (!holder) return null

  const amount = holder.amount / Math.pow(10, holder.decimals)

  return (
    <Html
      position={position}
      center
      distanceFactor={10}
      occlude={false}
      zIndexRange={[16777271, 0]}
      style={{
        pointerEvents: 'auto',
        transition: 'all 0.2s',
        opacity: show ? 1 : 0,
        transform: `translateY(-50px)`,
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.8)",
          padding: "12px",
          borderRadius: "8px",
          color: "white",
          width: "300px",
          fontSize: "14px",
          backdropFilter: "blur(4px)",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          position: 'relative',
          pointerEvents: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={e => {
            e.stopPropagation()
            onClose()
          }}
          style={{
            position: "absolute",
            right: "8px",
            top: "8px",
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ×
        </button>
        <div style={{ marginBottom: "8px", fontWeight: "bold", color: "#3b82f6" }}>
          🧑‍🦱 Citizen Information
        </div>
        <div style={{ marginBottom: "4px" }}>
          <span style={{ color: "#10b981", fontWeight: "bold" }}>👛 Wallet: </span>
          <span style={{ color: "#6366f1" }}>
            {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
          </span>
        </div>
        <div style={{ marginBottom: "4px" }}>
          <span style={{ color: "#f59e0b", fontWeight: "bold" }}>💰 Amount: </span>
          <span style={{ color: "#6366f1" }}>{amount.toLocaleString()} tokens</span>
        </div>
        <div style={{ marginBottom: "4px" }}>
          <span style={{ color: "#ec4899", fontWeight: "bold" }}>📊 Percentage: </span>
          <span style={{ color: "#6366f1" }}>{holder.percentage}%</span>
        </div>
        <div>
          <span style={{ color: "#8b5cf6", fontWeight: "bold" }}>🏆 Rank: </span>
          <span style={{ color: "#6366f1" }}>#{holder.rank}</span>
        </div>
        <a
          href={`https://solscan.io/account/${holder.address}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            marginTop: "8px",
            color: "#3b82f6",
            textDecoration: "none",
            fontSize: "12px",
          }}
        >
          View on Solscan ↗
        </a>
      </div>
    </Html>
  )
}

// 3D map model with dynamic lighting
function MapModel() {
  const groupRef = useRef()
  const { scene } = useGLTF("/models/Map.glb")
  const [isNightMode, setIsNightMode] = useState(false)

  useEffect(() => {
    if (!groupRef.current) return

    scene.scale.set(0.3, 0.3, 0.3)
    scene.position.set(0, -2, 0)

    // Process materials for windows and light posts
    scene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        const isWindow = (child.name.toLowerCase().includes('window') ||
          child.name.toLowerCase().includes('glass') ||
          (child.material && child.material.name &&
            (child.material.name.toLowerCase().includes('window') ||
              child.material.name.toLowerCase().includes('glass')))) &&
          !child.name.toLowerCase().includes('car') &&
          !child.parent?.name.toLowerCase().includes('car') &&
          !child.parent?.parent?.name.toLowerCase().includes('car')

        const isLightPost = child.name.toLowerCase().includes('lamppost') ||
          child.name.toLowerCase().includes('streetlight') ||
          child.parent?.name.toLowerCase().includes('lamppost') ||
          child.parent?.name.toLowerCase().includes('streetlight')

        if (isWindow) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#ffffff',
            emissive: '#ffb224',
            emissiveIntensity: 0,
            transparent: true,
            opacity: 0.9,
          })
          child.userData.windowMaterial = child.material
        }

        if (isLightPost) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#ffffff',
            emissive: '#ffb224',
            emissiveIntensity: 0,
            metalness: 0.8,
            roughness: 0.2,
          })
          child.userData.lightPostMaterial = child.material
        }
      }
    })

    groupRef.current.add(scene)

    return () => {
      scene.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (child.material) child.material.dispose()
        }
      })
    }
  }, [scene])

  // Update materials based on night mode
  useEffect(() => {
    scene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        if (child.userData.windowMaterial) {
          child.userData.windowMaterial.emissiveIntensity = isNightMode ? 0.5 : 0
        }
        if (child.userData.lightPostMaterial) {
          child.userData.lightPostMaterial.emissiveIntensity = isNightMode ? 1 : 0
        }
      }
    })
  }, [isNightMode, scene])

  // Listen for night mode changes
  useEffect(() => {
    const handleNightModeChange = e => {
      if (e.detail) setIsNightMode(e.detail.isNight)
    }

    window.addEventListener('nightModeChange', handleNightModeChange)
    return () => window.removeEventListener('nightModeChange', handleNightModeChange)
  }, [])

  return <group ref={groupRef} />
}

// Sidewalk spawn area for characters
function SidewalkSpawnArea() {
  const groupRef = useRef()
  const { scene } = useGLTF("/models/SidewalkSpawn.glb")
  const boundsRef = useRef(null)

  useEffect(() => {
    if (!groupRef.current) return

    scene.scale.set(0.3, 0.3, 0.3)
    scene.position.set(0, -2, 0)

    boundsRef.current = new THREE.Box3().setFromObject(scene)

    // Make spawn area invisible but keep collision
    scene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 0,
          wireframe: true,
          visible: false,
        })
        child.visible = true
      }
    })

    groupRef.current.add(scene)

    return () => {
      scene.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (child.material) child.material.dispose()
        }
      })
    }
  }, [scene])

  return <group ref={groupRef} />
}

// Keyboard controls hook for camera movement
function useKeyboardControls() {
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  })

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key.toLowerCase() in keys.current) {
        keys.current[e.key.toLowerCase()] = true
      }
    }

    const handleKeyUp = e => {
      if (e.key.toLowerCase() in keys.current) {
        keys.current[e.key.toLowerCase()] = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return keys
}

// Main scene component
function Scene() {
  const { camera, scene, gl } = useThree()
  const controlsRef = useRef()
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [currentTime, setCurrentTime] = useState(getESTTime())
  const [isNight, setIsNight] = useState(() => {
    const estTime = getESTTime()
    return estTime.minutes >= 40
  })
  const keys = useKeyboardControls()
  const moveSpeed = 0.2
  const spawnAreaRef = useRef(null)
  const canvasRef = useRef({ width: 0, height: 0 })
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const characterModels = useRef([])
  const totalCharacters = 94

  // Update time and day/night cycle
  useEffect(() => {
    const interval = setInterval(() => {
      const estTime = getESTTime()
      setCurrentTime(estTime)
      // Set to night if we're in the last 20 minutes of the hour
      setIsNight(estTime.minutes >= 40)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('nightModeChange', { detail: { isNight } }))
  }, [isNight])

  // Load character models
  for (let i = 1; i <= totalCharacters; i++) {
    const model = useGLTF(`/models/character${i}.glb`)
    characterModels.current.push({
      scene: model.scene,
      animations: model.animations,
    })
  }

  const { scene: sidewalkScene } = useGLTF("/models/SidewalkSpawn.glb")
  const mixersRef = useRef([])
  const clonedModelsRef = useRef([])

  // Fetch holders data
  const { data: holdersData, isLoading, error } = useQuery({
    queryKey: ['holders'],
    queryFn: async () => {
      const response = await fetch('/api/holders')
      if (!response.ok) throw new Error('Failed to fetch holders')
      return await response.json()
    },
  })

  // Handle canvas resize
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = gl.domElement
      canvasRef.current = {
        width: canvas.clientWidth,
        height: canvas.clientHeight,
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [gl])

  // Handle character selection
  useEffect(() => {
    const handleClick = event => {
      const canvas = gl.domElement
      const rect = canvas.getBoundingClientRect()

      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(clonedModelsRef.current, true)

      if (intersects.length > 0) {
        let targetObject = intersects[0].object
        while (targetObject && !targetObject.userData?.holderData) {
          targetObject = targetObject.parent
        }

        if (targetObject?.userData?.holderData) {
          const worldPosition = new THREE.Vector3()
          targetObject.getWorldPosition(worldPosition)

          handleCharacterSelect({
            cloneIndex: targetObject.userData.cloneIndex,
            holderData: targetObject.userData.holderData,
            position: [worldPosition.x, worldPosition.y + 3, worldPosition.z],
          })
        }
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [camera, gl])

  // Get random position for character spawning
  const getRandomPosition = () => {
    if (!sidewalkScene) return [0, -2, 0]

    const box = new THREE.Box3().setFromObject(sidewalkScene)

    for (let attempts = 0; attempts < 100; attempts++) {
      const x = THREE.MathUtils.randFloat(box.min.x, box.max.x)
      const z = THREE.MathUtils.randFloat(box.min.z, box.max.z)

      const raycaster = new THREE.Raycaster()
      const position = new THREE.Vector3(x, box.max.y + 1, z)
      raycaster.set(position, new THREE.Vector3(0, -1, 0))

      let isValidSpawn = false

      sidewalkScene.traverse(child => {
        if (child instanceof THREE.Mesh) {
          const intersects = raycaster.intersectObject(child)
          if (intersects.length > 0) isValidSpawn = true
        }
      })

      if (isValidSpawn) return [x, -2, z]
    }

    return [0, -2, 0]
  }

  // Handle character selection
  const handleCharacterSelect = characterData => {
    setSelectedCharacter(prev => {
      const isDeselecting = prev?.cloneIndex === characterData.cloneIndex

      if (isDeselecting) return null

      const amount = characterData.holderData.amount / Math.pow(10, 6)
      const percentage = ((amount / TOTAL_SUPPLY) * 100).toFixed(2)

      return {
        ...characterData,
        holderData: {
          ...characterData.holderData,
          decimals: 6,
          totalSupply: TOTAL_SUPPLY,
          percentage: percentage,
        },
      }
    })
  }

  // Initialize and update characters
  useEffect(() => {
    if (!holdersData?.data?.items || !sidewalkScene) return

    camera.position.set(15, 15, 25)
    camera.lookAt(0, 0, 10)

    // Cleanup previous models
    clonedModelsRef.current.forEach(model => {
      scene.remove(model)
      model.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (child.material) child.material.dispose()
        }
      })
    })

    mixersRef.current.forEach(mixer => mixer.stopAllAction())
    mixersRef.current = []
    clonedModelsRef.current = []

    // Create new models
    holdersData.data.items.forEach((holder, i) => {
      const randomModelIndex = Math.floor(Math.random() * totalCharacters)
      const selectedModel = characterModels.current[randomModelIndex]
      const clonedModel = SkeletonUtils.clone(selectedModel.scene)
      const position = getRandomPosition()
      const rotation = [0, Math.random() * Math.PI * 2, 0]

      clonedModel.position.set(...position)
      clonedModel.rotation.set(...rotation)
      clonedModel.scale.set(0.3, 0.3, 0.3)

      clonedModel.userData = {
        isClone: true,
        cloneIndex: i,
        characterType: randomModelIndex + 1,
        holderData: holder,
        position: position,
      }

      clonedModel.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.userData = clonedModel.userData
          child.layers.enable(0)
        }
      })

      const mixer = new THREE.AnimationMixer(clonedModel)
      if (selectedModel.animations.length > 0) {
        selectedModel.animations.forEach(clip => {
          const action = mixer.clipAction(clip)
          action.play()
        })
      }

      mixersRef.current.push(mixer)
      clonedModelsRef.current.push(clonedModel)
      scene.add(clonedModel)
    })

    return () => {
      mixersRef.current.forEach(mixer => mixer.stopAllAction())
      clonedModelsRef.current.forEach(model => {
        scene.remove(model)
        model.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            if (child.material) child.material.dispose()
          }
        })
      })
      mixersRef.current = []
      clonedModelsRef.current = []
    }
  }, [scene, camera, holdersData, sidewalkScene])

  // Handle camera movement and animations
  useFrame((state, delta) => {
    mixersRef.current.forEach(mixer => mixer.update(delta))

    if (!camera) return

    const movement = new THREE.Vector3(0, 0, 0)
    const forward = new THREE.Vector3()
    const right = new THREE.Vector3()

    camera.getWorldDirection(forward)
    right.set(-forward.z, 0, forward.x).normalize()

    forward.y = 0
    forward.normalize()

    if (keys.current.w) movement.add(forward.multiplyScalar(moveSpeed))
    if (keys.current.s) movement.sub(forward.multiplyScalar(moveSpeed))
    if (keys.current.d) movement.add(right.multiplyScalar(moveSpeed))
    if (keys.current.a) movement.sub(right.multiplyScalar(moveSpeed))

    if (movement.length() > 0) {
      camera.position.add(movement)
      if (controlsRef.current) controlsRef.current.target.add(movement)
    }
  })

  if (isLoading) return null
  if (error) {
    console.error('Error loading holders:', error)
    return null
  }

  return (
    <>
      

      {isNight ? (
        <>
          <color attach="background" args={["#001429"]} />
          <NightSky />
          <fog attach="fog" args={["#001429", 100, 500]} />
          <ambientLight intensity={0.1} color="#4444ff" />
          <directionalLight
            intensity={0.3}
            position={[10, 20, 20]}
            color="#4444ff"
            castShadow
          />
          <pointLight position={[-50, 50, -50]} intensity={0.3} color="#ffffff" />
          <BuildingLights />
        </>
      ) : (
        <>
          <Sky
            distance={450000}
            sunPosition={[50, 50, -50]}
            inclination={0.5}
            azimuth={0.25}
            mieCoefficient={0.001}
            mieDirectionalG={0.99}
            rayleigh={0.2}
            turbidity={10}
          />
          <fog attach="fog" args={["#b1e1ff", 100, 500]} />
          <ambientLight intensity={0.4} />
          <directionalLight
            intensity={1.5}
            position={[10, 20, 20]}
            castShadow
          />
        </>
      )}

      <Sun isNight={isNight} />
      <MapModel />
      <SidewalkSpawnArea />
      {clonedModelsRef.current.map((model, index) => (
        <group key={index}>
          <primitive
            object={model}
            onPointerOver={e => {
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={e => {
              document.body.style.cursor = 'auto'
            }}
          />
          {selectedCharacter?.cloneIndex === index && (
            <>
              <SelectionArrow position={selectedCharacter.position} />
              <CitizenInfoCard
                holder={selectedCharacter.holderData}
                position={selectedCharacter.position}
                onClose={() => setSelectedCharacter(null)}
              />
            </>
          )}
        </group>
      ))}
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        zoomSpeed={4}
        panSpeed={0.5}
        rotateSpeed={0.5}
        minDistance={1}
        maxDistance={200}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0, 10]}
      />
      <EffectComposer>
        <Bloom
          intensity={isNight ? 0.7 : 0.3}
          luminanceThreshold={isNight ? 0.5 : 1.2}
          luminanceSmoothing={0.4}
          mipmapBlur={false}
        />
        <ChromaticAberration
          offset={[0.001, 0.001]}
          blendFunction={BlendFunction.NORMAL}
          radialModulation={true}
        />
        <Noise
          opacity={isNight ? 0.07 : 0.02}
          blendFunction={BlendFunction.OVERLAY}
          premultiply
        />
      </EffectComposer>
    </>
  )
}

// Canvas content wrapper
function MapSceneContent() {
  return (
    <Canvas shadows>
      <Scene />
      <PerspectiveCamera
        makeDefault
        fov={70}
        position={[20, 20, 30]}
        near={0.1}
        far={1000}
      />
    </Canvas>
  )
}

// Main component export
export default function MapScene() {
  return (
    <QueryClientProvider client={queryClient}>
      <MapSceneContent />
    </QueryClientProvider>
  )
}

// Preload models
for (let i = 1; i <= 94; i++) {
  useGLTF.preload(`/models/character${i}.glb`)
}
useGLTF.preload("/models/Map.glb")
useGLTF.preload("/models/SidewalkSpawn.glb")
useGLTF.preload("/textures/arrow.glb")