export const MIN_SPEED = 0.0001; // Minimum possible speed (almost stationary)
export const MAX_SPEED = 0.05;  // Maximum possible speed (adjust as needed)
export const SLIDER_MIN = 0;
export const SLIDER_MAX = 100;

// Texture URLs
export const textures = {
    sun: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Solarsystemscope_texture_2k_sun.jpg',
    mercury: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Solarsystemscope_texture_2k_mercury.jpg',
    venus: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Solarsystemscope_texture_2k_venus_atmosphere.jpg',
    earth: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    moon: 'https://threejs.org/examples/textures/planets/moon_1024.jpg',
    mars: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Solarsystemscope_texture_2k_mars.jpg',
    jupiter: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Solarsystemscope_texture_2k_jupiter.jpg',
    saturn: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Solarsystemscope_texture_2k_saturn.jpg',
    saturnRing: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Solarsystemscope_texture_2k_saturn_ring_alpha.png',
    uranus: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Solarsystemscope_texture_2k_uranus.jpg',
    neptune: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Solarsystemscope_texture_2k_neptune.jpg'
};

// Planet data configuration
export const planetData = [
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
export const celestialBodyInfo = {
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