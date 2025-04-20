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
let pauseResumeBtn, resetBtn, isPaused = false; // Playback control elements
let infoPanel, infoPanelTitle, infoPanelContent, infoPanelCloseBtn; // Planet info panel elements
const celestialBodies = []; // To store mesh objects for interaction
let globalSpeedMultiplier = 1.0; // Global speed multiplier
let trackedObject = null; // Track which object the camera is following
let cameraDistance = 0; // Store distance from camera to tracked object
let isCameraFollowing = false; // Flag to indicate if camera is in follow mode
let cameraOffset = new THREE.Vector3(); // Offset between camera and tracked object
let previousTargetPosition = new THREE.Vector3(); // Previous position of tracked object
let isDragging = false; // Flag to indicate if mouse is being dragged
let previousMousePosition = { x: 0, y: 0 }; // Store previous mouse position for dragging
let sphericalCoords = new THREE.Spherical(); // Spherical coordinates for orbital movement

// Store initial planet positions and angles for reset
const initialPlanetState = [];

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
    { name: 'Mercury', radius: 0.5, distance: 80, textureUrl: textures.mercury, speed: 0.025 },
    { name: 'Venus', radius: 0.9, distance: 112, textureUrl: textures.venus, speed: 0.018 },
    { name: 'Earth', radius: 1.0, distance: 156, textureUrl: textures.earth, speed: 0.010, hasMoon: true },
    { name: 'Mars', radius: 0.7, distance: 200, textureUrl: textures.mars, speed: 0.008 },
    { name: 'Jupiter', radius: 4.0, distance: 340, textureUrl: textures.jupiter, speed: 0.004 },
    { name: 'Saturn', radius: 3.5, distance: 500, textureUrl: textures.saturn, speed: 0.003, hasRing: true },
    { name: 'Uranus', radius: 2.0, distance: 740, textureUrl: textures.uranus, speed: 0.002 },
    { name: 'Neptune', radius: 1.9, distance: 1120, textureUrl: textures.neptune, speed: 0.001 }
];

