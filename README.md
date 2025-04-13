# Interactive 3D Solar System Simulation 🌌


A 3D simulation of our solar system created for educational purposes as part of the CGV mini-project. The simulation allows users to explore the solar system with realistic planetary motion and visuals.

## Features

- 🌌 **Interactive 3D visualization** of the solar system with the Sun and 8 planets
- ⏱️ **Realistic orbital mechanics** with proper revolution speeds
- 🌍 **Planet-specific texture and bump mapping**
- 🍨 **Saturn's rings** with transparency and accurate illumination
- 📸 **Dynamic camera controls** for immersive exploration
- ✨ **Raycasting-based camera lock-in** on celestial bodies


## Tech Stack

- 🔹 **Three.js** - 3D rendering library for the web
- 🔹 **WebGL** - Hardware-accelerated rendering
- 🔹 **JavaScript ES6+** - Core programming language
- 🔹 **HTML5/CSS3** - Structure and styling

## Computer Graphics Concepts Implemented

- **3D Modeling and Rendering** - Creation and display of 3D sphere geometries
- **Texture Mapping** - Application of image textures to 3D objects
- **Bump Mapping** - Simulation of small-scale surface details without adding geometry
- **Normal Mapping** - Enhanced surface detail through normal vector manipulation
- **Skybox/Environment Mapping** - Cubemap background for realistic space environment
- **Bloom Effects** - Post-processing for light glow around bright objects
- **Camera Controls** - Orbital camera implementation for scene navigation
- **Raycasting** - Object selection through screen-to-world ray projection


## Installation and Usage

1. Clone the repository:
   ```
   git clone https://github.com/RickyTheDude/CGV-SolarSystem.git
   ```

2. Navigate to the project directory:
   ```
   cd CGV-SolarSystem
   ```

3. Open with a live server:
   - Using VS Code: Install "Live Server" extension and click "Go Live"
   - Using npm: `npm install -g live-server && live-server`

4. The simulation should open in your default browser.

## Controls

- ← **Left-click + drag**: Orbit the camera
- → **Right-click + drag**: Pan the camera
- ↥ **Scroll wheel**: Zoom in/out
- ✨ **Click on a planet**: Focus on that planet
- ⭐ **Double-click empty space**: Reset focus to the Sun

## Acknowledgments

- 🌍 Planet textures from [Wikimedia](https://commons.wikimedia.org/wiki/Category:Solar_System_Scope)
- 📚 [Three.js library](https://threejs.org/) and community for 3D rendering capabilities
- 🧠 Built using [Gemini 2.5 Pro](https://gemini.google.com/app) and [Claude 3.5 Sonnet](https://claude.ai/new) for custom logic

## License

This project is licensed under the **GNU GPL License** - see the LICENSE file for details.


