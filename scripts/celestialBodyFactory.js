import * as THREE from 'three';
import { textures, planetData } from './constants.js';

// --- Function to Load Textures ---
function loadTexture(url, textureLoader) {
    return textureLoader.load(url, undefined, undefined, (err) => {
        console.error(`Failed to load texture: ${url}.`);
    });
}

// --- Function to Create Solar System Objects ---
export function createSolarSystem(appState, textureLoader) {
    // Create Sun
    const sunGeometry = new THREE.SphereGeometry(54, 64, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        map: loadTexture(textures.sun, textureLoader),
        color: 0xffffff
    });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunMesh.name = 'Sun';
    appState.scene.add(sunMesh);
    appState.celestialBodies.push(sunMesh);

    // Store sun's initial state
    appState.initialPlanetState.push({
        name: 'Sun',
        rotation: { y: 0 }
    });

    // Create Planets
    planetData.forEach(data => {
        const planetGroup = new THREE.Group();
        planetGroup.name = `${data.name}_Group`;

        const geometry = new THREE.SphereGeometry(data.radius, 32, 16);
        const planetTexture = loadTexture(data.textureUrl, textureLoader);

        const material = new THREE.MeshBasicMaterial({
            map: planetTexture,
            color: 0xaaaaaa
        });
        const planetMesh = new THREE.Mesh(geometry, material);
        planetMesh.name = data.name;
        planetMesh.userData = { ...data, isPlanet: true, group: planetGroup, orbitAngle: 0 };

        planetGroup.add(planetMesh);
        appState.scene.add(planetGroup);
        appState.celestialBodies.push(planetMesh);

        // Store initial planet state for reset
        appState.initialPlanetState.push({
            name: data.name,
            position: { x: data.distance, y: 0, z: 0 },
            rotation: { y: 0 },
            orbitAngle: 0
        });

        // Add orbit line
        const orbitPoints = [];
        const segments = 128;
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            orbitPoints.push(
                Math.cos(theta) * data.distance,
                0,
                Math.sin(theta) * data.distance
            );
        }
        const orbitGeometry = new THREE.BufferGeometry();
        orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
        const orbitMaterial = new THREE.LineBasicMaterial({ 
            color: 0xaaaaaa,
            linewidth: 1,
            opacity: 0.3,
            transparent: true,
        });
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        appState.scene.add(orbitLine);

        // Add Moon for Earth
        if (data.hasMoon) {
            const moonGeometry = new THREE.SphereGeometry(data.radius * 0.27, 16, 8);
            const moonTexture = loadTexture(textures.moon, textureLoader);
            const moonMaterial = new THREE.MeshBasicMaterial({
                map: moonTexture,
                color: 0xdddddd
            });
            const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
            moonMesh.name = 'Moon';
            moonMesh.userData = { isMoon: true, orbitRadius: data.radius + 1.5, speed: data.speed * 5, orbitAngle: 0 };
            planetMesh.add(moonMesh);
            moonMesh.position.set(moonMesh.userData.orbitRadius, 0, 0);
            
            appState.initialPlanetState.push({
                name: 'Moon',
                parentName: data.name,
                position: { x: moonMesh.userData.orbitRadius, y: 0, z: 0 },
                rotation: { y: 0 },
                orbitAngle: 0
            });
        }

         // Add Rings for Saturn
         if (data.hasRing) {
            const innerRadius = data.radius * 1.2;
            const outerRadius = data.radius * 2.2;
            const segments = 128;
            const rings = 64;
            const ringGeometry = new THREE.BufferGeometry();
            const vertices = [];
            const indices = [];
            const uvs = [];
            
            for (let i = 0; i <= rings; i++) {
                const ratio = i / rings;
                const radius = innerRadius + (outerRadius - innerRadius) * ratio;
                for (let j = 0; j <= segments; j++) {
                    const segment = j / segments;
                    const angle = segment * Math.PI * 2;
                    const x = radius * Math.cos(angle);
                    const y = 0;
                    const z = radius * Math.sin(angle);
                    vertices.push(x, y, z);
                    const u = ratio;
                    const v = segment;
                    uvs.push(u, v);
                }
            }
            
            for (let i = 0; i < rings; i++) {
                for (let j = 0; j < segments; j++) {
                    const a = i * (segments + 1) + j;
                    const b = a + segments + 1;
                    const c = a + 1;
                    const d = b + 1;
                    indices.push(a, b, c);
                    indices.push(c, b, d);
                }
            }
            
            ringGeometry.setIndex(indices);
            ringGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            ringGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            ringGeometry.computeVertexNormals();
            
            const ringTexture = loadTexture(textures.saturnRing, textureLoader);
            ringTexture.wrapS = THREE.ClampToEdgeWrapping;
            ringTexture.wrapT = THREE.RepeatWrapping;
            ringTexture.repeat.y = 1;
            
            const ringMaterial = new THREE.MeshBasicMaterial({
                map: ringTexture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.85,
                depthWrite: false
            });
            
            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
            ringMesh.name = 'Saturn Rings';
            ringMesh.rotation.x = 0.45;
            ringMesh.rotation.y = 0;
            planetMesh.add(ringMesh);
        }
    });

    // Set Sun as the default tracked object
    appState.trackedObject = appState.scene.getObjectByName('Sun');
} 