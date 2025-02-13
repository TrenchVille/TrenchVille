"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

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

  // Handle selection visibility
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
  const { camera } = useThree();
  const controlsRef = useRef();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const keys = useKeyboardControls();
  const moveSpeed = 0.2;

  useFrame(() => {
    if (!camera) return;

    const movement = new THREE.Vector3(0, 0, 0);
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    // Get camera's forward direction
    camera.getWorldDirection(forward);
    // Calculate right vector properly
    right.set(-forward.z, 0, forward.x).normalize();

    // Remove vertical component for horizontal-only movement
    forward.y = 0;
    forward.normalize();

    // Add movement based on key presses
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
    
    if (characterName === 'character1') {
      camera.position.set(-2, -1, 10);
      camera.lookAt(0, -1.5, 10);
    } else if (characterName === 'character2') {
      camera.position.set(3, -1, 10);
      camera.lookAt(1, -1.5, 10);
    } else {
      camera.position.set(15, 15, 25);
      camera.lookAt(0, 0, 10);
    }

    if (controlsRef.current) {
      if (characterName === 'character1') {
        controlsRef.current.target.set(0, -1.5, 10);
      } else if (characterName === 'character2') {
        controlsRef.current.target.set(1, -1.5, 10);
      } else {
        controlsRef.current.target.set(0, 0, 10);
      }
      controlsRef.current.update();
    }
  };

  useEffect(() => {
    camera.position.set(15, 15, 25);
    camera.lookAt(0, 0, 10);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight 
        intensity={1.5}
        position={[10, 20, 20]}
        castShadow
      />
      <MapModel />
      <CharacterModel
        name="character1"
        position={[0, -2, 10]}
        rotation={[0, -Math.PI / 10, 0]}
        modelPath="/models/character1.glb"
        onSelect={handleCharacterSelect}
        isSelected={selectedCharacter === 'character1'}
      />
      <CharacterModel
        name="character2"
        position={[0, -2, 9]}
        rotation={[0, Math.PI / 2, 0]}
        modelPath="/models/character2.glb"
        onSelect={handleCharacterSelect}
        isSelected={selectedCharacter === 'character2'}
      />
      <CharacterModel
        name="character3"
        position={[4, -2, 10]}
        rotation={[0, 110, 0]}
        modelPath="/models/character3.glb"
        onSelect={handleCharacterSelect}
        isSelected={selectedCharacter === 'character3'}
      />
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
        fov={75} 
        position={[20, 20, 30]}
        near={0.1}
        far={1000}
      />
    </Canvas>
  );
}

useGLTF.preload("/models/Map.glb");
useGLTF.preload("/models/character1.glb");
useGLTF.preload("/models/character2.glb");
useGLTF.preload("/models/character3.glb");
