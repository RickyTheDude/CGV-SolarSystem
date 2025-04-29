export function updateMouseCoords(event, appState) {
    appState.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    appState.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
} 