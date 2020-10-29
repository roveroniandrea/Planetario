/** Relative assets' folder location */
const assetsFolder = 'assets';

window.onload = function () {
    /** If false, the time is paused */
    var play = true;

    /** All the celestail bodies created */
    var celestialBodies = [];

    var scene = new THREE.Scene();

    var camera = new Camera(scene);

    var sun = new CelestialBody({  radius: 2, scene, isEmissive: true, texture: 'sun.jpg', orbitingSpeed: 0 });

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
        orbitingDistance: 12,
        orbitingSpeed: 40,
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

    celestialBodies.push(sun);
    celestialBodies.push(earth);
    celestialBodies.push(moon);
    celestialBodies.push(mars);
    celestialBodies.push(jupiter);
    celestialBodies.push(ganymede);

    //Light
    var pointLight = new THREE.PointLight(0xffffff, 1);
    scene.add(pointLight);

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
        renderer.render(scene, camera.camera);
    };

    render_scene();

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

/** Makes a celestial body
 * @param radius The radius of the body
 * @param celestialBody If not null specifies the parent celestial body to rotate around
 * @param orbitingSpeed The speed of the orbit in degrees/sec
 * @param scene The scene to render in. Note that either celestialBody or scene must be provided
 * @param color The color of the celestial body
 * @param texture The name of the texture of the celestial body (.extension included)
 * @param isEmissive If true, the body will emit light
 */
var CelestialBody = function ({
    radius,
    celestialBody = null,
    orbitingSpeed = 0,
    orbitingDistance = 0,
    scene = null,
    color = '',
    texture = '',
    isEmissive = false,
}) {

    /** Sets the mesh of the object */
    var setMesh = () => {
        // Load texture if passed
        var loadedTexture = texture ? new THREE.TextureLoader().load(assetsFolder + '/' + texture) : null;

        //Sphere geometry
        var geometry = new THREE.SphereGeometry(radius, 20, 20);

        //Material
        var material = new THREE.MeshLambertMaterial({
            color: !loadedTexture ? color : null,
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
            var ringSize = 0.05;
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

/**
 * Creates a new camera with dragging, rotating and zooming enabled
 * @param scene The scene to add the camera
 */
var Camera = function (scene) {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.matrixAutoUpdate = false;
    this.camera.matrix = new THREE.Matrix4().makeRotationX(-Math.PI / 4);

    this.cameraParent = new THREE.Object3D();
    this.cameraParent.matrixAutoUpdate = false;
    this.cameraParent.matrix = new THREE.Matrix4().makeTranslation(0, 10, 15);

    scene.add(this.cameraParent);
    this.cameraParent.add(this.camera);

    this.cameraVisuals = [
        {
            cameraMatrix: this.camera.matrix.clone(),
            cameraParentMatrix: this.cameraParent.matrix.clone(),
        },
        {
            cameraMatrix: new THREE.Matrix4().makeRotationX(-Math.PI / 2),
            cameraParentMatrix: new THREE.Matrix4().makeTranslation(0, 15, 0),
        },
        {
            cameraMatrix: new THREE.Matrix4().makeRotationX(-Math.PI / 5),
            cameraParentMatrix: new THREE.Matrix4().makeTranslation(0, 3, 0),
        },
        {
            cameraMatrix: new THREE.Matrix4().makeRotationX(-Math.PI / 5),
            cameraParentMatrix: new THREE.Matrix4().makeTranslation(0, 6, 13),
        },
        {
            cameraMatrix: new THREE.Matrix4(),
            cameraParentMatrix: new THREE.Matrix4().makeTranslation(0, 0, 14),
        },
    ];
    var currentVisual = 0;

    this.nextVisual = () => {
        currentVisual++;
        if (currentVisual >= this.cameraVisuals.length) {
            currentVisual = 0;
        }
        this.cameraParent.matrix = this.cameraVisuals[currentVisual].cameraParentMatrix.clone();
        this.camera.matrix = this.cameraVisuals[currentVisual].cameraMatrix.clone();
    };

    window.addEventListener('wheel', (e) => {
        this.camera.matrix.multiply(new THREE.Matrix4().makeTranslation(0, 0, Math.sign(e.deltaY) * 0.75));
    });

    window.addEventListener('mousemove', (e) => {
        if (e.buttons == 1) {
            /** Camera movement speed */
            var cameraSpeed = 0.2;

            this.cameraParent.matrix.multiply(new THREE.Matrix4().makeTranslation(0, 0, -Math.sign(e.movementY) * cameraSpeed));
            this.cameraParent.matrix.multiply(new THREE.Matrix4().makeTranslation(-Math.sign(e.movementX) * cameraSpeed, 0, 0));
        }
        if (e.buttons == 2) {
            this.camera.matrix.multiply(new THREE.Matrix4().makeRotationX(Math.sign(e.movementY) * 0.015));
        }
    });

    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    window.addEventListener('keypress', (e) => {
        if (e.code == 'KeyE') {
            this.nextVisual();
        }
    });
};
