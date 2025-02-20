"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, useGLTF, useAnimations, Html, Sky, Stars } from "@react-three/drei"
import { EffectComposer, Bloom, ChromaticAberration, Noise } from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils"
import { useQuery } from "@tanstack/react-query"

const TOTAL_SUPPLY = 1000000000

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

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

function BuildingLights() {
  const lights = [
    { p: [10, 5, 10], c: "#ffb224", i: 2 },
    { p: [-10, 8, -10], c: "#fff4e6", i: 1.5 },
    { p: [15, 12, -5], c: "#ffd700", i: 2 },
    { p: [-8, 6, 15], c: "#ffe4b5", i: 1.8 },
    { p: [5, 10, -15], c: "#fff8dc", i: 1.7 },
    { p: [0, 15, 0], c: "#4444ff", i: 0.5 },
    { p: [-15, 8, 5], c: "#ffb224", i: 1.5 },
    { p: [12, 6, 8], c: "#fff4e6", i: 1.8 },
    { p: [8, 2, 12], c: "#ffd700", i: 1 },
    { p: [-12, 2, -8], c: "#ffe4b5", i: 1 },
  ]

  return (
    <group>
      {lights.map((l, i) => (
        <group key={i}>
          <pointLight
            position={l.p}
            color={l.c}
            intensity={l.i}
            distance={20}
            decay={2}
          />
          <mesh position={l.p}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color={l.c} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Sun({ isNight }) {
  const sunRef = useRef()
  const glowRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (sunRef.current) sunRef.current.rotation.z = t * 0.2
    if (glowRef.current) {
      glowRef.current.scale.set(
        1 + Math.sin(t) * 0.05,
        1 + Math.sin(t) * 0.05,
        1
      )
    }
  })

  const c = isNight ? "#C2C5CC" : "#FDB813"
  const p = isNight ? [-50, 50, -50] : [50, 50, -50]
  const s = isNight ? 8 : 10

  return (
    <group position={p}>
      <mesh ref={sunRef}>
        <sphereGeometry args={[s, 32, 32]} />
        <meshBasicMaterial color={c} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[s + 2, 32, 32]} />
        <meshBasicMaterial
          color={c}
          transparent
          opacity={0.4}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

function SelectionArrow({ position }) {
  const ref = useRef()

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.02
  })

  return (
    <group ref={ref} position={[position[0], position[1] + 2, position[2]]}>
      <mesh position={[0, -0.3, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.15, 0.3, 32]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
    </group>
  )
}

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

function MapModel() {
  const groupRef = useRef()
  const { scene } = useGLTF("/models/Map.glb")
  const [isNightMode, setIsNightMode] = useState(false)

  useEffect(() => {
    if (!groupRef.current) return

    scene.scale.set(0.3, 0.3, 0.3)
    scene.position.set(0, -2, 0)

    scene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        const isWindow = child.name.toLowerCase().includes('window') ||
          child.name.toLowerCase().includes('glass') ||
          (child.material && child.material.name &&
            (child.material.name.toLowerCase().includes('window') ||
              child.material.name.toLowerCase().includes('glass')))

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

  useEffect(() => {
    scene.traverse(child => {
      if (child instanceof THREE.Mesh && child.userData.windowMaterial) {
        child.userData.windowMaterial.emissiveIntensity = isNightMode ? 0.5 : 0
      }
    })
  }, [isNightMode, scene])

  useEffect(() => {
    const handleNightModeChange = e => {
      if (e.detail) setIsNightMode(e.detail.isNight)
    }

    window.addEventListener('nightModeChange', handleNightModeChange)
    return () => window.removeEventListener('nightModeChange', handleNightModeChange)
  }, [])

  return <group ref={groupRef} />
}

function SidewalkSpawnArea() {
  const groupRef = useRef()
  const { scene } = useGLTF("/models/SidewalkSpawn.glb")
  const boundsRef = useRef(null)

  useEffect(() => {
    if (!groupRef.current) return

    scene.scale.set(0.3, 0.3, 0.3)
    scene.position.set(0, -2, 0)

    boundsRef.current = new THREE.Box3().setFromObject(scene)

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

function Scene() {
  const { camera, scene, gl } = useThree()
  const controlsRef = useRef()
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [isNight, setIsNight] = useState(false)
  const keys = useKeyboardControls()
  const moveSpeed = 0.2
  const spawnAreaRef = useRef(null)
  const canvasRef = useRef({ width: 0, height: 0 })
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const characterModels = useRef([])
  const totalCharacters = 94

  useEffect(() => {
    const interval = setInterval(() => setIsNight(prev => !prev), 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('nightModeChange', { detail: { isNight } }))
  }, [isNight])

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

  const { data: holdersData, isLoading, error } = useQuery({
    queryKey: ['holders'],
    queryFn: async () => {
      const response = await fetch('/api/holders')
      if (!response.ok) throw new Error('Failed to fetch holders')
      return await response.json()
    },
  })

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

  useEffect(() => {
    if (!holdersData?.data?.items || !sidewalkScene) return

    camera.position.set(15, 15, 25)
    camera.lookAt(0, 0, 10)

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
