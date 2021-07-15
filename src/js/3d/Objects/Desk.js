import * as THREE from 'three'
import ObjectBase from './base/ObjectBase';

export default class Desk extends ObjectBase {
    constructor(_options) {
        super(_options);

        this.setModel();
    }

    setModel() {
        const texture = new THREE.TextureLoader().load(this._element.src);

        this.geometry = new THREE.PlaneGeometry(1, 1, 16, 16);
        this.material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: {
                    value: 0.0
                },
                uOffset: {
                    value: new THREE.Vector2(0.0, 0.0)
                },
                uTexture: {
                    value: texture
                }
            },
        });

        this.model = new THREE.Mesh(this.geometry, this.material);
        this.container.add(this.model);
    }
}