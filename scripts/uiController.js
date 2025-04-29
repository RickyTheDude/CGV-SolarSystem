import * as THREE from 'three';
import { MIN_SPEED, MAX_SPEED, celestialBodyInfo } from './constants.js';

// --- ** Function to Create Speed Controls ** ---
export function createSpeedControls(appState) {
    if (!appState.speedSlidersDiv) return;
    appState.speedSlidersDiv.innerHTML = ''; // Clear previous controls if any
    
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
    globalValueInput.value = appState.globalSpeedMultiplier.toFixed(2) + 'x';
    globalValueInput.setAttribute('contenteditable', 'true');
    globalValueInput.setAttribute('spellcheck', 'false');
    
    const increaseGlobalBtn = document.createElement('button');
    increaseGlobalBtn.className = 'speed-btn';
    increaseGlobalBtn.textContent = '+';
    
    // Add event listeners
    decreaseGlobalBtn.addEventListener('click', () => {
        appState.globalSpeedMultiplier = Math.max(0.1, (parseFloat(appState.globalSpeedMultiplier) - 0.1).toFixed(2));
        globalValueInput.value = appState.globalSpeedMultiplier + 'x';
    });
    
    increaseGlobalBtn.addEventListener('click', () => {
        appState.globalSpeedMultiplier = Math.min(5.0, (parseFloat(appState.globalSpeedMultiplier) + 0.1).toFixed(2));
        globalValueInput.value = appState.globalSpeedMultiplier + 'x';
    });
    
    // Add input event for direct editing
    globalValueInput.addEventListener('blur', function() {
        let newValue = this.value.replace('x', '');
        newValue = parseFloat(newValue);
        
        if (isNaN(newValue)) {
            this.value = appState.globalSpeedMultiplier.toFixed(2) + 'x';
            return;
        }
        
        newValue = Math.max(0.1, Math.min(5.0, newValue));
        appState.globalSpeedMultiplier = parseFloat(newValue.toFixed(2));
        this.value = appState.globalSpeedMultiplier + 'x';
    });
    
    // Handle Enter key press
    globalValueInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            this.blur();
            e.preventDefault();
        }
    });
    
    globalControls.appendChild(decreaseGlobalBtn);
    globalControls.appendChild(globalValueInput);
    globalControls.appendChild(increaseGlobalBtn);
    
    globalSpeedDiv.appendChild(globalLabel);
    globalSpeedDiv.appendChild(globalControls);
    appState.speedSlidersDiv.appendChild(globalSpeedDiv);
    
    // Find planet meshes to create controls for
    const planetMeshes = appState.celestialBodies.filter(obj => obj.userData.isPlanet);
    
    planetMeshes.forEach(planetMesh => {
        const planetName = planetMesh.name;
        const currentSpeed = planetMesh.userData.speed;
        
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
            const targetMesh = appState.celestialBodies.find(obj => obj.name === planetName);
            if (targetMesh) {
                const newSpeed = Math.max(MIN_SPEED, (targetMesh.userData.speed - 0.001));
                targetMesh.userData.speed = parseFloat(newSpeed.toFixed(4));
                valueInput.value = newSpeed.toFixed(4);
                
                if (planetName === 'Earth') {
                    const moonMesh = targetMesh.getObjectByName('Moon');
                    if (moonMesh) {
                        moonMesh.userData.speed = parseFloat(newSpeed) * 5;
                    }
                }
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            const targetMesh = appState.celestialBodies.find(obj => obj.name === planetName);
            if (targetMesh) {
                const newSpeed = Math.min(MAX_SPEED, (parseFloat(targetMesh.userData.speed) + 0.001));
                targetMesh.userData.speed = parseFloat(newSpeed.toFixed(4));
                valueInput.value = newSpeed.toFixed(4);
                
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
            const newValue = parseFloat(this.value);
            const targetPlanetName = this.dataset.planetName;
            
            if (isNaN(newValue)) {
                const targetMesh = appState.celestialBodies.find(obj => obj.name === targetPlanetName);
                if (targetMesh) {
                    this.value = targetMesh.userData.speed.toFixed(4);
                }
                return;
            }
            
            const targetMesh = appState.celestialBodies.find(obj => obj.name === targetPlanetName);
            if (targetMesh) {
                const clampedValue = Math.max(MIN_SPEED, Math.min(MAX_SPEED, newValue));
                targetMesh.userData.speed = parseFloat(clampedValue.toFixed(4));
                this.value = clampedValue.toFixed(4);
                
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
                this.blur();
                e.preventDefault();
            }
        });
        
        controls.appendChild(decreaseBtn);
        controls.appendChild(valueInput);
        controls.appendChild(increaseBtn);
        
        itemDiv.appendChild(label);
        itemDiv.appendChild(controls);
        appState.speedSlidersDiv.appendChild(itemDiv);
    });
}

