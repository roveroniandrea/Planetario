/** Relative assets' folder location */
const assetsFolder = 'assets';

window.onload = function () {
    /** If false, the time is paused */
    var play = true;

    /** All the celestail bodies created */
    var celestialBodies = [];

    /** Camera movement speed */
    var cameraSpeed = 0.3;

    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.matrixAutoUpdate = false;
    camera.matrix = new THREE.Matrix4().makeTranslation(0, 15, 12).multiply(new THREE.Matrix4().makeRotationX((-Math.PI / 2) * 0.5));
    scene.add(camera);

    var sun = new CelestialBody({ name: 'Sun', radius: 2, scene, isEmissive: true, texture: 'sun.jpg', orbitingSpeed: 0 });

    var earth = new CelestialBody({
        name: 'Earth',
        radius: 0.6,
        celestialBody: sun,
        texture: 'earth.jpg',
        orbitingDistance: 6,
        orbitingSpeed: 90,
    });

    var moon = new CelestialBody({
        name: 'Moon',
        radius: 0.2,
        celestialBody: earth,
        texture: 'moon.jpg',
        orbitingDistance: 1.2,
        orbitingSpeed: 180,
    });

    var mars = new CelestialBody({
        name: 'Mars',
        radius: 0.5,
        celestialBody: sun,
        orbitingDistance: 8,
        orbitingSpeed: 70,
        texture: 'mars.jpg',
    });

    celestialBodies.push(sun);
    celestialBodies.push(earth);
    celestialBodies.push(moon);
    celestialBodies.push(mars);

    //Light
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 2, 1);
    scene.add(directionalLight);

    //Renderer
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight); //Aspect ratio
    document.body.appendChild(renderer.domElement); //Adding to DOM

    //Rendering function
    var render_scene = function () {
        var now = Date.now();
        /** Time passed from the last frame */
        var dt = now - (render_scene.time || now);

        // Date object of current frame
        render_scene.time = now;

        if (render_scene.executionTime == undefined) {
            render_scene.executionTime = 0;
        }

        if (play) {
            render_scene.executionTime += dt;
            for (let cel of celestialBodies) {
                cel.orbitStep(dt, render_scene.executionTime);
            }
        }
        requestAnimationFrame(render_scene);
        renderer.render(scene, camera);
    };

    render_scene();

    window.addEventListener('keypress', (e) => {
        switch (e.code) {
            case 'Space': {
                play = !play;
                break;
            }
            case 'KeyT': {
                for (let cel of celestialBodies) {
                    cel.toggleOrbitVisible();
                }
                break;
            }
        }
    });

    window.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW': {
                camera.matrix.multiply(new THREE.Matrix4().makeTranslation(0, 0, -cameraSpeed));
                break;
            }
            case 'KeyS': {
                camera.matrix.multiply(new THREE.Matrix4().makeTranslation(0, 0, cameraSpeed));
                break;
            }
            case 'KeyA': {
                camera.matrix.multiply(new THREE.Matrix4().makeTranslation(-cameraSpeed, 0, 0));
                break;
            }
            case 'KeyD': {
                camera.matrix.multiply(new THREE.Matrix4().makeTranslation(cameraSpeed, 0, 0));
                break;
            }
            case 'KeyQ': {
                camera.matrix.multiply(new THREE.Matrix4().makeTranslation(0, -cameraSpeed, 0));
                break;
            }
            case 'KeyE': {
                camera.matrix.multiply(new THREE.Matrix4().makeTranslation(0, cameraSpeed, 0));
                break;
            }
        }
    });
};

/** Makes a celestial body
 * @param name The name of the celestial body
 * @param radius The radius of the body
 * @param celestialBody If not null specifies the parent celestial body to rotate around
 * @param orbitingSpeed The speed of the orbit in degrees/sec
 * @param scene The scene to render in. Note that either celestialBody or scene must be provided
 * @param color The color of the celestial body
 * @param texture The name of the texture of the body (.extension included)
 * @param isEmissive If true, the body will emit light
 */
var CelestialBody = function ({
    name,
    radius,
    celestialBody = null,
    orbitingSpeed = 0,
    orbitingDistance = 0,
    scene = null,
    color = '',
    texture = '',
    isEmissive = false,
}) {
    this.name = name;

    /** Sets the mesh of the object */
    var setMesh = () => {
        // Load texture if passed
        var loadedTexture = texture ? new THREE.TextureLoader().load(assetsFolder + '/' + texture) : null;

        //Sphere geometry
        var geometry = new THREE.SphereGeometry(radius, 20, 20);

        //Material
        var material = new THREE.MeshLambertMaterial({
            color,
            map: loadedTexture,
            ...(isEmissive && loadedTexture ? { emissive: 'white', emissiveMap: loadedTexture } : {}),
        });

        /**The mesh used by three.js*/
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.matrixAutoUpdate = false;

        // Orbiting around parent celestial body or in scene
        if (celestialBody) {
            celestialBody.mesh.add(this.mesh);
        } else {
            if (scene) {
                scene.add(this.mesh);
            } else {
                throw 'Either celestialBody or scene must be provided!';
            }
        }
    };

    /** Creates a mesh for the orbit ring */
    var setRing = () => {
        if (celestialBody) {
            var ringSize = 0.1;
            var ringGeometry = new THREE.RingGeometry(orbitingDistance - ringSize / 2, orbitingDistance + ringSize / 2, 40);
            var ringMaterial = new THREE.MeshBasicMaterial({ color: color || 'white', side: THREE.DoubleSide });
            this.orbitRing = new THREE.Mesh(ringGeometry, ringMaterial);
            this.orbitRing.matrixAutoUpdate = false;
            this.orbitRing.matrix = new THREE.Matrix4().makeRotationX(Math.PI / 2);
            celestialBody.mesh.add(this.orbitRing);
        }
    };

    setMesh();
    setRing();

    /** Makes the celestial body orbit
     * @param deltaTime Milliseconds from the last frame
     * @param executionTime Milliseconds from the start of the scene
     */
    this.orbitStep = function (deltaTime, executionTime) {
        var radiansSpeed = (orbitingSpeed * Math.PI * 2) / 360;
        var rot = new THREE.Matrix4().makeRotationY((radiansSpeed * executionTime) / 1000);
        var transl = new THREE.Matrix4().makeTranslation(orbitingDistance, 0, 0);
        this.mesh.matrix = rot.multiply(transl);
    };

    /** Toggles orbit ring visibility */
    this.toggleOrbitVisible = function () {
        if (this.orbitRing) {
            this.orbitRing.visible = !this.orbitRing.visible;
        }
    };
};
