import * as THREE from 'three'
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js'
import EventEmitter from './Utils/EventEmitter';

export default class Camera extends EventEmitter {
    constructor(_options) {
        super();

        this.canvas = _options.canvas;
        this.renderer = _options.renderer;
        this.sizes = _options.sizes;
        this.time = _options.time;
        this.event = _options.event;

        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        this.origin = new THREE.Vector3(0, 0, 1000);
        this.target = new THREE.Vector3(0, 0, 0);

        this.setInstance();
        this.setOrbitControls();
    }

    setInstance() {
        let perspective = 1200;
        const fov = (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;

        this.instance = new THREE.PerspectiveCamera(fov, this.sizes.viewport.width / this.sizes.viewport.height, 0.1, perspective);
        this.instance.position.copy(this.origin);
        this.container.add(this.instance);

        if (debug) {
            const debugFolder = gui.addFolder('camera');
            debugFolder.add(this.instance, 'aspect').max(5).min(0.1).step(0.001).onChange(() => {
                this.instance.updateProjectionMatrix();
            });
            debugFolder.add(this.instance, 'fov').max(135).min(0).step(1).onChange(() => {
                this.instance.updateProjectionMatrix();
            });
            this.debugFolder = debugFolder;
        }

        this.sizes.on(EventConst.RESIZE, () => {
            this.instance.aspect = this.sizes.viewport.width / this.sizes.viewport.height;
            this.instance.updateProjectionMatrix();
        })

        this.time.on(EventConst.TICK, () => {
            if (debug && this.orbitControls.enabled) {
                this.orbitControls.update();
            }
        })
    }

    setOrbitControls() {
        if (debug) {
            this.orbitControls = new OrbitControls(this.instance, this.renderer.domElement);
            this.orbitControls.enabled = false;
            this.orbitControls.enableKeys = false;
            this.orbitControls.zoomSpeed = 0.5;
            this.orbitControls.enableDamping = true;

            this.debugFolder.add(this.orbitControls, 'enabled').name('orbitControlsEnabled');
        }
    }
}