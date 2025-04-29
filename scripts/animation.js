import * as THREE from 'three';
import { updateCameraFollow } from './cameraController.js';

export function startAnimation(appState) {
    function animate() {
        requestAnimationFrame(animate);

        const delta = appState.clock.getDelta();
        const elapsedTime = appState.clock.getElapsedTime();

        // Only update positions if simulation is not paused
        if (!appState.isPaused) {
            // Animate planet orbits and rotations
            appState.scene.traverse((object) => {
                 if (object.userData.isPlanet) {
                    const data = object.userData;
                    data.orbitAngle += delta * data.speed * appState.globalSpeedMultiplier;
                    const x = Math.cos(data.orbitAngle) * data.distance;
                    const z = Math.sin(data.orbitAngle) * data.distance;
                    if(data.group) data.group.position.set(x, 0, z);
    
                    object.rotation.y += delta * 0.1; // Planet self-rotation
    
                    const moon = object.getObjectByName('Moon');
                    if (moon && moon.userData.isMoon) {
                        moon.userData.orbitAngle += delta * moon.userData.speed * appState.globalSpeedMultiplier;
                        const moonX = Math.cos(moon.userData.orbitAngle) * moon.userData.orbitRadius;
                        const moonZ = Math.sin(moon.userData.orbitAngle) * moon.userData.orbitRadius;
                        moon.position.set(moonX, 0, moonZ);
                        moon.rotation.y += delta * 0.5; // Moon self-rotation
                    }
                } else if (object.name === 'Sun') {
                     object.rotation.y += delta * 0.01; // Sun self-rotation
                }
            });
            
            // Handle camera following
            updateCameraFollow(appState);
        }
    
        // Only update controls if they're enabled (not following a planet)
        if (appState.controls.enabled) {
            appState.controls.update();
        }
    
        // Render the scene using the EffectComposer
        appState.composer.render(delta);
    }
    animate(); // Start the loop
} 