// Planet facts and information for educational display
const celestialBodyInfo = {
    Sun: {
        type: "Star",
        description: "The Sun is the star at the center of our Solar System. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core.",
        diameter: "1,391,000 km (109 times Earth)",
        distance: "0 AU (Astronomical Unit)",
        surfaceTemp: "5,500°C (surface)",
        facts: [
            "The Sun contains 99.86% of the mass in the Solar System.",
            "Light from the Sun takes about 8 minutes to reach Earth.",
            "The Sun is about 4.6 billion years old.",
            "The Sun will eventually become a red giant in about 5 billion years."
        ]
    },
    Mercury: {
        type: "Terrestrial Planet",
        description: "Mercury is the smallest and innermost planet in the Solar System. It has no atmosphere to retain heat, causing extreme temperature variations.",
        diameter: "4,880 km (0.38 times Earth)",
        distance: "0.39 AU from Sun",
        orbitalPeriod: "88 Earth days",
        facts: [
            "Mercury has no moons and no atmosphere.",
            "A day on Mercury (sunrise to sunrise) lasts 176 Earth days.",
            "Mercury has the most extreme temperature variations of any planet.",
            "Mercury is heavily cratered, similar to our Moon."
        ]
    },
    Venus: {
        type: "Terrestrial Planet",
        description: "Venus is the second planet from the Sun and Earth's closest planetary neighbor. It's known as the 'Morning Star' or 'Evening Star' and is the hottest planet in our solar system.",
        diameter: "12,104 km (0.95 times Earth)",
        distance: "0.72 AU from Sun",
        orbitalPeriod: "225 Earth days",
        facts: [
            "Venus rotates backward compared to other planets.",
            "A day on Venus is longer than its year!",
            "Venus has the thickest atmosphere of all rocky planets.",
            "The atmosphere traps heat, making Venus hotter than Mercury."
        ]
    },
    Earth: {
        type: "Terrestrial Planet",
        description: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 71% of Earth's surface is covered with water.",
        diameter: "12,742 km",
        distance: "1 AU from Sun",
        orbitalPeriod: "365.25 days",
        facts: [
            "Earth is the only planet not named after a god or goddess.",
            "Earth's atmosphere is 78% nitrogen, 21% oxygen, and 1% other gases.",
            "Earth is the densest planet in the Solar System.",
            "Earth's magnetic field protects us from the Sun's harmful radiation."
        ]
    },
    Moon: {
        type: "Natural Satellite",
        description: "The Moon is Earth's only natural satellite. It is the fifth largest satellite in the Solar System and the largest relative to its planet among those associated with planets.",
        diameter: "3,474 km (27% of Earth)",
        distance: "384,400 km from Earth",
        orbitalPeriod: "27.3 Earth days",
        facts: [
            "The Moon's gravity affects Earth's tides.",
            "The Moon always shows the same face to Earth.",
            "The Moon has no atmosphere.",
            "The first human landed on the Moon in 1969 (Neil Armstrong)."
        ]
    },
    Mars: {
        type: "Terrestrial Planet",
        description: "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System, known as the 'Red Planet' due to its reddish appearance.",
        diameter: "6,779 km (0.53 times Earth)",
        distance: "1.52 AU from Sun",
        orbitalPeriod: "687 Earth days",
        facts: [
            "Mars has two small moons named Phobos and Deimos.",
            "Mars has the largest volcano in the solar system, Olympus Mons.",
            "Mars has seasons similar to Earth but they last twice as long.",
            "There is evidence that liquid water once flowed on Mars."
        ]
    },
    Jupiter: {
        type: "Gas Giant",
        description: "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass more than two and a half times that of all the other planets combined.",
        diameter: "139,820 km (11 times Earth)",
        distance: "5.2 AU from Sun",
        orbitalPeriod: "12 Earth years",
        facts: [
            "Jupiter has the Great Red Spot, a storm larger than Earth that has lasted for centuries.",
            "Jupiter has at least 79 moons.",
            "Jupiter has the strongest magnetic field of any planet.",
            "Jupiter rotates faster than any other planet in our Solar System."
        ]
    },
    Saturn: {
        type: "Gas Giant",
        description: "Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is famous for its rings, which are made mostly of ice particles with some rocky debris and dust.",
        diameter: "116,460 km (9.1 times Earth)",
        distance: "9.5 AU from Sun",
        orbitalPeriod: "29.5 Earth years",
        facts: [
            "Saturn's rings would span the distance between Earth and the Moon.",
            "Saturn has at least 82 moons, with Titan being the largest.",
            "Saturn could float in water if there were an ocean large enough.",
            "Saturn's day is just 10.7 hours long, despite its large size."
        ]
    },
    "Saturn Rings": {
        type: "Planetary Rings",
        description: "Saturn's rings are the most extensive planetary ring system of any planet in the Solar System. They consist of countless small particles, ranging in size from micrometers to meters.",
        width: "282,000 km across",
        thickness: "10 meters to 1 kilometer thick",
        age: "Possibly less than 100 million years old",
        facts: [
            "The rings are named alphabetically in the order they were discovered.",
            "The rings are mostly made of water ice with some rocky material.",
            "There are gaps in the rings caused by moons and gravitational resonances.",
            "The rings reflect sunlight, making Saturn appear brighter than expected."
        ]
    },
    Uranus: {
        type: "Ice Giant",
        description: "Uranus is the seventh planet from the Sun. It's an ice giant with the third-largest diameter and fourth-largest mass in the Solar System. Uniquely, it rotates on its side.",
        diameter: "50,724 km (4 times Earth)",
        distance: "19.8 AU from Sun",
        orbitalPeriod: "84 Earth years",
        facts: [
            "Uranus rotates on its side, with its axis tilted at 98 degrees.",
            "Uranus was the first planet discovered with a telescope.",
            "Uranus has 27 known moons, named after literary characters.",
            "Uranus appears blue-green due to methane in its atmosphere."
        ]
    },
    Neptune: {
        type: "Ice Giant",
        description: "Neptune is the eighth and farthest-known Solar planet from the Sun. It is the fourth-largest planet by diameter and the third-most-massive, known for its intense blue color and strong winds.",
        diameter: "49,244 km (3.9 times Earth)",
        distance: "30.1 AU from Sun",
        orbitalPeriod: "165 Earth years",
        facts: [
            "Neptune has the strongest winds in the Solar System, reaching 2,100 km/h.",
            "Neptune has 14 known moons, Triton being the largest.",
            "Neptune was discovered through mathematical predictions.",
            "Neptune has completed only one orbit since its discovery in 1846."
        ]
    }
};

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
    pauseResumeBtn = document.getElementById('pause-resume-btn');
    resetBtn = document.getElementById('reset-btn');

    // Create and append the info panel to body
    createInfoPanel();

    // Help button controls
    const helpButton = document.getElementById('help-button');
    const infoPanel = document.getElementById('info');
    const closeInfoButton = document.getElementById('close-info');
    
    if (helpButton && infoPanel) {
        helpButton.addEventListener('click', () => {
            infoPanel.classList.toggle('hidden');
        });
    }
    
    if (closeInfoButton && infoPanel) {
        closeInfoButton.addEventListener('click', () => {
            infoPanel.classList.add('hidden');
        });
    }

    // Setup playback controls
    if (pauseResumeBtn) {
        // Set initial button state (showing pause icon since simulation starts playing)
        const playIcon = pauseResumeBtn.querySelector('.play-icon');
        const pauseIcon = pauseResumeBtn.querySelector('.pause-icon');
        
        if (playIcon && pauseIcon) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        }
        
        pauseResumeBtn.addEventListener('click', togglePlayPause);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSimulation);
    }

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
    window.addEventListener('wheel', onMouseWheel, false); // Add wheel event listener for zooming
    window.addEventListener('mousedown', onMouseDown, false); // Track mouse down
    window.addEventListener('mouseup', onMouseUp, false); // Track mouse up

    // ** Add listener for the toggle button **
    if (toggleSpeedButton && speedSlidersDiv) {
        toggleSpeedButton.addEventListener('click', () => {
            speedSlidersDiv.classList.toggle('hidden');
            // Change button text/symbol
            const isHidden = speedSlidersDiv.classList.contains('hidden');
            toggleSpeedButton.textContent = `Speed Controls ${isHidden ? '▼' : '▲'}`;
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
    const sunGeometry = new THREE.SphereGeometry(54, 64, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        map: loadTexture(textures.sun),
        color: 0xffffff
    });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunMesh.name = 'Sun';
    scene.add(sunMesh);
    celestialBodies.push(sunMesh);

    // Store sun's initial state
    initialPlanetState.push({
        name: 'Sun',
        rotation: { y: 0 }
    });

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
        planetMesh.userData = { ...data, isPlanet: true, group: planetGroup, orbitAngle: 0 };

        planetGroup.add(planetMesh);
        scene.add(planetGroup);
        celestialBodies.push(planetMesh);

        // Store initial planet state for reset
        initialPlanetState.push({
            name: data.name,
            position: { x: data.distance, y: 0, z: 0 },
            rotation: { y: 0 },
            orbitAngle: 0
        });

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
            moonMesh.userData = { isMoon: true, orbitRadius: data.radius + 1.5, speed: data.speed * 5, orbitAngle: 0 };
            planetMesh.add(moonMesh);
            moonMesh.position.set(moonMesh.userData.orbitRadius, 0, 0);
            
            // Store initial moon state
            initialPlanetState.push({
                name: 'Moon',
                parentName: data.name,
                position: { x: moonMesh.userData.orbitRadius, y: 0, z: 0 },
                rotation: { y: 0 },
                orbitAngle: 0
            });
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
    speedSlidersDiv.innerHTML = ''; // Clear previous controls if any
    
    // Add header (already in HTML)
    
    // Create Global Speed Control
    const globalSpeedDiv = document.createElement('div');
    globalSpeedDiv.className = 'speed-item';
    
    const globalLabel = document.createElement('div');
    globalLabel.className = 'speed-label';
    globalLabel.textContent = 'Global';
    
    const globalControls = document.createElement('div');
    globalControls.className = 'speed-controls';
    
    const decreaseGlobalBtn = document.createElement('button');
    decreaseGlobalBtn.className = 'speed-btn';
    decreaseGlobalBtn.textContent = '-';
    
    const globalValueInput = document.createElement('input');
    globalValueInput.className = 'speed-value';
    globalValueInput.value = globalSpeedMultiplier.toFixed(2) + 'x';
    globalValueInput.setAttribute('contenteditable', 'true');
    globalValueInput.setAttribute('spellcheck', 'false');
    
    const increaseGlobalBtn = document.createElement('button');
    increaseGlobalBtn.className = 'speed-btn';
    increaseGlobalBtn.textContent = '+';
    
    // Add event listeners
    decreaseGlobalBtn.addEventListener('click', () => {
        globalSpeedMultiplier = Math.max(0.1, (parseFloat(globalSpeedMultiplier) - 0.1).toFixed(2));
        globalValueInput.value = globalSpeedMultiplier + 'x';
    });
    
    increaseGlobalBtn.addEventListener('click', () => {
        globalSpeedMultiplier = Math.min(5.0, (parseFloat(globalSpeedMultiplier) + 0.1).toFixed(2));
        globalValueInput.value = globalSpeedMultiplier + 'x';
    });
    
    // Add input event for direct editing
    globalValueInput.addEventListener('blur', function() {
        // Parse the input value, removing the 'x' suffix if present
        let newValue = this.value.replace('x', '');
        newValue = parseFloat(newValue);
        
        // Validate the input
        if (isNaN(newValue)) {
            // Reset to current value if input is invalid
            this.value = globalSpeedMultiplier.toFixed(2) + 'x';
            return;
        }
        
        // Clamp the value between min and max
        newValue = Math.max(0.1, Math.min(5.0, newValue));
        globalSpeedMultiplier = parseFloat(newValue.toFixed(2));
        
        // Update the display
        this.value = globalSpeedMultiplier + 'x';
    });
    
    // Handle Enter key press
    globalValueInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            this.blur(); // Trigger the blur event to validate and update
            e.preventDefault();
        }
    });
    
    globalControls.appendChild(decreaseGlobalBtn);
    globalControls.appendChild(globalValueInput);
    globalControls.appendChild(increaseGlobalBtn);
    
    globalSpeedDiv.appendChild(globalLabel);
    globalSpeedDiv.appendChild(globalControls);
    speedSlidersDiv.appendChild(globalSpeedDiv);
    
    // Find planet meshes to create controls for
    const planetMeshes = celestialBodies.filter(obj => obj.userData.isPlanet);
    
    planetMeshes.forEach(planetMesh => {
        const planetName = planetMesh.name;
        const currentSpeed = planetMesh.userData.speed;
        
        // Create elements
        const itemDiv = document.createElement('div');
        itemDiv.className = 'speed-item';
        
        const label = document.createElement('div');
        label.className = 'speed-label';
        label.textContent = planetName;
        
        const controls = document.createElement('div');
        controls.className = 'speed-controls';
        
        const decreaseBtn = document.createElement('button');
        decreaseBtn.className = 'speed-btn';
        decreaseBtn.textContent = '-';
        decreaseBtn.dataset.planetName = planetName;
        
        const valueInput = document.createElement('input');
        valueInput.className = 'speed-value';
        valueInput.value = currentSpeed.toFixed(4);
        valueInput.setAttribute('contenteditable', 'true');
        valueInput.setAttribute('spellcheck', 'false');
        valueInput.dataset.planetName = planetName;
        
        const increaseBtn = document.createElement('button');
        increaseBtn.className = 'speed-btn';
        increaseBtn.textContent = '+';
        increaseBtn.dataset.planetName = planetName;
        
        // Add event listeners
        decreaseBtn.addEventListener('click', () => {
            // Find the corresponding planet mesh
            const targetMesh = celestialBodies.find(obj => obj.name === planetName);
            if (targetMesh) {
                // Calculate new speed (ensure it doesn't go below MIN_SPEED)
                const newSpeed = Math.max(MIN_SPEED, (targetMesh.userData.speed - 0.001).toFixed(4));
                targetMesh.userData.speed = parseFloat(newSpeed);
                
                // Update the displayed value
                valueInput.value = newSpeed;
                
                // Update Moon speed if Earth speed changes
                if (planetName === 'Earth') {
                    const moonMesh = targetMesh.getObjectByName('Moon');
                    if (moonMesh) {
                        moonMesh.userData.speed = parseFloat(newSpeed) * 5;
                    }
                }
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            // Find the corresponding planet mesh
            const targetMesh = celestialBodies.find(obj => obj.name === planetName);
            if (targetMesh) {
                // Calculate new speed (ensure it doesn't exceed MAX_SPEED)
                const newSpeed = Math.min(MAX_SPEED, (parseFloat(targetMesh.userData.speed) + 0.001).toFixed(4));
                targetMesh.userData.speed = parseFloat(newSpeed);
                
                // Update the displayed value
                valueInput.value = newSpeed;
                
                // Update Moon speed if Earth speed changes
                if (planetName === 'Earth') {
                    const moonMesh = targetMesh.getObjectByName('Moon');
                    if (moonMesh) {
                        moonMesh.userData.speed = parseFloat(newSpeed) * 5;
                    }
                }
            }
        });
        
        // Add input event for direct editing
        valueInput.addEventListener('blur', function() {
            // Parse the input value
            const newValue = parseFloat(this.value);
            const targetPlanetName = this.dataset.planetName;
            
            // Validate the input
            if (isNaN(newValue)) {
                // Find the mesh to get current value
                const targetMesh = celestialBodies.find(obj => obj.name === targetPlanetName);
                if (targetMesh) {
                    this.value = targetMesh.userData.speed.toFixed(4);
                }
                return;
            }
            
            // Find the corresponding planet mesh
            const targetMesh = celestialBodies.find(obj => obj.name === targetPlanetName);
            if (targetMesh) {
                // Clamp the value between MIN_SPEED and MAX_SPEED
                const clampedValue = Math.max(MIN_SPEED, Math.min(MAX_SPEED, newValue));
                targetMesh.userData.speed = parseFloat(clampedValue.toFixed(4));
                
                // Update the displayed value
                this.value = clampedValue.toFixed(4);
                
                // Update Moon speed if Earth speed changes
                if (targetPlanetName === 'Earth') {
                    const moonMesh = targetMesh.getObjectByName('Moon');
                    if (moonMesh) {
                        moonMesh.userData.speed = clampedValue * 5;
                    }
                }
            }
        });
        
        // Handle Enter key press
        valueInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                this.blur(); // Trigger the blur event to validate and update
                e.preventDefault();
            }
        });
        
        // Append elements
        controls.appendChild(decreaseBtn);
        controls.appendChild(valueInput);
        controls.appendChild(increaseBtn);
        
        itemDiv.appendChild(label);
        itemDiv.appendChild(controls);
        speedSlidersDiv.appendChild(itemDiv);
    });
}

