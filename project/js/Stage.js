var ResolutionPolicy = {
    FIXED_WIDTH: 1,
    FIXED_HEIGHT: 2,
    NO_BORDER: 3
};

var OrientationPolicy = {
    LANDSCAPE: 1,
    PORTRAIT: 2,
    AUTO: 3
};

var Stage = function (id, option) {
    this.id = id || 'root';
    this.option = option || {};

    this.width = this.option.width || 750;
    this.height = this.option.height || 1448;
    this.designWidth = this.option.designWidth || this.width;
    this.designHeight = this.option.designHeight || this.height;
    this.safeWidth = this.option.safeWidth || this.width;
    this.safeHeight = this.option.safeHeight || this.height;
    this.zIndex = this.option.zIndex || 0;

    this.orientationPolicy = this.option.orientation || OrientationPolicy.AUTO;
    this.resolutionPolicy = this.option.resolution || ResolutionPolicy.NO_BORDER;

    this.elementParent = this.option.parent || document.body;

    this.element = document.getElementById(this.id);

    this.beforeResizeCallback = null;
    this.resizeCallback = null;
    this.resizeIntervalId = null;

    this.w = this.width;
    this.h = this.height;


    this.x = 0;
    this.y = 0;
    this.scale = 1;

    this.canResize = true;

    this.init();

    return this;
};

Stage.prototype = {

    init: function () {
        var self = this;

        this.setElement();

        this.resize();


        window.addEventListener('resize', function () {
            self.resize();
        });

        this.element.addEventListener('touchmove', function (e) {
            e.preventDefault();
        });
    },

    setElement: function () {
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.id = this.id;
            this.elementParent.appendChild(this.element);
        }

        var style = this.element.style;
        style.position = 'absolute';
        // style.width = this.w + 'px';
        // style.height = this.h + 'px';
        style.top = '0';
        style.left = '0';
        style.zIndex = this.zIndex
    },


    resizeDelay: function () {
        this.beforeResizeCallback && this.beforeResizeCallback();

        var w = window.innerWidth;
        var h = window.innerHeight;

        // console.log("w", w, h)

        var eleParent = this.element.parentNode;
        if (!eleParent) return;
        var style2 = eleParent.style;

        style2.position = 'absolute';
        // style.width = this.w + 'px';
        // style.height = this.h + 'px';
        style2.top = '0';
        style2.left = '0';
        style2.zIndex = this.zIndex
        style2.width = w + 'px';
        style2.height = h + 'px';
        // console.log("style2", style2)

        style2.webkitTransformOrigin = "left top";
        style2.webkitTransform = "rotate(0deg) translateX(0px)";

        var style = this.element.style;

        var isWider = w / h > (w > h ? this.h / this.w : this.w / this.h);
        var isWidth = true;

        var policy_landscape = ResolutionPolicy.FIXED_WIDTH;
        var policy_portrait = ResolutionPolicy.FIXED_HEIGHT;

        if (this.resolutionPolicy instanceof Array) {
            policy_portrait = this.resolutionPolicy[0];
            policy_landscape = this.resolutionPolicy[1];
        } else {
            policy_portrait = this.resolutionPolicy;
            policy_landscape = this.resolutionPolicy;
        }

        var transform = '';

        if (w > h) {
            switch (policy_landscape) {
                case ResolutionPolicy.FIXED_WIDTH:
                    isWidth = true;
                    break;
                case ResolutionPolicy.FIXED_HEIGHT:
                    isWidth = false;
                    break;
                case ResolutionPolicy.NO_BORDER:
                    isWidth = isWider;
                    break;
                default:
            }


            if (isWidth) {
                // 横屏100%宽适配
                // console.log('横屏100%宽适配')
                this.scale = w / this.h;
                this.height = this.h;
                this.width = h / this.scale;
                if (this.width < this.safeWidth) {
                    this.scale = h / this.safeWidth;
                    this.width = this.safeWidth;
                    this.height = w / this.scale;
                }

            } else {
                // 横屏100%高适配
                // console.log('横屏100%高适配')

                this.scale = h / this.w;
                this.width = this.w;
                this.height = w / this.scale;
                if (this.height < this.safeHeight && policy_landscape !== ResolutionPolicy.FIXED_HEIGHT) {
                    this.scale = w / this.safeHeight;
                    this.height = this.safeHeight;
                    this.width = h / this.scale;
                }
            }

            this.x = (this.width - this.designWidth) / 2;
            this.y = (this.height - this.designHeight) / 2;
            transform = "rotate(-90deg) translate(" + (-this.width + this.x) * this.scale + "px," + this.y * this.scale + "px) scale(" + this.scale + ")";
        } else {
            switch (policy_portrait) {
                case ResolutionPolicy.FIXED_WIDTH:
                    isWidth = true;
                    break;
                case ResolutionPolicy.FIXED_HEIGHT:
                    isWidth = false;
                    break;
                case ResolutionPolicy.NO_BORDER:
                    isWidth = isWider;
                    break;
                default:
            }

            if (isWidth) {
                //竖屏100%宽适配
                // console.log('竖屏100%宽适配')

                this.scale = w / this.w;
                this.width = this.w;
                this.height = h / this.scale;

                if (this.height < this.safeHeight && policy_portrait !== ResolutionPolicy.FIXED_WIDTH) {
                    this.scale = h / this.safeHeight;
                    this.height = this.safeHeight;
                    this.width = w / this.scale;
                }
            } else {
                //竖屏100%高适配
                // console.log('竖屏100%高适配')

                this.scale = h / this.h;
                this.height = this.h;
                this.width = w / this.scale;
                if (this.width < this.safeWidth) {
                    this.scale = w / this.safeWidth;
                    this.width = this.safeWidth;
                    this.height = h / this.scale;
                }
            }

            this.x = (this.width - this.designWidth) / 2;
            this.y = (this.height - this.designHeight) / 2;
            transform = "translate(" + this.x * this.scale + "px," + this.y * this.scale + "px) scale(" + this.scale + ")";


        }

        style.transform = transform;
        style.webkitTransform = transform;
        style.transformOrigin = '0px 0px';
        style.webkitTransformOrigin = '0px 0px';

        this.resizeCallback && this.resizeCallback();
    },

    getSize: function () {
        return {
            width: this.width,
            height: this.height
        };
    },

    getRect: function () {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        }
    },

    resize: function () {
        var self = this;
        if (this.resizeIntervalId) clearTimeout(this.resizeIntervalId);
        if (!this.canResize) return;
        self.resizeDelay();
        this.resizeIntervalId = setTimeout(function () {
            self.resizeDelay();

        }, 300);


    },

    setResize: function (canResize) {
        this.canResize = !!canResize;
    },


    setResizeCallback: function (callback1, callback2) {
        if (callback2) {
            this.beforeResizeCallback = callback1;
            this.resizeCallback = callback2;
        } else {
            this.beforeResizeCallback = null;
            this.resizeCallback = callback1;
        }
    },

    setZ: function (index) {
        this.element.style.zIndex = index;
    },

    show: function () {
        this.element.style.display = 'block';
        this.element.style.opacity = 1;
    },

    hide: function () {
        this.element.style.display = 'none';
        this.element.style.opacity = 0;
    },

};