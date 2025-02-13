"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

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
  const { scene } = useGLTF("/models/Mapa.glb");

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

  const handleCharacterSelect = (characterName) => {
    setSelectedCharacter((prev) => prev === characterName ? null : characterName);
    
    if (characterName === 'nathan') {
      camera.position.set(-2, -1, 10);
      camera.lookAt(0, -1.5, 10);
    } else if (characterName === 'personaje1') {
      camera.position.set(3, -1, 10);
      camera.lookAt(1, -1.5, 10);
    } else {
      camera.position.set(15, 15, 25);
      camera.lookAt(0, 0, 10);
    }

    if (controlsRef.current) {
      if (characterName === 'nathan') {
        controlsRef.current.target.set(0, -1.5, 10);
      } else if (characterName === 'personaje1') {
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
        name="nathan"
        position={[0, -2, 10]}
        rotation={[0, -Math.PI / 2, 0]}
        modelPath="/models/nathan.glb"
        onSelect={handleCharacterSelect}
        isSelected={selectedCharacter === 'nathan'}
      />
      <CharacterModel
        name="personaje1"
        position={[1, -2, 10]}
        rotation={[0, Math.PI / 2, 0]}
        modelPath="/models/personaje1.glb"
        onSelect={handleCharacterSelect}
        isSelected={selectedCharacter === 'personaje1'}
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

useGLTF.preload("/models/Mapa.glb");
useGLTF.preload("/models/nathan.glb");
useGLTF.preload("/models/personaje1.glb");
