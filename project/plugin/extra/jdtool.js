var time = 0;
var pin = "";
var isServeInit = false;
// 是否是风控用户
var isRisk = true;
// 是否不能访问
var isCan = false;

/**
 * 判断是否是京东环境
 * @returns
 */
function isJd() {
    if (!jd.ar) {
        console.log("jdar 基础js未加载");
        return;
    }
    return jd.ar.isApp('jd');
}

/**
 * 获取用户 Pin
 */
function getPin() {
    if (!jd.ar) {
        console.log("jdar 基础js未加载");
        return;
    }
    pin = jd.ar.getPin();
    console.log("pin 获取成功");
}

/**
 * 获取用户是否登录
 * @returns {boolean} 是否登录
 */
function isLogin() {
    if (!jd.ar) {
        console.log("jdar 基础js未加载");
        return;
    }
    return jd.ar.isJDLogin();
}

/**
 * 登录京东
 * @param {string} return_url 登录后返回的链接地址
 */
function toLogin(return_url) {
    if (!jd.ar) {
        console.log("jdar 基础js未加载");
        return;
    }
    jd.ar.toLogin(return_url);
}

/**
 * 初始化serve
 */
function initServe() {
    if (!jd.ar.serve) {
        console.log("jdar servejs未加载");
        return;
    }
    var appId = 'app_304';
    var actvityId = 'a4b2541fe4b1bf46d3c4c7881618fb43857813fc';
    var sign = '0d31925b314ab676';
    jd.ar.serve.initServe(actvityId, appId, sign);
    isServeInit = true;
    console.log("serve 初始化");
}

/**
* @Promise
* 风控用户判断
* @returns  返回是否为风控用户
*/
function isLegitimateUser() {
    if (!jd.ar) {
        console.log("jdar 基础js未加载");
        return;
    }
    if (!jd.ar.serve) {
        console.log("jdar servejs未加载");
        return;
    }
    if (!isServeInit) {
        console.log("serve未初始化");
        initServe();
    }
    if (!pin) {
        // 未获取到 pin
        console.log("请先获取到pin后再执行");
        getPin();
    }
    return new Promise((resolve, reject) => {
        jd.ar.serve.isRisk(pin,
            res => {
                console.log("风控", res);
                if (res.rc == '200') {
                    if (res.rv.coupon) {
                        console.log("优惠劵风控用户");
                        resolve(true);
                    }
                    if (res.rv.bean) {
                        console.log("京豆风控用户");
                        resolve(true);
                    }
                    if (res.rv == false) {
                        console.log("不是风控用户");
                        isRisk = false;
                        resolve(false);
                    }
                } else {
                    console.log("风控 失败", res);
                    reject(res);
                }
            },
            err => {
                console.log("风控 错误", err);
                reject(err)
            })
    })
}

/**
 * 判断设备是否支持
 * @returns {number} 1 支持  2 App版本不支持  3 系统版本不支持  4 机型不支持
 */
function deviceIsSupport() {
    // 当前环境是否支持京东AR
    if (!jd.ar) {
        console.log("jdar 基础js未加载");
        return;
    }
    if (!isJd()) {
        console.log("请在京东环境下使用");
        return;
    }
    // 获取京东当前版本号
    let appVer = jd.ar.getAppVersion('jd');
    console.log("京东APP Ver", appVer);
    if (jd.ar.isIOS()) {
        console.log("IOS")
        // 设备型号
        let deviceVer = jd.ar.getIPhoneModel().toLowerCase();
        deviceVer = deviceVer.split('iphone')[1].replace(/,/g, ".");
        console.log("deviceVer", deviceVer);
        // ios版本号
        let iosVer = jd.ar.getIOSVersion();
        console.log("iosVer", iosVer);
        if (checkIOSDeviceType(deviceVer, '8.1') < 0 || checkIOSDeviceType(deviceVer, '8.4') < 0)     //iOS机型限制配置
        {
            console.log('IOS 机型版本小于8.1(6s) 5S');
            return 4
        }
        else if (jd.ar.versionCompare(iosVer, '11.0.0') < 0) {   //iOS系统版本限制配置
            console.log('苹果系统版本小于11.0.0');
            return 3
        }
        else if (jd.ar.versionCompare(appVer, '8.5.0') < 0)     //iOS京东APP版本限制配置
        {
            console.log('IOS APP版本小于8.3.0');
            return 2
        }
        else {
            console.log("支持AR环境");
            isCan = true;
            return 1
        }
    } else if (jd.ar.isAndroid()) {
        console.log("Android ");
        let androidVer = jd.ar.getAndroidVersion();
        console.log("androidVer", androidVer);
        if (jd.ar.versionCompare(androidVer, '6.0.0') < 0) {     //安卓系统版本限制配置
            console.log("android 系统版本不支持");
            return 3;
        }
        else if (jd.ar.versionCompare(appVer, '8.5.0') < 0)     //安卓京东APP版本限制配置
        {
            console.log("android App版本不支持");
            return 2;
        }
        else {
            var UA = navigator.userAgent.toLocaleLowerCase();
            if (UA.match("sm919") || UA.match("yq601") || UA.match("vivo x9plus"))    //安卓特定机型限制限制配置
            {
                console.log("机型不支持");
                return 4;
            }
            else {
                console.log("支持AR环境");
                isCan = true;
                return 1
            }
        }
    }
}

/**
 * 
 * @param {string} launchId 活动id
 * @param {string} parma 携带的参数类型
 */
function openApp(launchId, parma = "") {
    if (parma == "") {
        parma = window.location.search;
    }
    if (isJd()) {
        if (jd.ar.isIOS() && jd.ar.versionCompare(jd.ar.getIOSVersion(), '13.0.0') == 1)//如果大于13系统
        {
            // 增加冷却时间
            if (new Date().getTime() - time <= 800) {
                console.log("冷却中");
                return;
            }
        };
        time = Date.parse(new Date());
        // matrixar: 不能用，调起后置摄像头
        // arface: 可以用，唤起前置摄像头
        location.href = `openApp.jdMobile://virtual?params={"category":"jump","des":"arface","activity_id":"${launchId}","flow_type":"0","urlparam":"${parma}"}`;
    }
    else {
        console.log("out jd");
        // var result = window.location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
        // if (result == null || result.length < 0) {
        var url = window.location.href;
        console.log("url : ", url);
        jd.ar.clickOpenJDApp(url);
        // }
    }
}

/**
 * 比较版本号大小
 * @param {string} v1 
 * @param {string} v2 
 * @returns {number} 小于0 v1<v2  等于0 v1=v2 大于0 v1>v2
 */
function checkIOSDeviceType(v1, v2) {
    let big1 = parseInt(v1.split('.')[0]);
    let big2 = parseInt(v2.split('.')[0]);

    if (big1 > big2) {
        return 1
    } else if (big1 == big2) {
        let small1 = parseInt(v1.split('.')[1]);
        let small2 = parseInt(v2.split('.')[1]);
        if (small1 > small2) {
            return 1
        } else if (small1 == small2) {
            return 0
        } else {
            return -1
        }
    } else {
        return -1;
    }
}
