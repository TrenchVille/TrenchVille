"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, useGLTF, useAnimations } from "@react-three/drei"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils"
import { useQuery } from "@tanstack/react-query"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

function useKeyboardControls() {
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() in keys.current) {
        keys.current[e.key.toLowerCase() as keyof typeof keys.current] = true
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() in keys.current) {
        keys.current[e.key.toLowerCase() as keyof typeof keys.current] = false
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

  useEffect(() => {
    if (!groupRef.current) return

    scene.scale.set(0.3, 0.3, 0.3)
    scene.position.set(0, -2, 0)

    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())

    groupRef.current.add(scene)

    return () => {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (child.material) {
            child.material.dispose()
          }
        }
      })
    }
  }, [scene])

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
    const center = boundsRef.current.getCenter(new THREE.Vector3())

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 0,
          wireframe: true,
          visible: false
        })
        child.visible = true
      }
    })

    groupRef.current.add(scene)

    return () => {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (child.material) {
            child.material.dispose()
          }
        }
      })
    }
  }, [scene])

  return <group ref={groupRef} />
}

function Scene() {
  const { camera, scene } = useThree()
  const controlsRef = useRef()
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const keys = useKeyboardControls()
  const moveSpeed = 0.2
  const spawnAreaRef = useRef(null)
  
  const character1b = useGLTF("/models/character1b.glb")
  const character2 = useGLTF("/models/character2.glb")
  const character3 = useGLTF("/models/character3.glb")
  const { scene: sidewalkScene } = useGLTF("/models/SidewalkSpawn.glb")
  
  const characterModels = [
    { scene: character1b.scene, animations: character1b.animations },
    { scene: character2.scene, animations: character2.animations },
    { scene: character3.scene, animations: character3.animations }
  ]

  const mixersRef = useRef([])
  const clonedModelsRef = useRef([])

  const { data: holdersData, isLoading, error } = useQuery({
    queryKey: ['holders'],
    queryFn: async () => {
      const response = await fetch('/api/holders')
      if (!response.ok) {
        throw new Error('Failed to fetch holders')
      }
      const data = await response.json()
      console.log('Holders data:', data)
      return data
    }
  })

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
      
      sidewalkScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const intersects = raycaster.intersectObject(child)
          if (intersects.length > 0) {
            isValidSpawn = true
          }
        }
      })
      
      if (isValidSpawn) {
        return [x, -2, z]
      }
    }
    
    return [0, -2, 0]
  }

  const handleCharacterSelect = (characterData) => {
    setSelectedCharacter((prev) => prev?.cloneIndex === characterData.cloneIndex ? null : characterData)
    
    const holder = characterData.holderData
    const totalSupply = holdersData?.data?.items?.reduce((acc, h) => 
      acc + h.amount / Math.pow(10, h.decimals), 0
    ) || 0
    
    const amount = holder.amount / Math.pow(10, holder.decimals)
    const percentage = totalSupply > 0 ? (amount / totalSupply * 100).toFixed(2) : '0'
    
    console.log('%c🧑‍🦱 Citizen Information', 'font-size: 14px; font-weight: bold; color: #3b82f6;')
    console.log(
      '%c👛 Wallet: %c' + holder.address,
      'font-weight: bold; color: #10b981;',
      'color: #6366f1; text-decoration: underline;'
    )
    console.log(
      '%c💰 Amount: %c' + amount.toLocaleString() + ' tokens',
      'font-weight: bold; color: #f59e0b;',
      'color: #6366f1;'
    )
    console.log(
      '%c📊 Percentage: %c' + percentage + '%',
      'font-weight: bold; color: #ec4899;',
      'color: #6366f1;'
    )
    console.log(
      '%c🏆 Rank: %c#' + holder.rank,
      'font-weight: bold; color: #8b5cf6;',
      'color: #6366f1;'
    )
    console.log('\n')
    console.log(
      '%cView on Solscan: %c➜ https://solscan.io/account/' + holder.address,
      'font-weight: bold;',
      'color: #3b82f6; text-decoration: underline; cursor: pointer;'
    )
  }

  useEffect(() => {
    if (!holdersData?.data?.items || !sidewalkScene) return

    camera.position.set(15, 15, 25)
    camera.lookAt(0, 0, 10)

    clonedModelsRef.current.forEach(model => {
      scene.remove(model)
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (child.material) {
            child.material.dispose()
          }
        }
      })
    })
    mixersRef.current.forEach(mixer => mixer.stopAllAction())
    mixersRef.current = []
    clonedModelsRef.current = []

    holdersData.data.items.forEach((holder, i) => {
      const randomModelIndex = Math.floor(Math.random() * characterModels.length)
      const selectedModel = characterModels[randomModelIndex]

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
        holderData: {
          address: holder.address,
          amount: holder.amount,
          decimals: 6,
          rank: holder.rank
        }
      }

      clonedModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.userData = {
            ...clonedModel.userData,
            clickable: true
          }
        }
      })

      const mixer = new THREE.AnimationMixer(clonedModel)
      selectedModel.animations.forEach((clip) => {
        const action = mixer.clipAction(clip)
        action.play()
      })
      mixersRef.current.push(mixer)
      clonedModelsRef.current.push(clonedModel)

      scene.add(clonedModel)
    })

    return () => {
      mixersRef.current.forEach(mixer => mixer.stopAllAction())
      clonedModelsRef.current.forEach(model => {
        scene.remove(model)
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            if (child.material) {
              child.material.dispose()
            }
          }
        })
      })
      mixersRef.current = []
      clonedModelsRef.current = []
    }
  }, [character1b, character2, character3, scene, camera, holdersData, sidewalkScene])

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
      if (controlsRef.current) {
        controlsRef.current.target.add(movement)
      }
    }
  })

  if (isLoading) {
    return null
  }

  if (error) {
    console.error('Error loading holders:', error)
    return null
  }

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight 
        intensity={1.5}
        position={[10, 20, 20]}
        castShadow
      />
      <MapModel />
      <SidewalkSpawnArea />
      {clonedModelsRef.current.map((model, index) => (
        <primitive 
          key={index}
          object={model}
          onClick={(e) => {
            e.stopPropagation()
            let targetObject = e.object
            while (targetObject && !targetObject.userData?.holderData) {
              targetObject = targetObject.parent
            }

            if (targetObject?.userData?.holderData) {
              console.log('Clicked on citizen:', targetObject.userData.holderData)
              handleCharacterSelect({
                cloneIndex: targetObject.userData.cloneIndex,
                holderData: targetObject.userData.holderData
              })
            }
          }}
          onPointerOver={(e) => {
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={(e) => {
            document.body.style.cursor = 'auto'
          }}
        />
      ))}
      <OrbitControls 
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        zoomSpeed={0.5}
        panSpeed={0.5}
        rotateSpeed={0.5}
        minDistance={1}
        maxDistance={200}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0, 10]}
      />
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

useGLTF.preload("/models/Map.glb")
useGLTF.preload("/models/SidewalkSpawn.glb")
useGLTF.preload("/models/character1b.glb")
useGLTF.preload("/models/character2.glb")
useGLTF.preload("/models/character3.glb")
