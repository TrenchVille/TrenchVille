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

const CharacterModel = ({ name, position, rotation, modelPath, onSelect, isSelected }) => {
  const groupRef = useRef();
  const outlineRef = useRef();
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (!groupRef.current) return;

    // Play animations
    Object.values(actions).forEach(action => {
      if (action) {
        action.play();
      }
    });

    // Set up main model
    scene.scale.set(0.3, 0.3, 0.3);
    scene.position.set(...position);
    scene.rotation.set(...rotation);
    groupRef.current.add(scene);

    // Create outline model
    const outlineModel = scene.clone();
    outlineModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          side: THREE.BackSide,
          transparent: true,
          opacity: 0.8,
        });
      }
    });
    outlineModel.scale.multiplyScalar(1.05);
    outlineModel.visible = false;
    outlineRef.current = outlineModel;
    groupRef.current.add(outlineModel);

    return () => {
      groupRef.current.remove(scene);
      groupRef.current.remove(outlineModel);
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material) {
            child.material.dispose();
          }
        }
      });
    };
  }, [scene, actions, position, rotation]);

  useEffect(() => {
    if (outlineRef.current) {
      outlineRef.current.visible = isSelected;
    }
  }, [isSelected]);

  return (
    <group 
      ref={groupRef} 
      onClick={(e) => {
        e.stopPropagation();
        onSelect(name);
      }}
    />
  );
};

function MapModel() {
  const groupRef = useRef();
  const { scene } = useGLTF("/models/Map.glb");

  useEffect(() => {
    if (!groupRef.current) return;

    scene.scale.set(0.3, 0.3, 0.3);
    scene.position.set(0, -2, 10);
    scene.rotation.set(0, 0, 0);

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);
    scene.position.y = -2;
    scene.position.z += 10;

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

  return <group ref={groupRef} position={[0, 0, 0]} />;
}

function Scene() {
  const { camera, scene } = useThree();
  const controlsRef = useRef();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const keys = useKeyboardControls();
  const moveSpeed = 0.2;
  const { scene: character1bScene, animations } = useGLTF("/models/character1b.glb");
  const mixersRef = useRef([]);
  const clonedModelsRef = useRef([]);
  const [holderCount, setHolderCount] = useState(0);

  // Fetch holder data
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

  // Generate random position within map bounds
  const getRandomPosition = () => {
    // Adjust these values based on your map size
    const mapBounds = {
      minX: -10,
      maxX: 10,
      minZ: 0,
      maxZ: 20
    };

    return [
      Math.random() * (mapBounds.maxX - mapBounds.minX) + mapBounds.minX,
      -2, // Fixed Y position
      Math.random() * (mapBounds.maxZ - mapBounds.minZ) + mapBounds.minZ
    ];
  };

  useEffect(() => {
    if (holderCount === 0) return;

    // Initial camera setup
    camera.position.set(15, 15, 25);
    camera.lookAt(0, 0, 10);

    // Clear existing clones
    clonedModelsRef.current.forEach(model => {
      scene.remove(model);
      model.traverse((child) => {
        if (child.isMesh) {
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

    // Create clones based on holder count
    for (let i = 0; i < holderCount; i++) {
      const clonedModel = SkeletonUtils.clone(character1bScene);
      const position = getRandomPosition();
      const rotation = [0, Math.random() * Math.PI * 2, 0]; // Random rotation around Y axis

      clonedModel.position.set(...position);
      clonedModel.rotation.set(...rotation);
      clonedModel.scale.set(0.3, 0.3, 0.3);
      clonedModel.userData.isClone = true;
      clonedModel.userData.cloneIndex = i;

      // Setup animations for the clone
      const mixer = new THREE.AnimationMixer(clonedModel);
      animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      mixersRef.current.push(mixer);
      clonedModelsRef.current.push(clonedModel);

      // Add click handler
      clonedModel.traverse((child) => {
        if (child.isMesh) {
          child.userData.clickable = true;
        }
      });

      scene.add(clonedModel);
    }

    return () => {
      // Cleanup
      mixersRef.current.forEach(mixer => mixer.stopAllAction());
      clonedModelsRef.current.forEach(model => {
        scene.remove(model);
        model.traverse((child) => {
          if (child.isMesh) {
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
  }, [character1bScene, animations, scene, camera, holderCount]);

  // Update animations
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
    
    if (characterName === 'character1b' || characterName.startsWith('character1b_clone')) {
      camera.position.set(-5, -1, 10);
      camera.lookAt(-3, -1.5, 10);
    } else if (characterName === 'character1Clone') {
      camera.position.set(1, -1, 10);
      camera.lookAt(3, -1.5, 10);
    } else if (characterName === 'character2') {
      camera.position.set(3, -1, 10);
      camera.lookAt(1, -1.5, 10);
    } else {
      camera.position.set(15, 15, 25);
      camera.lookAt(0, 0, 10);
    }

    if (controlsRef.current) {
      if (characterName === 'character1b' || characterName.startsWith('character1b_clone')) {
        controlsRef.current.target.set(-3, -1.5, 10);
      } else if (characterName === 'character1Clone') {
        controlsRef.current.target.set(3, -1.5, 10);
      } else if (characterName === 'character2') {
        controlsRef.current.target.set(1, -1.5, 10);
      } else {
        controlsRef.current.target.set(0, 0, 10);
      }
      controlsRef.current.update();
    }
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
useGLTF.preload("/models/character1b.glb");