// --- Function to Create Info Panel ---
function createInfoPanel() {
    // Create main container
    infoPanel = document.createElement('div');
    infoPanel.id = 'planet-info-panel';
    infoPanel.className = 'hidden';

    // Create header with title and close button
    const header = document.createElement('div');
    header.className = 'info-panel-header';

    infoPanelTitle = document.createElement('h2');
    infoPanelTitle.className = 'info-panel-title';

    infoPanelCloseBtn = document.createElement('button');
    infoPanelCloseBtn.className = 'info-panel-close';
    infoPanelCloseBtn.innerHTML = '×';
    infoPanelCloseBtn.addEventListener('click', () => {
        infoPanel.classList.add('hidden');
    });

    header.appendChild(infoPanelTitle);
    header.appendChild(infoPanelCloseBtn);

    // Create content container
    infoPanelContent = document.createElement('div');
    infoPanelContent.className = 'info-panel-content';

    // Assemble the panel
    infoPanel.appendChild(header);
    infoPanel.appendChild(infoPanelContent);

    // Add to document
    document.body.appendChild(infoPanel);
}

// Function to show planet info
function showPlanetInfo(objectName) {
    if (!infoPanel || !celestialBodyInfo[objectName]) return;

    const info = celestialBodyInfo[objectName];
    
    // Set the title
    infoPanelTitle.textContent = objectName;

    // Create content HTML
    let contentHTML = `
        <div class="info-type">${info.type}</div>
        <p class="info-description">${info.description}</p>
        <div class="info-data-grid">
    `;

    // Add physical data
    for (const [key, value] of Object.entries(info)) {
        if (key !== 'type' && key !== 'description' && key !== 'facts') {
            contentHTML += `
                <div class="info-data-label">${key.charAt(0).toUpperCase() + key.slice(1)}:</div>
                <div class="info-data-value">${value}</div>
            `;
        }
    }
    
    contentHTML += `</div>`;
    
    // Add fun facts
    if (info.facts && info.facts.length > 0) {
        contentHTML += `
            <h3 class="facts-title">Fun Facts</h3>
            <ul class="facts-list">
        `;
        
        info.facts.forEach(fact => {
            contentHTML += `<li>${fact}</li>`;
        });
        
        contentHTML += `</ul>`;
    }
    
    // Set content
    infoPanelContent.innerHTML = contentHTML;
    
    // Show panel
    infoPanel.classList.remove('hidden');
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
    // Handle tooltip positioning
    if(tooltip) {
        tooltip.style.left = `${event.clientX + 15}px`;
        tooltip.style.top = `${event.clientY + 10}px`;
    }

    // Update mouse coordinates for raycasting
    updateMouseCoords(event);

    // Check for hovering over objects for tooltip
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
    
    // Handle orbital movement when dragging
    if (isDragging && isCameraFollowing && trackedObject) {
        // Calculate mouse movement deltas
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        
        // Update previous mouse position for next frame
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
        
        // Make sure spherical coordinates are updated from current offset
        updateSphericalFromOffset();
        
        // Adjust the orbital angle based on mouse movement
        // Horizontal movement (deltaX) rotates around the vertical axis (theta)
        sphericalCoords.theta -= deltaX * 0.01;
        
        // Vertical movement (deltaY) adjusts the vertical angle (phi)
        // Invert deltaY to fix inverted controls (negative sign)
        sphericalCoords.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalCoords.phi - deltaY * 0.01));
        
        // Update the camera offset vector from the new spherical coordinates
        updateOffsetFromSpherical();
        
        // Get current target position
        const targetPosition = new THREE.Vector3();
        trackedObject.getWorldPosition(targetPosition);
        
        // Apply the new offset to position the camera
        camera.position.copy(targetPosition).add(cameraOffset);
        
        // Make camera look at the target
        camera.lookAt(targetPosition);
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
                 // Show info for Moon
                 showPlanetInfo('Moon');
            } else if (clickedObject.name === 'Sun') {
                targetPosition.set(0, 0, 0);
                trackedObject = clickedObject;
                // Show info for Sun
                showPlanetInfo('Sun');
                // When selecting the Sun, disable camera following
                isCameraFollowing = false;
                previousTargetPosition.set(0, 0, 0);
                // Reset camera to initial position
                controls.enabled = true;
                controls.target.copy(targetPosition);
            } else {
                trackedObject = clickedObject;
                // Show info for the planet
                showPlanetInfo(clickedObject.name);
                
                // If Saturn, specially check for ring clicks
                if (clickedObject.name === 'Saturn') {
                    // Check if the click was specifically on the rings
                    for (let i = 0; i < intersects.length; i++) {
                        if (intersects[i].object.name === 'Saturn Rings') {
                            showPlanetInfo('Saturn Rings');
                            break;
                        }
                    }
                }
            }

            let focusName = trackedObject.name;
            if(focusedPlanetElement) focusedPlanetElement.textContent = `Tracking: ${focusName}`;
            
            // Get the current distance from camera to the tracked object
            if (trackedObject.name !== 'Sun') {
                // Enable camera following for planets
                isCameraFollowing = true;
                
                // Store the initial position of the tracked object
                previousTargetPosition.copy(targetPosition);
                
                // Calculate the initial offset vector from planet to camera
                // This will be maintained as the planet moves
                cameraOffset.copy(new THREE.Vector3().subVectors(camera.position, targetPosition));
                
                // Temporarily disable orbit controls when following a planet
                controls.enabled = false;
            }
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
         isCameraFollowing = false; // Disable camera following for Sun
         controls.enabled = true; // Re-enable orbit controls
         if(focusedPlanetElement) focusedPlanetElement.textContent = `Tracking: Sun`;
     }
}

