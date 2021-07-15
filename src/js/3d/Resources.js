import * as THREE from 'three'

import Loader from './Utils/Loader.js'
import EventEmitter from './Utils/EventEmitter.js'

import githubLogoTexture from '../../models/texture/github-logo.png'
import table from '../../models/glb/table.glb'
import computer from '../../models/glb/computer.glb'
import pad from '../../models/glb/pad.glb'
import wall from '../../models/glb/wall.glb'

export default class Resources extends EventEmitter {
    constructor() {
        super()

        this.loader = new Loader()
        this.items = {}

        /************* 预加载资源 **************/
        this.preloadRes = [
            { name: 'githubLogo', source: githubLogoTexture, type: 'texture' },
            { name: 'table', source: table},
            { name: 'computer', source: computer},
            { name: 'pad', source: pad},
            { name: 'wall', source: wall},
        ];

        // 单个资源加载成功
        this.loader.on(EventConst.FILE_END, (_resource, _data) => {
            this.items[_resource.name] = _data;

            // Texture
            if (_resource.type === 'texture') {
                const texture = new THREE.Texture(_data);
                texture.needsUpdate = true;

                // ******给所有的texture资源都添加后缀
                this.items[`${_resource.name}Texture`] = texture;
            }

            // Trigger progress
            console.log('progress', this.loader.loaded, '/', this.loader.toLoad)
            this.trigger(EventConst.RES_PROGRESS, [this.loader.loaded / this.loader.toLoad]);
        })

        // 预加载资源加载成功
        this.loader.on(EventConst.LOAD_END, (name) => {
            // Trigger ready
            switch (name) {
                case 'preload':
                    // 预加载资源完成
                    this.trigger(EventConst.RES_READY);
                    return;
            }
        })
    }

    /**
     * 预加载资源
     */
    preload() {
        this.loader.load(this.preloadRes, 'preload');
    }

    /**
     * 手动加载
     * @param {*} arr - 资源组
     * @param {*} type - 资源组名称
     */
    load(arr, name) {
        this.loader.load(arr, name);
    }
}