import {
    clearTimeout,
    console
} from 'globalthis/implementation';
import EventEmitter from './EventEmitter.js'
import Platform from './Platform.js'

export default class Time extends EventEmitter {
    /**
     * Constructor
     */
    constructor() {
        super();

        this.start = Date.now();
        this.current = this.start;
        this.elapsed = 0;
        this.delta = 16;

        if (Platform.isAndroid()) {
            // 安卓机存在不限制帧数的情况 所以放弃使用RAF方法
            this.onTick = () => {
                this.ticker = setTimeout(this.tick, 17);
            }
        } else {
            this.onTick = () => {
                this.ticker = window.requestAnimationFrame(this.tick);
            }
        }

        this.tick = this.tick.bind(this);
        this.tick();
    }

    /**
     * Tick
     */
    tick() {
        this.onTick();

        const current = Date.now();

        this.delta = current - this.current;
        this.elapsed = current - this.start;
        this.current = current;

        if (this.delta > 60) {
            this.delta = 60;
        }

        this.trigger(EventConst.TICK);
    }

    /**
     * Stop
     */
    stop() {
        if (Platform.isAndroid()) {
            clearTimeout(this.ticker);
        } else {
            window.cancelAnimationFrame(this.ticker);
        }
    }
}