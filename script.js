// Import necessary Three.js modules and addons
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- Global Variables & Constants ---
let camera, scene, renderer, controls, composer, bloomPass;
let raycaster, mouse, clock;
let tooltip, loaderElement, focusedPlanetElement;
let speedControlsContainer, speedSlidersDiv, toggleSpeedButton; // Added speed control elements
const celestialBodies = []; // To store mesh objects for interaction
let globalSpeedMultiplier = 1.0; // Global speed multiplier
let trackedObject = null; // Track which object the camera is following

// Speed range mapping
const MIN_SPEED = 0.0001; // Minimum possible speed (almost stationary)
const MAX_SPEED = 0.05;  // Maximum possible speed (adjust as needed)
const SLIDER_MIN = 0;
const SLIDER_MAX = 100;

// Texture URLs (assuming user provides the correct saturnRing URL)
const textures = {
    sun: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Solarsystemscope_texture_2k_sun.jpg',
    mercury: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Solarsystemscope_texture_2k_mercury.jpg',
    venus: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Solarsystemscope_texture_2k_venus_atmosphere.jpg',
    earth: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    moon: 'https://threejs.org/examples/textures/planets/moon_1024.jpg',
    mars: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Solarsystemscope_texture_2k_mars.jpg',
    jupiter: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Solarsystemscope_texture_2k_jupiter.jpg',
    saturn: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Solarsystemscope_texture_2k_saturn.jpg',
    saturnRing: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Solarsystemscope_texture_2k_saturn_ring_alpha.png', // User provided URL
    uranus: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Solarsystemscope_texture_2k_uranus.jpg',
    neptune: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Solarsystemscope_texture_2k_neptune.jpg'
};

// Planet data configuration
const planetData = [
    // Speeds adjusted slightly for better initial slider range feel
    { name: 'Mercury', radius: 0.5, distance: 20, textureUrl: textures.mercury, speed: 0.025 },
    { name: 'Venus', radius: 0.9, distance: 28, textureUrl: textures.venus, speed: 0.018 },
    { name: 'Earth', radius: 1.0, distance: 38, textureUrl: textures.earth, speed: 0.010, hasMoon: true },
    { name: 'Mars', radius: 0.7, distance: 50, textureUrl: textures.mars, speed: 0.008 },
    { name: 'Jupiter', radius: 4.0, distance: 85, textureUrl: textures.jupiter, speed: 0.004 },
    { name: 'Saturn', radius: 3.5, distance: 125, textureUrl: textures.saturn, speed: 0.003, hasRing: true },
    { name: 'Uranus', radius: 2.0, distance: 185, textureUrl: textures.uranus, speed: 0.002 },
    { name: 'Neptune', radius: 1.9, distance: 280, textureUrl: textures.neptune, speed: 0.001 }
];

// --- Initialize Loading Manager ---
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);

loadingManager.onLoad = () => {
    console.log('All assets loaded!');
    if (loaderElement) loaderElement.style.display = 'none';
    // ** Generate Speed Sliders after assets load **
    createSpeedControls();
    animate(); // Start animation loop only after loading
};
loadingManager.onError = (url) => {
    console.error('Error loading asset:', url);
    if (loaderElement) loaderElement.textContent = `Error loading: ${url}. Please refresh.`;
};
loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    if (loaderElement) loaderElement.textContent = `Loading Assets: ${itemsLoaded}/${itemsTotal}`;
};

// --- Initialization Function ---
function init() {
    // Get DOM elements
    tooltip = document.getElementById('tooltip');
    loaderElement = document.getElementById('loader');
    focusedPlanetElement = document.getElementById('focused-planet');
    speedControlsContainer = document.getElementById('speed-controls-container');
    speedSlidersDiv = document.getElementById('speed-sliders');
    toggleSpeedButton = document.getElementById('toggle-speed-controls');


    // Basic Scene Setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.body.appendChild(renderer.domElement);

    // Background
    const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);
    const backgroundTexture = cubeTextureLoader.load([
        'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_px.jpg',
        'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_nx.jpg',
        'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_py.jpg',
        'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_ny.jpg',
        'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_pz.jpg',
        'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_nz.jpg'
    ]);
    scene.background = backgroundTexture;

    
    // Post Processing (Only Bloom)
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.7, 0.5, 0.85
    );
    composer.addPass(bloomPass);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 1500;
    controls.target.set(0, 0, 0);

    // Raycasting & Clock
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    clock = new THREE.Clock();

    // Create Celestial Bodies
    createSolarSystem(); // This now just creates geometry/materials

    // Camera Initial Position
    camera.position.set(0, 80, 180);
    camera.lookAt(scene.position);

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('click', onClick, false);
    window.addEventListener('dblclick', onDoubleClick, false);
    window.addEventListener('mousemove', onMouseMove, false);

    // ** Add listener for the toggle button **
    if (toggleSpeedButton && speedSlidersDiv) {
        toggleSpeedButton.addEventListener('click', () => {
            speedSlidersDiv.classList.toggle('hidden');
            // Change button text/symbol
            const isHidden = speedSlidersDiv.classList.contains('hidden');
            toggleSpeedButton.textContent = `Change Speed ${isHidden ? '▼' : '▲'}`;
        });
    }
}