// --- Function to Create Info Panel ---
export function createInfoPanel(appState) {
    appState.infoPanel = document.createElement('div');
    appState.infoPanel.id = 'planet-info-panel';
    appState.infoPanel.className = 'hidden';

    const header = document.createElement('div');
    header.className = 'info-panel-header';

    appState.infoPanelTitle = document.createElement('h2');
    appState.infoPanelTitle.className = 'info-panel-title';

    appState.infoPanelCloseBtn = document.createElement('button');
    appState.infoPanelCloseBtn.className = 'info-panel-close';
    appState.infoPanelCloseBtn.innerHTML = '×';
    appState.infoPanelCloseBtn.addEventListener('click', () => {
        appState.infoPanel.classList.add('hidden');
    });

    header.appendChild(appState.infoPanelTitle);
    header.appendChild(appState.infoPanelCloseBtn);

    appState.infoPanelContent = document.createElement('div');
    appState.infoPanelContent.className = 'info-panel-content';

    appState.infoPanel.appendChild(header);
    appState.infoPanel.appendChild(appState.infoPanelContent);

    document.body.appendChild(appState.infoPanel);
}

// Function to show planet info
export function showPlanetInfo(appState, objectName) {
    if (!appState.infoPanel || !celestialBodyInfo[objectName]) return;

    const info = celestialBodyInfo[objectName];
    
    appState.infoPanelTitle.textContent = objectName;

    let contentHTML = `
        <div class="info-type">${info.type}</div>
        <p class="info-description">${info.description}</p>
        <div class="info-data-grid">
    `;

    for (const [key, value] of Object.entries(info)) {
        if (key !== 'type' && key !== 'description' && key !== 'facts') {
            contentHTML += `
                <div class="info-data-label">${key.charAt(0).toUpperCase() + key.slice(1)}:</div>
                <div class="info-data-value">${value}</div>
            `;
        }
    }
    contentHTML += `</div>`;
    
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
    
    appState.infoPanelContent.innerHTML = contentHTML;
    appState.infoPanel.classList.remove('hidden');
}

// --- Toggle Play/Pause Function ---
export function togglePlayPause(appState) {
    appState.isPaused = !appState.isPaused;
    
    if (appState.pauseResumeBtn) {
        const playIcon = appState.pauseResumeBtn.querySelector('.play-icon');
        const pauseIcon = appState.pauseResumeBtn.querySelector('.pause-icon');
        
        if (playIcon && pauseIcon) {
            if (appState.isPaused) {
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
                appState.pauseResumeBtn.title = "Resume Simulation";
            } else {
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
                appState.pauseResumeBtn.title = "Pause Simulation";
            }
        }
    }
}

// --- Reset Simulation Function ---
export function resetSimulation(appState) {
    console.log("Resetting simulation...");
    
    appState.scene.traverse((object) => {
        if (object.userData.isPlanet) {
            const data = object.userData;
            const initialState = appState.initialPlanetState.find(state => state.name === object.name);
            
            if (initialState) {
                data.orbitAngle = initialState.orbitAngle;
                if (data.group) {
                    data.group.position.set(initialState.position.x, initialState.position.y, initialState.position.z);
                }
                object.rotation.y = initialState.rotation.y;
                
                const moon = object.getObjectByName('Moon');
                if (moon) {
                    const moonInitialState = appState.initialPlanetState.find(state => state.name === 'Moon' && state.parentName === object.name);
                    if (moonInitialState) {
                        moon.userData.orbitAngle = moonInitialState.orbitAngle;
                        moon.position.set(moonInitialState.position.x, moonInitialState.position.y, moonInitialState.position.z);
                        moon.rotation.y = moonInitialState.rotation.y;
                    }
                }
            }
        } else if (object.name === 'Sun') {
            const initialState = appState.initialPlanetState.find(state => state.name === 'Sun');
            if (initialState) {
                object.rotation.y = initialState.rotation.y;
            }
        }
    });
    
    // Reset camera to initial position and target Sun
    appState.camera.position.set(0, 80, 180);
    appState.controls.target.set(0, 0, 0);
    appState.trackedObject = appState.scene.getObjectByName('Sun');
    appState.isCameraFollowing = false;
    appState.controls.enabled = true;
    if(appState.focusedPlanetElement) appState.focusedPlanetElement.textContent = `Tracking: Sun`;
    
    // Optionally, unpause the simulation if it was paused
    if (appState.isPaused) {
        togglePlayPause(appState); // Pass appState here
    }
} 