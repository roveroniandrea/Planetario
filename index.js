const assetsFolder = 'assets';

window.onload = function () {
    var totalTime = 0;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    var celestialBodies = [];
    camera.matrixAutoUpdate = false;
    camera.matrix = new THREE.Matrix4().makeTranslation(0, 15, 12).multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2 * 0.5));
    scene.add(camera);

    var sun = new CelestialBody({ radius: 2, scene, isEmissive: true, texture: 'sun.jpg', orbitingSpeed: 0 });

    var earth = new CelestialBody({ radius: 0.6, celestialBody: sun, texture: 'earth.jpg', orbitingDistance: 6, orbitingSpeed: 90 });

    var moon = new CelestialBody({
        radius: 0.2,
        celestialBody: earth,
        texture: 'moon.jpg',
        orbitingDistance: 1.2,
        orbitingSpeed: 180,
    });

    celestialBodies.push(sun);
    celestialBodies.push(earth);
    celestialBodies.push(moon);

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
        var dt = (now - (render_scene.time || now)) / 1000; //Tempo trascorso tra due chiamate del renderer
        render_scene.time = now;

        totalTime += dt;
        requestAnimationFrame(render_scene); // Renderizza in base al tempo di refresh dello schermo senza che usiamo interval
        renderer.render(scene, camera);

        for (let cel of celestialBodies) {
            cel.orbitStep(dt, totalTime);
        }
    };

    render_scene();
};

/** Makes a celestial body
 * @param radius The radius of the body
 * @param celestialBody If not null specifies the parent celestial body to rotate around
 * @param orbitingSpeed The speed of the orbit in degrees/sec
 * @param scene The scene to render in. Please note that either an `celestialBody` or `scene` must be provided
 * @param color The color of the celestial body
 * @param texture The name of the texture of the body (.extension included)
 * @param isEmissive If true, the body will emit light
 */
var CelestialBody = function ({
    radius = 0,
    celestialBody = null,
    orbitingSpeed = 0,
    orbitingDistance = 0,
    scene = null,
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
        if (scene) {
            scene.add(this.mesh);
        } else {
            throw 'Must provide either celestialBody or scene!';
        }
    }

    /** Makes the celestial body orbit */
    this.orbitStep = function (deltaTime, sceneTime) {
        var radiansSpeed = (orbitingSpeed * Math.PI * 2) / 360;
        var rot = new THREE.Matrix4().makeRotationY(radiansSpeed * sceneTime);
        var transl = new THREE.Matrix4().makeTranslation(orbitingDistance, 0, 0);
        this.mesh.matrix = rot.multiply(transl);
    };
};
