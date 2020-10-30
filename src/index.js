/**
 * Assignment for Linguaggi per la Rete
 * @author Andrea Roveroni <880092@stud.unive.it>
 */

window.onload = function () {
    /** If false, the time is paused */
    var play = true;

    /** All the celestail bodies created */
    var celestialBodies = [];

    var scene = new THREE.Scene();

    var camera = new Camera(scene);

    var sun = new CelestialBody({ radius: 2, scene, isEmissive: true, texture: 'sun.jpg', orbitingSpeed: 0 });

    var earth = new CelestialBody({
        radius: 0.6,
        celestialBody: sun,
        texture: 'earth.jpg',
        color: 'green',
        orbitingDistance: 6,
        orbitingSpeed: 90,
    });

    var moon = new CelestialBody({
        radius: 0.2,
        celestialBody: earth,
        texture: 'moon.jpg',
        color: 'grey',
        orbitingDistance: 1.2,
        orbitingSpeed: 180,
    });

    var mars = new CelestialBody({
        radius: 0.5,
        celestialBody: sun,
        orbitingDistance: 8,
        orbitingSpeed: 70,
        texture: 'mars.jpg',
        color: 'red',
    });

    var jupiter = new CelestialBody({
        radius: 1.5,
        celestialBody: sun,
        orbitingDistance: 15,
        orbitingSpeed: 30,
        texture: 'jupiter.jpg',
        color: 'orange',
    });

    var ganymede = new CelestialBody({
        radius: 0.4,
        celestialBody: jupiter,
        orbitingDistance: 3,
        orbitingSpeed: 60,
        texture: 'ganymede.jpg',
        color: 'blue',
    });

    var saturn = new CelestialBody({
        radius: 1.2,
        celestialBody: sun,
        orbitingDistance: 22,
        orbitingSpeed: 20,
        color: '#d4b663',
        texture: 'saturn.jpg',
    });

    // Adding some random satellites to saturn
    for (var i = 0; i < 10; i++) {
        celestialBodies.push(
            new CelestialBody({
                radius: Math.random() * 0.2,
                celestialBody: saturn,
                orbitingDistance: Math.random() * 2 + 1.5,
                orbitingSpeed: Math.random() * 50 + 10,
                color: '#d4b663',
            })
        );
    }

    // Asteroid belt
    for (var i = 0; i < 30; i++) {
        celestialBodies.push(
            new CelestialBody({
                radius: Math.random() * 0.2,
                celestialBody: sun,
                orbitingDistance: Math.random() + 10,
                orbitingSpeed: Math.random() * 10 + 50,
                color: '#bababa',
                createOrbitRing: false,
            })
        );
    }

    celestialBodies.push(sun);
    celestialBodies.push(earth);
    celestialBodies.push(moon);
    celestialBodies.push(mars);
    celestialBodies.push(jupiter);
    celestialBodies.push(ganymede);
    celestialBodies.push(saturn);

    //Sun Light
    var pointLight = new THREE.PointLight('white', 1);
    scene.add(pointLight);

    //Added a directional light because the scene was too dark
    var directionalLight = new THREE.DirectionalLight('white', 0.8);
    directionalLight.matrix.makeRotationX(-Math.PI);
    scene.add(directionalLight);

    //Renderer
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight); //Aspect ratio
    document.body.appendChild(renderer.domElement); //Adding to DOM

    /** The rendering function */
    var render_scene = function () {
        var now = Date.now();

        /** Time passed from the last frame */
        var deltaTime = now - (render_scene.time || now);

        // Date object of current frame
        render_scene.time = now;

        // The execution time stores the total milliseconds since the start of the scene
        if (render_scene.executionTime == undefined) {
            render_scene.executionTime = 0;
        }

        if (play) {
            render_scene.executionTime += deltaTime;
            for (let cel of celestialBodies) {
                cel.orbitStep(render_scene.executionTime);
            }
        }

        requestAnimationFrame(render_scene);
        renderer.render(scene, camera.camera);
    };

    render_scene();

    // Listening to keyboard events
    window.addEventListener('keypress', (e) => {
        switch (e.code) {
            case 'Space': {
                e.preventDefault();
                play = !play;
                break;
            }
            case 'KeyT': {
                for (let cel of celestialBodies) {
                    cel.toggleOrbitVisible();
                }
                break;
            }
            case 'KeyH': {
                var el = document.querySelector('#ui');
                el.style.display = el.style.display == 'none' ? 'block' : 'none';
                break;
            }
        }
    });
};
