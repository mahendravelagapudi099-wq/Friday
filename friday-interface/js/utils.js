/**
 * Utility functions for 3D math and neural distribution.
 */

// Simple seeded random to ensure deterministic layout
let seed = 42;
export const setSeed = (s) => { seed = s; };
export const seededRandom = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
};

export const randomRange = (min, max) => seededRandom() * (max - min) + min;

export const getSpherePoint = (radius) => {
    const u = seededRandom();
    const v = seededRandom();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    return { x, y, z };
};

export const lerp = (a, b, t) => a + (b - a) * t;