// --- Function to Load Textures ---
function loadTexture(url) {
    return textureLoader.load(url, undefined, undefined, (err) => {
        console.error(`Failed to load texture: ${url}.`);
    });
}

// --- Function to Create Solar System Objects ---
function createSolarSystem() {
    // Create Sun - increased size
    const sunGeometry = new THREE.SphereGeometry(12, 64, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        map: loadTexture(textures.sun),
        color: 0xffffff
    });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunMesh.name = 'Sun';
    scene.add(sunMesh);
    celestialBodies.push(sunMesh);

    // Create Planets
    planetData.forEach(data => {
        const planetGroup = new THREE.Group();
        planetGroup.name = `${data.name}_Group`;

        const geometry = new THREE.SphereGeometry(data.radius, 32, 16);
        const planetTexture = loadTexture(data.textureUrl);

        const material = new THREE.MeshBasicMaterial({
            map: planetTexture,
            color: 0xaaaaaa
        });
        const planetMesh = new THREE.Mesh(geometry, material);
        planetMesh.name = data.name;
        planetMesh.userData = { ...data, isPlanet: true, group: planetGroup };

        planetGroup.add(planetMesh);
        scene.add(planetGroup);
        celestialBodies.push(planetMesh);

        // Add orbit line using LineSegments instead of RingGeometry
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
        scene.add(orbitLine);

        // Add Moon for Earth
        if (data.hasMoon) {
            const moonGeometry = new THREE.SphereGeometry(data.radius * 0.27, 16, 8);
            const moonTexture = loadTexture(textures.moon);
            const moonMaterial = new THREE.MeshBasicMaterial({
                map: moonTexture,
                color: 0xdddddd
            });
            const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
            moonMesh.name = 'Moon';
            // Store moon data - NOTE: Moon speed is relative to Earth's orbit in animation loop
            moonMesh.userData = { isMoon: true, orbitRadius: data.radius + 1.5, speed: data.speed * 5 };
            planetMesh.add(moonMesh);
            moonMesh.position.set(moonMesh.userData.orbitRadius, 0, 0);
        }

         // Add Rings for Saturn
         if (data.hasRing) {
            // Calculate inner and outer radii for the ring
            const innerRadius = data.radius * 1.2;
            const outerRadius = data.radius * 2.2;
            
            // Create a custom ring geometry with proper UV mapping
            const segments = 128; // Angular segments
            const rings = 64;     // Radial segments
            
            // Create a custom ring geometry
            const ringGeometry = new THREE.BufferGeometry();
            
            // Generate vertices, indices, and UVs
            const vertices = [];
            const indices = [];
            const uvs = [];
            
            // Generate vertices and UVs
            for (let i = 0; i <= rings; i++) {
                const ratio = i / rings;
                const radius = innerRadius + (outerRadius - innerRadius) * ratio;
                
                for (let j = 0; j <= segments; j++) {
                    const segment = j / segments;
                    const angle = segment * Math.PI * 2;
                    
                    // Vertex position
                    const x = radius * Math.cos(angle);
                    const y = 0;
                    const z = radius * Math.sin(angle);
                    vertices.push(x, y, z);
                    
                    // UV coordinates - this is the key change:
                    // u goes from 0 to 1 based on the radial position (inner to outer)
                    // v goes from 0 to 1 based on angular position (around the ring)
                    const u = ratio;         // Radial position (maps to width of texture)
                    const v = segment;       // Angular position (maps to height of texture)
                    uvs.push(u, v);
                }
            }
            
            // Generate indices for triangles
            for (let i = 0; i < rings; i++) {
                for (let j = 0; j < segments; j++) {
                    const a = i * (segments + 1) + j;
                    const b = a + segments + 1;
                    const c = a + 1;
                    const d = b + 1;
                    
                    // Each quad is made of two triangles
                    indices.push(a, b, c);
                    indices.push(c, b, d);
                }
            }
            
            // Add attributes to the buffer geometry
            ringGeometry.setIndex(indices);
            ringGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            ringGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            ringGeometry.computeVertexNormals();
            
            // Load the Saturn ring texture
            const ringTexture = loadTexture(textures.saturnRing);
            
            // Configure texture wrapping
            ringTexture.wrapS = THREE.ClampToEdgeWrapping; // Clamp in radial direction
            ringTexture.wrapT = THREE.RepeatWrapping;      // Repeat around the ring
            
            // The image contains one radial slice - we need to repeat it around the ring
            ringTexture.repeat.y = 1;
            
            // Create material for the ring
            const ringMaterial = new THREE.MeshBasicMaterial({
                map: ringTexture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.85,
                depthWrite: false
            });
            
            // Build the mesh and apply orientation
            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
            ringMesh.name = 'Saturn Rings';
            
            // Set the ring rotation to simulate Saturn's tilt
            ringMesh.rotation.x = 0.45;
            ringMesh.rotation.y = 0;
            
            // Add the rings as a child of the planet mesh
            planetMesh.add(ringMesh);
        }
    });
}

