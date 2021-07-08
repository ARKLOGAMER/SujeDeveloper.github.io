import * as THREE from 'three'
import ObjectBase from './base/ObjectBase';
import Poster from './Poster';

export default class PostersContainer extends ObjectBase {
    constructor(_options) {
        super(_options);

        this.scroll = document.querySelector('.poster-scroll');
        document.body.style.height = `${this.scroll.getBoundingClientRect().height}px`;

        this.currentPos = 0;
        this.targetPos = 0;
        this.posterArr = [];

        this.setPosters();

        this.time.on(EventConst.TICK, () => {
            for(let i=0; i<this.posterArr.length; i++) {
                this.posterArr[i].render(-(this.targetPos - this.currentPos) * 0.0003);
            }
            this.smoothScroll();
        })
    }

    setPosters() {
        this.images = [...document.querySelectorAll('.poster__img')]

        for (let i = 0; i < this.images.length; i++) {
            const poster = new Poster({
                renderer: this.renderer,
                sizes: this.sizes,
                time: this.time,
                resource: this.resource,
                element: this.images[i],
            })
            // poster.container.position.y = 1 + i * -1;
            this.container.add(poster.container);
            this.posterArr.push(poster);
        }
    }

    lerp(start, end, t) {
        return (1 - t) * start + end * t
    }

    smoothScroll() {
        this.targetPos = window.scrollY;
        this.currentPos = this.lerp(this.currentPos, this.targetPos, 0.095);
        this.scroll.style.transform = `translate3d(0, ${-this.currentPos}px, 0)`;
    }
}