// Function to toggle camera follow mode
function toggleCameraFollow() {
    if (trackedObject && trackedObject.name !== 'Sun') {
        isCameraFollowing = !isCameraFollowing;
        controls.enabled = !isCameraFollowing;
        
        // If turning on follow mode, calculate the current offset
        if (isCameraFollowing) {
            const targetPosition = new THREE.Vector3();
            trackedObject.getWorldPosition(targetPosition);
            previousTargetPosition.copy(targetPosition);
            cameraOffset.copy(new THREE.Vector3().subVectors(camera.position, targetPosition));
        }
    }
}

// Function for mouse wheel zoom while tracking
function onMouseWheel(event) {
    if (isCameraFollowing && trackedObject) {
        // Prevent the default scroll behavior
        event.preventDefault();
        
        // Get the scroll direction (normalize across browsers)
        const delta = Math.sign(event.deltaY);
        
        // Calculate zoom factor (5% per scroll step)
        const zoomFactor = 1 + (delta * 0.05);
        
        // Get current target position
        const targetPosition = new THREE.Vector3();
        trackedObject.getWorldPosition(targetPosition);
        
        // Get current camera spherical coordinates relative to target
        updateSphericalFromOffset();
        
        // Update the radius (distance)
        sphericalCoords.radius *= zoomFactor;
        
        // Clamp the zoom distance
        sphericalCoords.radius = Math.max(2, Math.min(sphericalCoords.radius, 1000));
        
        // Update camera offset from spherical coordinates
        updateOffsetFromSpherical();
        
        // Apply new camera position
        camera.position.copy(targetPosition).add(cameraOffset);
        
        // Make camera look at target
        camera.lookAt(targetPosition);
        
        return false; // Prevent scrolling the page
    }
}

