const assetsFolder = 'assets';

window.onload = function () {
    var play = true;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    var celestialBodies = [];
    camera.matrixAutoUpdate = false;
    camera.matrix = new THREE.Matrix4().makeTranslation(0, 15, 12).multiply(new THREE.Matrix4().makeRotationX((-Math.PI / 2) * 0.5));
    scene.add(camera);

    var sun = new CelestialBody({ radius: 2, scene, isEmissive: true, texture: 'sun.jpg', orbitingSpeed: 0 });

    var earth = new CelestialBody({ radius: 0.6, celestialBody: sun, scene, texture: 'earth.jpg', orbitingDistance: 6, orbitingSpeed: 90 });

    var moon = new CelestialBody({
        radius: 0.2,
        celestialBody: earth,
        texture: 'moon.jpg',
        scene,
        orbitingDistance: 1.2,
        orbitingSpeed: 180,
    });

    var mars = new CelestialBody({
        radius: 0.5,
        scene,
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
    directionalLight.position.set(0, 2, 1); // Setto la posizione e lo rendo con lunghezza 1
    scene.add(directionalLight);

    //Renderer
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight); //Aspect ratio
    document.body.appendChild(renderer.domElement); //Lo aggiungo al DOM

    //Funzione di rendering
    var render_scene = function () {
        var now = Date.now();
        var dt = now - (render_scene.time || now); //Tempo trascorso tra due chiamate del renderer

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
        requestAnimationFrame(render_scene); // Renderizza in base al tempo di refresh dello schermo senza che usiamo interval
        renderer.render(scene, camera);
    };

    render_scene();

    window.addEventListener('keypress', (e) => {
        if (e.code == 'Space') {
            play = !play;
        }
    });
};

/** Makes a celestial body
 * @param name The name of the celestial body
 * @param radius The radius of the body
 * @param celestialBody If not null specifies the parent celestial body to rotate around
 * @param orbitingSpeed The speed of the orbit in degrees/sec
 * @param scene The scene to render in
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
    scene,
    color = '',
    texture = '',
    isEmissive = false,
}) {
    // Carico la texture se fornita
    var loadedTexture = texture ? new THREE.TextureLoader().load(assetsFolder + '/' + texture) : null;

    //Geometry della sfera
    var geometry = new THREE.SphereGeometry(radius, 20, 20);

    //Materiale
    var material = new THREE.MeshLambertMaterial({
        color,
        map: loadedTexture,
        ...(isEmissive && loadedTexture ? { emissive: 'white', emissiveMap: loadedTexture } : {}),
    });

    /**The mesh used by three.js*/
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.matrixAutoUpdate = false;

    if (celestialBody) {
        celestialBody.mesh.add(this.mesh);
    } else {
        scene.add(this.mesh);
    }

    if (celestialBody) {
        var ringSize = 0.1;
        var ringGeometry = new THREE.RingGeometry(orbitingDistance - ringSize / 2, orbitingDistance + ringSize / 2, 40);
        var ringMaterial = new THREE.MeshBasicMaterial({ color: color || 'white', side: THREE.DoubleSide });
        this.orbitRing = new THREE.Mesh(ringGeometry, ringMaterial);
        this.orbitRing.matrixAutoUpdate = false;
        this.orbitRing.matrix = new THREE.Matrix4().makeRotationX(Math.PI / 2);
        celestialBody.mesh.add(this.orbitRing);
    }

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

    this.setOrbitVisible = function (visible) {
        if (this.orbitRing) {
            this.orbitRing.visible = visible;
        }
    };
};