// --- ** NEW: Function to Create Speed Controls ** ---
function createSpeedControls() {
    if (!speedSlidersDiv) return;
    speedSlidersDiv.innerHTML = ''; // Clear previous sliders if any

    // Create Global Speed Slider
    const globalSpeedDiv = document.createElement('div');
    globalSpeedDiv.className = 'slider-item';

    const globalLabel = document.createElement('label');
    globalLabel.htmlFor = 'global-speed';
    globalLabel.innerHTML = `Global Speed: <span class="speed-value">${globalSpeedMultiplier.toFixed(2)}</span>`;

    const globalSlider = document.createElement('input');
    globalSlider.type = 'range';
    globalSlider.id = 'global-speed';
    globalSlider.min = 0.1;
    globalSlider.max = 5.0;
    globalSlider.step = 0.1;
    globalSlider.value = globalSpeedMultiplier;

    globalSlider.addEventListener('input', (event) => {
        globalSpeedMultiplier = parseFloat(event.target.value);
        const valueSpan = event.target.previousElementSibling.querySelector('.speed-value');
        if (valueSpan) {
            valueSpan.textContent = globalSpeedMultiplier.toFixed(2);
        }
    });

    globalSpeedDiv.appendChild(globalLabel);
    globalSpeedDiv.appendChild(globalSlider);
    speedSlidersDiv.appendChild(globalSpeedDiv);

    // Find planet meshes to attach listeners and get initial speeds
    const planetMeshes = celestialBodies.filter(obj => obj.userData.isPlanet);

    planetMeshes.forEach(planetMesh => {
        const planetName = planetMesh.name;
        const currentSpeed = planetMesh.userData.speed;

        // Map current speed to initial slider value
        const initialSliderValue = Math.round(((currentSpeed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)) * (SLIDER_MAX - SLIDER_MIN) + SLIDER_MIN);

        // Create elements
        const itemDiv = document.createElement('div');
        itemDiv.className = 'slider-item';

        const label = document.createElement('label');
        label.htmlFor = `speed-${planetName}`;
        // Use a span to display the value, allowing easy update
        label.innerHTML = `${planetName}: <span class="speed-value">${currentSpeed.toFixed(4)}</span>`;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = `speed-${planetName}`;
        slider.min = SLIDER_MIN;
        slider.max = SLIDER_MAX;
        slider.step = 1;
        slider.value = initialSliderValue;
        slider.dataset.planetName = planetName; // Link slider to planet

        // Add event listener to this specific slider
        slider.addEventListener('input', (event) => {
            const sliderValue = parseFloat(event.target.value);
            const targetPlanetName = event.target.dataset.planetName;

            // Map slider value back to speed
            const newSpeed = MIN_SPEED + (sliderValue / (SLIDER_MAX - SLIDER_MIN)) * (MAX_SPEED - MIN_SPEED);

            // Find the corresponding planet mesh and update its speed
            const targetMesh = celestialBodies.find(obj => obj.name === targetPlanetName);
            if (targetMesh) {
                targetMesh.userData.speed = newSpeed;
                // Update the displayed speed value in the label
                const valueSpan = event.target.previousElementSibling.querySelector('.speed-value');
                if (valueSpan) {
                    valueSpan.textContent = newSpeed.toFixed(4);
                }

                // Update Moon speed if Earth speed changes (optional, keeps ratio)
                if (targetPlanetName === 'Earth') {
                    const moonMesh = targetMesh.getObjectByName('Moon');
                    if (moonMesh) {
                        moonMesh.userData.speed = newSpeed * 5; // Maintain relative speed
                    }
                }
            }
        });

        // Append elements
        itemDiv.appendChild(label);
        itemDiv.appendChild(slider);
        speedSlidersDiv.appendChild(itemDiv);
    });
}


