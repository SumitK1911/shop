'use client';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, useTexture } from '@react-three/drei';
import { useEffect } from 'react';
import { GirlModel } from './GirlModel';
import { Officetable } from './Officetable';

export default function Experience() {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <Canvas shadows camera={{ position: [0, 0, 2.2] }}>
                <OrbitControls />
                <Sky />
                <Environment preset="sunset" />

                <GirlModel />
                <Officetable />
                <TextureAndViewport />
                <TextureOnTable />
            </Canvas>
            <input
                type='text'
                placeholder='Enter a prompt here'
                className='absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 p-2 text-lg border rounded bg-slate-300'
            />
            <button className='absolute top-[60%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 z-10 p-2 text-lg border rounded bg-slate-300'>Enter</button>

        </div>
    );
}

function TextureAndViewport() {
    const texture = useTexture('/shopbg.jpg');
    const viewport = useThree((state) => state.viewport);

    return (
        <mesh>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <meshBasicMaterial map={texture} position={[0, 0, -5]} />
        </mesh>
    );
}

function TextureOnTable() {
    const banner = useTexture('/falconrobotics.jpg');
    const tableFrontWidth = 1.5;  // Adjust according to your table model
    const tableFrontHeight = 0.5; // Adjust according to your table model

    return (
        <mesh position={[0.1, -0.5, 0.8]} rotation={[0, 0.2, 0]} scale={[0.8, 0.6, 0]}>
            <planeGeometry args={[tableFrontWidth, tableFrontHeight]} />
            <meshBasicMaterial map={banner} />
        </mesh>
    );
}