// Handle mouse down for orbital movement
function onMouseDown(event) {
    if (isCameraFollowing && trackedObject) {
        isDragging = true;
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
        
        // Compute current spherical coordinates
        updateSphericalFromOffset();
    }
}

// Handle mouse up to stop orbital movement
function onMouseUp() {
    isDragging = false;
}

// Helper function to update spherical coordinates from current offset
function updateSphericalFromOffset() {
    sphericalCoords.setFromVector3(cameraOffset);
}

// Helper function to update offset from spherical coordinates
function updateOffsetFromSpherical() {
    cameraOffset.setFromSpherical(sphericalCoords);
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Only update positions if simulation is not paused
    if (!isPaused) {
        // Animate planet orbits and rotations using potentially updated speeds
        scene.traverse((object) => {
             if (object.userData.isPlanet) {
                const data = object.userData; // data now holds potentially updated speed
                
                // Update orbit angle based on speed and delta time
                data.orbitAngle += delta * data.speed * globalSpeedMultiplier;
                
                // Calculate position based on current angle
                const x = Math.cos(data.orbitAngle) * data.distance;
                const z = Math.sin(data.orbitAngle) * data.distance;
                if(data.group) data.group.position.set(x, 0, z);

                object.rotation.y += delta * 0.1; // Planet self-rotation

                const moon = object.getObjectByName('Moon');
                if (moon && moon.userData.isMoon) {
                    // Update moon orbit angle based on speed and delta time
                    moon.userData.orbitAngle += delta * moon.userData.speed * globalSpeedMultiplier;
                    
                    // Calculate moon position based on current angle
                    const moonX = Math.cos(moon.userData.orbitAngle) * moon.userData.orbitRadius;
                    const moonZ = Math.sin(moon.userData.orbitAngle) * moon.userData.orbitRadius;
                    moon.position.set(moonX, 0, moonZ);
                    moon.rotation.y += delta * 0.5; // Moon self-rotation
                }
            } else if (object.name === 'Sun') {
                 object.rotation.y += delta * 0.01; // Sun self-rotation
            }
        });
        
        // Handle camera following for planets
        if (trackedObject && isCameraFollowing && trackedObject.name !== 'Sun') {
            // Get current position of tracked object
            const currentTargetPosition = new THREE.Vector3();
            trackedObject.getWorldPosition(currentTargetPosition);
            
            // Calculate how much the planet has moved since last frame
            const positionDelta = new THREE.Vector3().subVectors(
                currentTargetPosition, 
                previousTargetPosition
            );
            
            // Move the camera by the same amount to follow the planet
            camera.position.add(positionDelta);
            
            // Update the previous position for next frame
            previousTargetPosition.copy(currentTargetPosition);
            
            // Point the camera at the planet
            camera.lookAt(currentTargetPosition);
        }
    }

    // Only update controls if they're enabled (not following a planet)
    if (controls.enabled) {
        controls.update();
    }

    // Render the scene using the EffectComposer (now only for Bloom)
    composer.render(delta);
}

