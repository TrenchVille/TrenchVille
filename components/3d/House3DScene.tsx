"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";

function useKeyboardControls() {
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() in keys.current) {
        keys.current[e.key.toLowerCase() as keyof typeof keys.current] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() in keys.current) {
        keys.current[e.key.toLowerCase() as keyof typeof keys.current] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
}

function MapModel() {
  const groupRef = useRef();
  const { scene } = useGLTF("/models/Map.glb");

  useEffect(() => {
    if (!groupRef.current) return;

    scene.scale.set(0.3, 0.3, 0.3);
    scene.position.set(0, -2, 0);

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());

    groupRef.current.add(scene);

    return () => {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material) {
            child.material.dispose();
          }
        }
      });
    };
  }, [scene]);

  return <group ref={groupRef} />;
}

function SidewalkSpawnArea() {
  const groupRef = useRef();
  const { scene } = useGLTF("/models/SidewalkSpawn.glb");
  const boundsRef = useRef(null);

  useEffect(() => {
    if (!groupRef.current) return;

    scene.scale.set(0.3, 0.3, 0.3);
    scene.position.set(0, -2, 0);

    boundsRef.current = new THREE.Box3().setFromObject(scene);
    const center = boundsRef.current.getCenter(new THREE.Vector3());

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 0.2,
          wireframe: true
        });
        child.visible = true;
      }
    });

    groupRef.current.add(scene);

    return () => {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material) {
            child.material.dispose();
          }
        }
      });
    };
  }, [scene]);

  return <group ref={groupRef} />;
}

function Scene() {
  const { camera, scene } = useThree();
  const controlsRef = useRef();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const keys = useKeyboardControls();
  const moveSpeed = 0.2;
  const spawnAreaRef = useRef(null);
  
  const character1b = useGLTF("/models/character1b.glb");
  const character2 = useGLTF("/models/character2.glb");
  const character3 = useGLTF("/models/character3.glb");
  const { scene: sidewalkScene } = useGLTF("/models/SidewalkSpawn.glb");
  
  const characterModels = [
    { scene: character1b.scene, animations: character1b.animations },
    { scene: character2.scene, animations: character2.animations },
    { scene: character3.scene, animations: character3.animations }
  ];

  const mixersRef = useRef([]);
  const clonedModelsRef = useRef([]);
  const [holderCount, setHolderCount] = useState(0);

  const getRandomPosition = () => {
    if (!sidewalkScene) return [0, -2, 0];

    // Get the bounding box of the sidewalk mesh
    const box = new THREE.Box3().setFromObject(sidewalkScene);
    
    // Try to find a valid spawn point
    for (let attempts = 0; attempts < 100; attempts++) {
      // Generate random position within the bounding box
      const x = THREE.MathUtils.randFloat(box.min.x, box.max.x);
      const z = THREE.MathUtils.randFloat(box.min.z, box.max.z);
      
      // Create a raycaster to check if point is on the mesh
      const raycaster = new THREE.Raycaster();
      const position = new THREE.Vector3(x, box.max.y + 1, z);
      raycaster.set(position, new THREE.Vector3(0, -1, 0));
      
      let isValidSpawn = false;
      
      // Check intersection with sidewalk mesh
      sidewalkScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const intersects = raycaster.intersectObject(child);
          if (intersects.length > 0) {
            isValidSpawn = true;
          }
        }
      });
      
      if (isValidSpawn) {
        return [x, -2, z];
      }
    }
    
    // Fallback position if no valid point found
    return [0, -2, 0];
  };

  useEffect(() => {
    const fetchHolderData = async () => {
      try {
        const response = await fetch('/api/token-metadata');
        const data = await response.json();
        const holders = data.data?.holder || 0;
        setHolderCount(holders);
      } catch (error) {
        console.error('Error fetching holder data:', error);
        setHolderCount(0);
      }
    };

    fetchHolderData();
  }, []);

  useEffect(() => {
    if (holderCount === 0 || !sidewalkScene) return;

    camera.position.set(15, 15, 25);
    camera.lookAt(0, 0, 10);

    clonedModelsRef.current.forEach(model => {
      scene.remove(model);
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material) {
            child.material.dispose();
          }
        }
      });
    });
    mixersRef.current.forEach(mixer => mixer.stopAllAction());
    mixersRef.current = [];
    clonedModelsRef.current = [];

    for (let i = 0; i < holderCount; i++) {
      const randomModelIndex = Math.floor(Math.random() * characterModels.length);
      const selectedModel = characterModels[randomModelIndex];

      const clonedModel = SkeletonUtils.clone(selectedModel.scene);
      const position = getRandomPosition();
      const rotation = [0, Math.random() * Math.PI * 2, 0];

      clonedModel.position.set(...position);
      clonedModel.rotation.set(...rotation);
      clonedModel.scale.set(0.3, 0.3, 0.3);
      clonedModel.userData.isClone = true;
      clonedModel.userData.cloneIndex = i;
      clonedModel.userData.characterType = randomModelIndex + 1;

      const mixer = new THREE.AnimationMixer(clonedModel);
      selectedModel.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixersRef.current.push(mixer);
      clonedModelsRef.current.push(clonedModel);

      clonedModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.userData.clickable = true;
        }
      });

      scene.add(clonedModel);
    }

    return () => {
      mixersRef.current.forEach(mixer => mixer.stopAllAction());
      clonedModelsRef.current.forEach(model => {
        scene.remove(model);
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material) {
              child.material.dispose();
            }
          }
        });
      });
      mixersRef.current = [];
      clonedModelsRef.current = [];
    };
  }, [character1b, character2, character3, scene, camera, holderCount, sidewalkScene]);

  useFrame((state, delta) => {
    mixersRef.current.forEach(mixer => mixer.update(delta));

    if (!camera) return;

    const movement = new THREE.Vector3(0, 0, 0);
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.getWorldDirection(forward);
    right.set(-forward.z, 0, forward.x).normalize();

    forward.y = 0;
    forward.normalize();

    if (keys.current.w) movement.add(forward.multiplyScalar(moveSpeed));
    if (keys.current.s) movement.sub(forward.multiplyScalar(moveSpeed));
    if (keys.current.d) movement.add(right.multiplyScalar(moveSpeed));
    if (keys.current.a) movement.sub(right.multiplyScalar(moveSpeed));

    if (movement.length() > 0) {
      camera.position.add(movement);
      if (controlsRef.current) {
        controlsRef.current.target.add(movement);
      }
    }
  });

  const handleCharacterSelect = (characterName) => {
    setSelectedCharacter((prev) => prev === characterName ? null : characterName);
  };

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
            e.stopPropagation();
            const targetObject = e.object;
            handleCharacterSelect(targetObject.userData.cloneIndex);
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
  );
}

export default function MapScene() {
  const [isDebugMode] = useState(true);

  useEffect(() => {
    if (isDebugMode) {
      console.log("Debug Mode Enabled");
      console.log("Environment:", {
        nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
        isDevelopment: process.env.NODE_ENV === 'development'
      });
    }
  }, [isDebugMode]);

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
  );
}

useGLTF.preload("/models/Map.glb");
useGLTF.preload("/models/SidewalkSpawn.glb");
useGLTF.preload("/models/character1b.glb");
useGLTF.preload("/models/character2.glb");
useGLTF.preload("/models/character3.glb");
