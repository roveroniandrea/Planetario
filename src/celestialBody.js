/**
 * Assignment for Linguaggi per la Rete 
 * @author Andrea Roveroni <880092@stud.unive.it>
 */

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
        var loadedTexture = texture ? new THREE.TextureLoader().load('assets/' + texture) : null;

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

    // Calculating orbiting speed in radians
    var radiansSpeed = (orbitingSpeed * Math.PI * 2) / 360;

    // A random offset is added to start the celestial body in a random angle
    var radiansOffset = Math.random() * 2 * Math.PI;

    /** Makes the celestial body orbit
     * @param executionTime Milliseconds from the start of the scene
     */
    this.orbitStep = function (executionTime) {
        var rot = new THREE.Matrix4().makeRotationY((radiansSpeed * executionTime) / 1000 + radiansOffset);
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
