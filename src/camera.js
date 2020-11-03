/**
 * Assignment for Linguaggi per la Rete
 * @author Andrea Roveroni <880092@stud.unive.it>
 */

/**
 * Creates a new camera with dragging, rotating and zooming enabled
 * @param scene The scene to add the camera
 */
var Camera = function (scene) {
    /** Camera object */
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.matrixAutoUpdate = false;
    this.camera.matrix = new THREE.Matrix4().makeRotationX(-Math.PI / 4);

    /** The parent of the camera object */
    this.cameraParent = new THREE.Object3D();
    this.cameraParent.matrixAutoUpdate = false;
    this.cameraParent.matrix = new THREE.Matrix4().makeTranslation(0, 10, 15);

    scene.add(this.cameraParent);
    this.cameraParent.add(this.camera);

    /** Array of pre-set matrices for nice visuals */
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

    /** Audio listener attached to the camera */
    this.audioListener = new THREE.AudioListener();
    this.camera.add(this.audioListener);

    /** The current visual index */
    var currentVisual = 0;

    /** Sets the camera to the next visual */
    this.nextVisual = () => {
        currentVisual++;
        if (currentVisual >= this.cameraVisuals.length) {
            currentVisual = 0;
        }
        this.cameraParent.matrix = this.cameraVisuals[currentVisual].cameraParentMatrix.clone();
        this.camera.matrix = this.cameraVisuals[currentVisual].cameraMatrix.clone();
    };

    // Zoom on wheel event
    window.addEventListener('wheel', (e) => {
        this.camera.matrix.multiply(new THREE.Matrix4().makeTranslation(0, 0, Math.sign(e.deltaY) * 0.75));
    });

    // Handle mouse events
    window.addEventListener('mousemove', (e) => {
        if (e.buttons == 1) {
            /** Camera movement speed */
            var cameraSpeed = 0.2;

            this.cameraParent.matrix.multiply(new THREE.Matrix4().makeTranslation(0, 0, -Math.sign(e.movementY) * cameraSpeed));
            this.cameraParent.matrix.multiply(new THREE.Matrix4().makeTranslation(-Math.sign(e.movementX) * cameraSpeed, 0, 0));
        }
        if (e.buttons == 2) {
            /** Camera rotation speed */
            var cameraRotationSpeed = 0.015;
            this.camera.matrix.multiply(new THREE.Matrix4().makeRotationX(Math.sign(e.movementY) * cameraRotationSpeed));
            this.cameraParent.matrix.multiply(new THREE.Matrix4().makeRotationY(Math.sign(e.movementX) * cameraRotationSpeed));
        }
    });

    // Prevent context menu (on right click) to appear
    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Next visual on key press
    window.addEventListener('keypress', (e) => {
        if (e.code == 'KeyE') {
            this.nextVisual();
        }
    });
};
