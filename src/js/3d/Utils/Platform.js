export default {
    isIOS() {
        var u = navigator.userAgent.toString();
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        return isiOS;
    },

    isAndroid() {
        var u = navigator.userAgent.toString();
        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
        return isAndroid;
    }
}