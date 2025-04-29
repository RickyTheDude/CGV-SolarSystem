import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export function setupScene(appState, loadingManager) {
    // Basic Scene Setup
    appState.scene = new THREE.Scene();
    appState.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
    appState.renderer = new THREE.WebGLRenderer({ antialias: true });
    appState.renderer.setSize(window.innerWidth, window.innerHeight);
    appState.renderer.setPixelRatio(window.devicePixelRatio);
    appState.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    appState.renderer.toneMappingExposure = 1.0;
    document.body.appendChild(appState.renderer.domElement);

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
    appState.scene.background = backgroundTexture;

    // Post Processing (Only Bloom)
    appState.composer = new EffectComposer(appState.renderer);
    const renderPass = new RenderPass(appState.scene, appState.camera);
    appState.composer.addPass(renderPass);

    appState.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.7, 0.5, 0.85
    );
    appState.composer.addPass(appState.bloomPass);

    // Controls
    appState.controls = new OrbitControls(appState.camera, appState.renderer.domElement);
    appState.controls.enableDamping = true;
    appState.controls.dampingFactor = 0.05;
    appState.controls.screenSpacePanning = false;
    appState.controls.minDistance = 1;
    appState.controls.maxDistance = 1500;
    appState.controls.target.set(0, 0, 0);

    // Raycasting & Clock Setup
    appState.raycaster = new THREE.Raycaster();

    // Camera Initial Position
    appState.camera.position.set(0, 80, 180);
    appState.camera.lookAt(appState.scene.position);
} 