// --- Event Handler Functions ---
function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height); // Resize composer passes
    // Removed ssaoPass.setSize
}

function updateMouseCoords(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseMove(event) {
    updateMouseCoords(event);
    if(tooltip) {
        tooltip.style.left = `${event.clientX + 15}px`;
        tooltip.style.top = `${event.clientY + 10}px`;
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    let hoveredObject = null;
    if (intersects.length > 0) {
        for (let i = 0; i < intersects.length; i++) {
             const obj = intersects[i].object;
             if (obj.name && (obj.userData.isPlanet || obj.name === 'Sun' || obj.name === 'Moon' || obj.name === 'Saturn Rings')) {
                hoveredObject = obj;
                break;
             }
        }
    }

     if (hoveredObject && tooltip) {
         tooltip.style.display = 'block';
         tooltip.textContent = hoveredObject.name;
     } else if (tooltip) {
        tooltip.style.display = 'none';
     }
}

function onClick(event) {
    updateMouseCoords(event);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        let clickedObject = null;
        for (let i = 0; i < intersects.length; i++) {
            const obj = intersects[i].object;
             if (obj.name === 'Saturn Rings' && obj.parent?.userData?.isPlanet) {
                clickedObject = obj.parent;
                break;
             }
             if (obj.name && (obj.userData.isPlanet || obj.name === 'Sun' || obj.userData.isMoon)) {
                clickedObject = obj;
                break;
             }
        }

        if (clickedObject) {
            console.log("Clicked on:", clickedObject.name);
            let targetPosition = new THREE.Vector3();
            clickedObject.getWorldPosition(targetPosition);

            // Set the tracked object for continuous following
            if (clickedObject.userData.isMoon && clickedObject.parent?.userData?.isPlanet) {
                 clickedObject.parent.getWorldPosition(targetPosition);
                 trackedObject = clickedObject.parent;
                 console.log("Clicked moon, tracking parent:", trackedObject.name);
            } else if (clickedObject.name === 'Sun') {
                targetPosition.set(0, 0, 0);
                trackedObject = clickedObject;
            } else {
                trackedObject = clickedObject;
            }

            let focusName = trackedObject.name;
            if(focusedPlanetElement) focusedPlanetElement.textContent = `Tracking: ${focusName}`;
            controls.target.copy(targetPosition);
        }
    }
}

function onDoubleClick(event) {
     updateMouseCoords(event);
     raycaster.setFromCamera(mouse, camera);
     const intersects = raycaster.intersectObjects(scene.children, true);

     if (intersects.length === 0) {
         console.log("Double clicked background - Focusing Sun");
         controls.target.set(0, 0, 0);
         trackedObject = scene.getObjectByName('Sun'); // Set Sun as tracked object
         if(focusedPlanetElement) focusedPlanetElement.textContent = `Tracking: Sun`;
     }
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Update controls target if tracking an object
    if (trackedObject) {
        let targetPosition = new THREE.Vector3();
        trackedObject.getWorldPosition(targetPosition);
        controls.target.copy(targetPosition);
    }

    // Animate planet orbits and rotations using potentially updated speeds
    scene.traverse((object) => {
         if (object.userData.isPlanet) {
            const data = object.userData; // data now holds potentially updated speed
            const angle = elapsedTime * data.speed * globalSpeedMultiplier; // Use speed from userData
            const x = Math.cos(angle) * data.distance;
            const z = Math.sin(angle) * data.distance;
            if(data.group) data.group.position.set(x, 0, z);

            object.rotation.y += delta * 0.1; // Planet self-rotation

            const moon = object.getObjectByName('Moon');
            if (moon && moon.userData.isMoon) {
                // Moon speed is still relative to Earth's speed in userData
                const moonAngle = elapsedTime * moon.userData.speed * globalSpeedMultiplier;
                const moonX = Math.cos(moonAngle) * moon.userData.orbitRadius;
                const moonZ = Math.sin(moonAngle) * moon.userData.orbitRadius;
                moon.position.set(moonX, 0, moonZ);
                moon.rotation.y += delta * 0.5; // Moon self-rotation
            }
        } else if (object.name === 'Sun') {
             object.rotation.y += delta * 0.01; // Sun self-rotation
        }
    });

    controls.update(); // Update camera controls

    // Render the scene using the EffectComposer (now only for Bloom)
    composer.render(delta);
}

// --- Start the application ---
init(); // Call initialization function
// Set Sun as the default tracked object
trackedObject = scene.getObjectByName('Sun');
