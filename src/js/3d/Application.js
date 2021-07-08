import * as THREE from 'three'
import * as dat from 'dat.gui'

// import Stats from 'stats.js'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'

import Camera from './Camera.js'
import World from './Objects/World.js'
import Resources from './Resources.js'
import CommonEvent from './Utils/CommonEvent.js'

export default class Application {
    constructor(_options) {
        this.canvas = _options.canvas;

        this.sizes = new Sizes();
        this.time = new Time();
        this.event = new CommonEvent();


        // this.stats = new Stats();
        // this.stats.showPanel(0);
        // document.body.appendChild(this.stats.dom);

        this.setEvents();
        this.loadSource();

        this.setDebug();
        this.setRenderer();
        this.setCamera();
        this.setWorld();
    }

    setEvents() {}

    loadSource() {
        this.resource = new Resources();
        this.resource.preload();
    }

    /**
     * dat.gui
     */
    setDebug() {
        window.debug = true;

        if (debug) {
            window.gui = new dat.GUI();
        }
    }

    setRenderer() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#202020');
        // this.scene.overrideMaterial = new THREE.MeshBasicMaterial({color: '#888888'});

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            stencil: false,
            // powerPreference: 'high-performance',
            antialias: true
        });
        this.renderer.setClearColor(0xf8e9d9, 1);
        this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.autoClear = false;
        this.renderer.toneMapping = THREE.LinearToneMapping;
        this.renderer.toneMappingExposure = 1;

        this.sizes.on(EventConst.RESIZE, () => {
            this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
        })

        this.time.on(EventConst.TICK, () => {
            this.renderer.render(this.scene, this.camera.instance);
        })

        window.requestAnimationFrame(() => {
            console.log(this.renderer.info)
            console.log('capabilities', this.renderer.capabilities)
        })
    }

    setCamera() {
        this.camera = new Camera({
            canvas: this.canvas,
            renderer: this.renderer,
            time: this.time,
            sizes: this.sizes,
            event: this.event
        })

        this.scene.add(this.camera.container);
    }

    /**
     * 存放所有物体
     */
    setWorld() {
        this.world = new World({
            renderer: this.renderer,
            time: this.time,
            sizes: this.sizes,
            resource: this.resource,
            event: this.event,
            camera: this.camera
        })
        this.scene.add(this.world.container);

        // if (debug) {
        //     const axesHelper = new THREE.AxesHelper(50);
        //     this.scene.add(axesHelper);
        // }
    }

    destroy() {
        this.time.off(EventConst.TICK);
        this.sizes.off(EventConst.RESIZE);

        this.camera.orbitControls.dispose();
        this.renderer.dispose();
        this.debug.destroy();
    }
}