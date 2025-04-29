import * as THREE from 'three';
import { updateMouseCoords } from './utils.js';
import { handleMouseWheel, handleMouseDown, handleMouseUp, handleCameraOrbit } from './cameraController.js';
import { showPlanetInfo, togglePlayPause, resetSimulation } from './uiController.js';

function onWindowResize(appState) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    appState.camera.aspect = width / height;
    appState.camera.updateProjectionMatrix();

    appState.renderer.setSize(width, height);
    appState.composer.setSize(width, height);
}

function onMouseMove(event, appState) {
    // Handle tooltip positioning
    if (appState.tooltip) {
        appState.tooltip.style.left = `${event.clientX + 15}px`;
        appState.tooltip.style.top = `${event.clientY + 10}px`;
    }

    // Update mouse coordinates for raycasting
    updateMouseCoords(event, appState);

    // Check for hovering over objects for tooltip (only if not dragging)
    if (!appState.isDragging) {
        appState.raycaster.setFromCamera(appState.mouse, appState.camera);
        const intersects = appState.raycaster.intersectObjects(appState.scene.children, true);

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

        if (hoveredObject && appState.tooltip) {
            appState.tooltip.style.display = 'block';
            appState.tooltip.textContent = hoveredObject.name;
        } else if (appState.tooltip) {
            appState.tooltip.style.display = 'none';
        }
    }

    // Handle orbital movement when dragging
    handleCameraOrbit(event, appState);
}

function onClick(event, appState) {
    updateMouseCoords(event, appState);
    appState.raycaster.setFromCamera(appState.mouse, appState.camera);
    const intersects = appState.raycaster.intersectObjects(appState.scene.children, true);

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

            let objectToShowInfo = clickedObject; // Default to the clicked object
            let objectToTrack = clickedObject;

            if (clickedObject.userData.isMoon && clickedObject.parent?.userData?.isPlanet) {
                clickedObject.parent.getWorldPosition(targetPosition);
                objectToTrack = clickedObject.parent;
                objectToShowInfo = clickedObject; // Show moon info even if tracking parent
                console.log("Clicked moon, tracking parent:", objectToTrack.name);
            } else if (clickedObject.name === 'Sun') {
                targetPosition.set(0, 0, 0);
                objectToTrack = clickedObject;
            } else if (clickedObject.name === 'Saturn Rings') {
                 objectToShowInfo = clickedObject; // Show ring info
                 objectToTrack = clickedObject.parent; // Track Saturn
                 clickedObject.parent.getWorldPosition(targetPosition);
            } else if (clickedObject.name === 'Saturn') {
                 // Check if the click was *specifically* on the rings
                 let clickedRings = false;
                 for (let i = 0; i < intersects.length; i++) {
                     if (intersects[i].object.name === 'Saturn Rings') {
                         objectToShowInfo = intersects[i].object; // Show ring info
                         clickedRings = true;
                         break;
                     }
                 }
                 // If not clicking rings, show Saturn info and track Saturn
                 if (!clickedRings) {
                     objectToShowInfo = clickedObject;
                     objectToTrack = clickedObject;
                 }
            }
            
            appState.trackedObject = objectToTrack;
            showPlanetInfo(appState, objectToShowInfo.name);

            let focusName = appState.trackedObject.name;
            if (appState.focusedPlanetElement) appState.focusedPlanetElement.textContent = `Tracking: ${focusName}`;

            if (appState.trackedObject.name !== 'Sun') {
                appState.isCameraFollowing = true;
                appState.previousTargetPosition.copy(targetPosition);
                appState.cameraOffset.copy(new THREE.Vector3().subVectors(appState.camera.position, targetPosition));
                appState.controls.enabled = false;
            } else {
                appState.isCameraFollowing = false;
                appState.previousTargetPosition.set(0, 0, 0);
                appState.controls.enabled = true;
                appState.controls.target.copy(targetPosition);
            }
        }
    }
}

function onDoubleClick(event, appState) {
    updateMouseCoords(event, appState);
    appState.raycaster.setFromCamera(appState.mouse, appState.camera);
    const intersects = appState.raycaster.intersectObjects(appState.scene.children, true);

    if (intersects.length === 0) {
        console.log("Double clicked background - Focusing Sun");
        appState.controls.target.set(0, 0, 0);
        appState.trackedObject = appState.scene.getObjectByName('Sun');
        appState.isCameraFollowing = false;
        appState.controls.enabled = true;
        if (appState.focusedPlanetElement) appState.focusedPlanetElement.textContent = `Tracking: Sun`;
        // Optionally hide info panel on double click background
        if (appState.infoPanel) appState.infoPanel.classList.add('hidden');
    }
}

export function setupEventListeners(appState) {
    window.addEventListener('resize', () => onWindowResize(appState), false);
    window.addEventListener('click', (e) => onClick(e, appState), false);
    window.addEventListener('dblclick', (e) => onDoubleClick(e, appState), false);
    window.addEventListener('mousemove', (e) => onMouseMove(e, appState), false);
    window.addEventListener('wheel', (e) => handleMouseWheel(e, appState), false);
    window.addEventListener('mousedown', (e) => handleMouseDown(e, appState), false);
    window.addEventListener('mouseup', () => handleMouseUp(appState), false);

    // UI Button Listeners (if they exist)
    if (appState.pauseResumeBtn) {
        appState.pauseResumeBtn.addEventListener('click', () => togglePlayPause(appState));
    }
    if (appState.resetBtn) {
        appState.resetBtn.addEventListener('click', () => resetSimulation(appState));
    }
    if (appState.toggleSpeedButton && appState.speedSlidersDiv) {
        appState.toggleSpeedButton.addEventListener('click', () => {
            appState.speedSlidersDiv.classList.toggle('hidden');
            const isHidden = appState.speedSlidersDiv.classList.contains('hidden');
            appState.toggleSpeedButton.textContent = `Speed Controls ${isHidden ? '▼' : '▲'}`;
        });
    }
     // Help button listeners (already in init in original script, moved here for consistency)
     const helpButton = document.getElementById('help-button');
     const helpInfoPanel = document.getElementById('info'); 
     const closeInfoButton = document.getElementById('close-info');
     
     if (helpButton && helpInfoPanel) {
         helpButton.addEventListener('click', () => {
             helpInfoPanel.classList.toggle('hidden');
         });
     }
     
     if (closeInfoButton && helpInfoPanel) {
         closeInfoButton.addEventListener('click', () => {
             helpInfoPanel.classList.add('hidden');
         });
     }
} 