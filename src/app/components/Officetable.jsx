
import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Officetable(props) {
  const { nodes, materials,tableModel } = useGLTF('model/officetable.glb')
  return (
    <group {...props} dispose={null} position={[0, -1.2, 0.4]} rotation-y={0.2} scale={[1.2, 1.2, -1]}>
      <mesh geometry={nodes.Object_6.geometry} material={materials.BASE} />
      <mesh geometry={nodes.Object_9.geometry} material={materials.METAL} />
      <mesh geometry={nodes.Object_12.geometry} material={materials.METAL} />
      <mesh geometry={nodes.Object_15.geometry} material={materials.BASE} />
    </group>
  )
}

useGLTF.preload('/officetable.glb')
