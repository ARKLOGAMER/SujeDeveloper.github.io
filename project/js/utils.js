var ua = navigator.userAgent.toString();

// 加载多个脚本
var loadScript = function (list, callback) {
    var loaded = 0;
    var loadNext = function () {
        loadSingleScript(list[loaded], function () {
            loaded++;
            if (loaded >= list.length) {
                callback();
            }
            else {
                loadNext();
            }
        })
    };
    loadNext();
};

// 加载单个脚本
var loadSingleScript = function (src, callback, async) {
    var s = document.createElement('script');
    s.async = false;
    s.src = src;
    s.addEventListener('load', function () {
        s.parentNode.removeChild(s);
        s.removeEventListener('load', arguments.callee, false);
        callback();
    }, false);
    document.body.appendChild(s);
};

// 获取url后的参数
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}

function isiOS() {
    var isiOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    return isiOS;
}

function isWeiXin() {
    var str = ua.match(/MicroMessenger/i);
    if (str == "MicroMessenger") {
        return true;
    } else {
        return false;
    }
}

function isJD() {
    var str = ua.match(/jdapp/i);
    if (str == "jdapp") {
        return true;
    } else {
        return false;
    }
}

function isWeibo() {
    var str = ua.match(/Weibo/i);
    if (str == "Weibo") {
        return true;
    } else {
        return false;
    }
}

function isAlipay() {
    var str = ua.match(/Alipay/i);
    if (str == "Alipay") {
        return true;
    } else {
        return false;
    }
}