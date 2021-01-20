# Planetarium

### Author Andrea Roveroni mat. 880092

## File organization

The code is divided into three files located in src folder:

1. `index.js` Is the main file
2. `celestialBody.js` Contains the CelestialBody funtion used to create and manage all the planets and satellites in the scene
3. `camera.js` Handles the creation of a camera and its controls (dragging, rotating, zooming)

## Objects in the scene

The scene contains the following objects:

-   A `camera` with an audioListener
-   All the celestial bodies (sun, planets and satellites) with their orbits
-   A `point light` simulating the sun light
-   A `directional light` to light up the scene. I've noticed that using only the point light the scene was too dark
-   A `skybox`, consisting in a huge cube with textures on it's faces

## CelestialBody

A celestial body consists in a mesh with a `SphereGeometry` and a texture applied on it. If no texture is specified, the mesh is painted with a single color.

A celestial body can rotate around another celestial body or be fixed at the center of the scene. If the body orbits around another one, a `RingGeometry` is created to visualize its orbit.

The arguments that can be passed to the CelestialBody function are:
-   `radius` The radius of the body
-   `celestialBody` If not null specifies the parent celestial body to rotate around
-   `orbitingSpeed` The speed of the orbit in degrees/sec
-   `scene` The scene to render in. Note that either celestialBody or scene must be provided
-   `color` The color of the celestial body
-   `texture` The name of the texture of the celestial body (.extension included)
-   `isEmissive` If true, the body will emit light
-   `createOrbitRing` If false, the orbit ring is not created (useful for group of asteroids or satellites)

## Controls

There are some keys to interact with the scene:

-   `Space` To play and pause the rotations
-   `T` To toggle the visibility of the orbits
-   `E` To set the camera to some predefined visuals
-   `H` To hide and show the UI

In addition the camera can be

-   Moved by dragging with the left mouse button
-   Rotated by dragging with the right mouse button
-   Zoomed by using the mouse wheel

## Other

There may be some issues when trying to play the audio caused by Chrome policies

The UI is created with HTML elements with `position: absolute` property

Emissive materials will not light other materials but only themselves

No libraries other than ThreeJS have been used
