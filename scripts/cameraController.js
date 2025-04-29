import * as THREE from 'three';

// Helper function to update spherical coordinates from current offset
function updateSphericalFromOffset(appState) {
    appState.sphericalCoords.setFromVector3(appState.cameraOffset);
}

// Helper function to update offset from spherical coordinates
function updateOffsetFromSpherical(appState) {
    appState.cameraOffset.setFromSpherical(appState.sphericalCoords);
}

// --- Camera Event Handlers ---

// Function for mouse wheel zoom while tracking
export function handleMouseWheel(event, appState) {
    if (appState.isCameraFollowing && appState.trackedObject) {
        event.preventDefault();
        const delta = Math.sign(event.deltaY);
        const zoomFactor = 1 + (delta * 0.05);
        
        const targetPosition = new THREE.Vector3();
        appState.trackedObject.getWorldPosition(targetPosition);
        
        updateSphericalFromOffset(appState);
        appState.sphericalCoords.radius *= zoomFactor;
        appState.sphericalCoords.radius = Math.max(2, Math.min(appState.sphericalCoords.radius, 1000));
        updateOffsetFromSpherical(appState);
        
        appState.camera.position.copy(targetPosition).add(appState.cameraOffset);
        appState.camera.lookAt(targetPosition);
        
        return false;
    }
}

// Handle mouse down for orbital movement
export function handleMouseDown(event, appState) {
    if (appState.isCameraFollowing && appState.trackedObject) {
        appState.isDragging = true;
        appState.previousMousePosition.x = event.clientX;
        appState.previousMousePosition.y = event.clientY;
        updateSphericalFromOffset(appState);
    }
}

// Handle mouse up to stop orbital movement
export function handleMouseUp(appState) {
    appState.isDragging = false;
}

// Handle orbital movement when dragging during follow mode
export function handleCameraOrbit(event, appState) {
    if (appState.isDragging && appState.isCameraFollowing && appState.trackedObject) {
        const deltaX = event.clientX - appState.previousMousePosition.x;
        const deltaY = event.clientY - appState.previousMousePosition.y;
        
        appState.previousMousePosition.x = event.clientX;
        appState.previousMousePosition.y = event.clientY;
        
        updateSphericalFromOffset(appState);
        appState.sphericalCoords.theta -= deltaX * 0.01;
        appState.sphericalCoords.phi = Math.max(0.1, Math.min(Math.PI - 0.1, appState.sphericalCoords.phi - deltaY * 0.01));
        updateOffsetFromSpherical(appState);
        
        const targetPosition = new THREE.Vector3();
        appState.trackedObject.getWorldPosition(targetPosition);
        
        appState.camera.position.copy(targetPosition).add(appState.cameraOffset);
        appState.camera.lookAt(targetPosition);
    }
}

// Function to toggle camera follow mode
export function toggleCameraFollow(appState) {
    if (appState.trackedObject && appState.trackedObject.name !== 'Sun') {
        appState.isCameraFollowing = !appState.isCameraFollowing;
        appState.controls.enabled = !appState.isCameraFollowing;
        
        if (appState.isCameraFollowing) {
            const targetPosition = new THREE.Vector3();
            appState.trackedObject.getWorldPosition(targetPosition);
            appState.previousTargetPosition.copy(targetPosition);
            appState.cameraOffset.copy(new THREE.Vector3().subVectors(appState.camera.position, targetPosition));
        }
    }
}

// Update camera position if following an object
export function updateCameraFollow(appState) {
    if (appState.trackedObject && appState.isCameraFollowing && appState.trackedObject.name !== 'Sun') {
        const currentTargetPosition = new THREE.Vector3();
        appState.trackedObject.getWorldPosition(currentTargetPosition);
        
        const positionDelta = new THREE.Vector3().subVectors(
            currentTargetPosition, 
            appState.previousTargetPosition
        );
        
        appState.camera.position.add(positionDelta);
        appState.previousTargetPosition.copy(currentTargetPosition);
        appState.camera.lookAt(currentTargetPosition);
    }
} 