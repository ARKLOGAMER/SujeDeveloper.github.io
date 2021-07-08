import * as THREE from 'three'
import ObjectBase from './base/ObjectBase';
import vertexShader from '../../../shaders/poster/vertex.glsl'
import fragmentShader from '../../../shaders/poster/fragment.glsl'

export default class Poster extends ObjectBase {
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

    render(offset) {
        this.getDimensions();
        this.model.position.set(this.offset.x, this.offset.y, 0);
        this.model.scale.set(this.scale.x, this.scale.y, 1);
        this.material.uniforms.uTime.value = this.time.elapsed * 0.001;
        this.material.uniforms.uOffset.value.set(0, offset)
    }
}