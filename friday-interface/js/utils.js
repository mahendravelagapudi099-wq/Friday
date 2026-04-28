/**
 * Utility functions for 3D math and neural distribution.
 */

export const randomRange = (min, max) => Math.random() * (max - min) + min;

export const getSpherePoint = (radius) => {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    return { x, y, z };
};

export const lerp = (a, b, t) => a + (b - a) * t;
