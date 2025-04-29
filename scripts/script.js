// Import necessary Three.js modules and addons
import * as THREE from 'three';

// Import modules
import { setupScene } from './sceneSetup.js';
import { createSolarSystem } from './celestialBodyFactory.js';
import { createSpeedControls, createInfoPanel } from './uiController.js';
import { setupEventListeners } from './eventListeners.js';
import { startAnimation } from './animation.js';

// --- Shared Application State ---
const appState = {
    camera: null,
    scene: null,
    renderer: null,
    controls: null,
    composer: null,
    bloomPass: null,
    raycaster: null,
    mouse: new THREE.Vector2(),
    clock: new THREE.Clock(),
    tooltip: null,
    loaderElement: null,
    focusedPlanetElement: null,
    speedControlsContainer: null,
    speedSlidersDiv: null,
    toggleSpeedButton: null,
    pauseResumeBtn: null,
    resetBtn: null,
    infoPanel: null,
    infoPanelTitle: null,
    infoPanelContent: null,
    infoPanelCloseBtn: null,
    celestialBodies: [],
    initialPlanetState: [],
    globalSpeedMultiplier: 1.0,
    trackedObject: null,
    isCameraFollowing: false,
    cameraOffset: new THREE.Vector3(),
    previousTargetPosition: new THREE.Vector3(),
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    sphericalCoords: new THREE.Spherical(),
    isPaused: false
};

// --- Initialize Loading Manager ---
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);

loadingManager.onLoad = () => {
    console.log('All assets loaded!');
    if (appState.loaderElement) appState.loaderElement.style.display = 'none';
    // Generate UI Controls after assets load
    createSpeedControls(appState);
    // Start the animation loop
    startAnimation(appState);
};
loadingManager.onError = (url) => {
    console.error('Error loading asset:', url);
    if (appState.loaderElement) appState.loaderElement.textContent = `Error loading: ${url}. Please refresh.`;
};
loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    if (appState.loaderElement) appState.loaderElement.textContent = `Loading Assets: ${itemsLoaded}/${itemsTotal}`;
};

// --- Initialization Function ---
function init() {
    // Get DOM elements and store in appState
    appState.tooltip = document.getElementById('tooltip');
    appState.loaderElement = document.getElementById('loader');
    appState.focusedPlanetElement = document.getElementById('focused-planet');
    appState.speedControlsContainer = document.getElementById('speed-controls-container');
    appState.speedSlidersDiv = document.getElementById('speed-sliders');
    appState.toggleSpeedButton = document.getElementById('toggle-speed-controls');
    appState.pauseResumeBtn = document.getElementById('pause-resume-btn');
    appState.resetBtn = document.getElementById('reset-btn');

    // Setup core scene components
    setupScene(appState, loadingManager);

    // Create UI Panels
    createInfoPanel(appState);

    // Create 3D objects
    createSolarSystem(appState, textureLoader);

    // Setup all event listeners
    setupEventListeners(appState);

}

// --- Start the application ---
init(); // Call initialization function