// --- Toggle Play/Pause Function ---
function togglePlayPause() {
    isPaused = !isPaused;
    
    // Update the button icon
    if (pauseResumeBtn) {
        const playIcon = pauseResumeBtn.querySelector('.play-icon');
        const pauseIcon = pauseResumeBtn.querySelector('.pause-icon');
        
        if (playIcon && pauseIcon) {
            if (isPaused) {
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
                pauseResumeBtn.title = "Resume Simulation";
            } else {
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
                pauseResumeBtn.title = "Pause Simulation";
            }
        }
    }
}

// --- Reset Simulation Function ---
function resetSimulation() {
    console.log("Resetting simulation...");
    
    // Reset each celestial body to its initial state
    scene.traverse((object) => {
        if (object.userData.isPlanet) {
            const data = object.userData;
            const initialState = initialPlanetState.find(state => state.name === object.name);
            
            if (initialState) {
                // Reset orbit angle
                data.orbitAngle = initialState.orbitAngle;
                
                // Reset position (via group)
                if (data.group) {
                    data.group.position.set(initialState.position.x, initialState.position.y, initialState.position.z);
                }
                
                // Reset rotation
                object.rotation.y = initialState.rotation.y;
                
                // Reset moon if present
                const moon = object.getObjectByName('Moon');
                if (moon) {
                    const moonInitialState = initialPlanetState.find(state => state.name === 'Moon' && state.parentName === object.name);
                    if (moonInitialState) {
                        moon.userData.orbitAngle = moonInitialState.orbitAngle;
                        moon.position.set(moonInitialState.position.x, moonInitialState.position.y, moonInitialState.position.z);
                        moon.rotation.y = moonInitialState.rotation.y;
                    }
                }
            }
        } else if (object.name === 'Sun') {
            const initialState = initialPlanetState.find(state => state.name === 'Sun');
            if (initialState) {
                object.rotation.y = initialState.rotation.y;
            }
        }
    });
    
    // Reset camera to initial position if needed
    camera.position.set(0, 80, 180);
    controls.target.set(0, 0, 0);
    
    // Optionally, unpause the simulation if it was paused
    if (isPaused) {
        togglePlayPause();
    }
}

// --- Start the application ---
init(); // Call initialization function
// Set Sun as the default tracked object
trackedObject = scene.getObjectByName('Sun');
