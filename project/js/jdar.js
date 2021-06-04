/*
 * 移动端功能库,封装了常用的独立方法
 */

window.jdar = (function () {
  var core = {
    // 获取页面参数
    getQueryString: function (name) {
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
      var r = window.location.search.substr(1).match(reg)
      if (r != null) {
        return unescape(r[2])
      }
      return null
    },
    // 控制台暗门，暗门开关：URL参数v=^
    checkVConsole: function () {
      if (this.getQueryString('v') === '1') {
        if (typeof VConsole === 'function') {
          new VConsole()
        } else {
          var script = document.createElement('script')
          script.type = 'text/javascript'
          script.src = '//cdn.bootcss.com/vConsole/3.2.2/vconsole.min.js'
          document.body.appendChild(script)
          setTimeout(function () {
            new VConsole()
          }, 1000)
        }
      }
    },
    getUA: function () {
      // jdUaInfo部分：https://cf.jd.com/pages/viewpage.action?pageId=87253466
      var ua = navigator.userAgent
      var uaLower = ua.toLowerCase()
      var uaArr = ua.split(';')
      this.uaArr = uaArr
      // 是否在京东app内打开
      this.isJD = ['jdapp', 'jdappthai'].indexOf(uaArr[0]) >= 0
      this.isJDThai = ['jdappthai'].indexOf(uaArr[0]) >= 0
      // 判断webview类型
      this.isWK = !!(!!ua.match(/supportJDSHWK/i) || window._is_jdsh_wkwebview === 1)
      // 是否微信
      this.isWX = uaLower.match(/MicroMessenger/i) === 'micromessenger'

      if (this.isJD) {
        // 是京东app才能这么取值，否则不准确
        this.device = uaArr[1]
        var matchArr = ua.match(/model\/\w+((,|-|\s)?\w*)*/i)
        if (matchArr && matchArr.length > 0) {
          this.deviceType = matchArr[0].split('/')[1]
        }
        this.appVersion = uaArr[2]// app版本
        this.osVersion = uaArr[3]// 系统版本
        this.isAndroid = uaArr[1].toLocaleLowerCase() == 'android';
        this.isIPhone = uaArr[1] == 'iPhone';
        this.isIPad = uaArr[1] == 'iPad';
        this.isIOS = this.isIPhone || this.isIPad;
        this.isWIFI = uaArr[5].toLocaleLowerCase().endsWith('wifi')

      } else {
        // 安卓版本
        var androidResult = ua.match(/Android\s([0-9.]+)+/i)
        if (androidResult && androidResult.length > 0) {
          var androidResultArr = androidResult[0].split(' ')
          this.device = androidResultArr[0]
          this.osVersion = androidResultArr[1]
        }
        // 安卓设备
        var deviceResult = ua.match(/Build\/\w+-?\w+/i)
        deviceResult && deviceResult.length > 0 && (this.deviceType = deviceResult[0].split('/')[1])

        // iOS版本
        var iOSResult = ua.match(/\s\w+\sOS\s\d+_\d+_\d+/i)
        if (iOSResult && iOSResult.length > 0) {
          var iOSArr = iOSResult[0].split(' ')
          this.device = iOSArr[1]
          this.osVersion = iOSArr[3].replace(/_/g, '.')
        }

        this.isAndroid = ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1; //android终端
        this.isIPhone = ua.indexOf('iPhone') != -1
        this.isIPad = ua.indexOf('iPad') != -1
        this.isIOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        if (ua.indexOf('NetType/WIFI') >= 0) {
          this.isWIFI = true
        }
      }
    },

    // 判断iOS机型是否支持,参数用"7,1"这种样式
    checkIOSDeviceType: function (minVersion) {
      // https://support.hockeyapp.net/kb/client-integration-ios-mac-os-x-tvos/ios-device-types
      var minArr = minVersion.split(/,|\./)
      var curArr = []
      if (this.deviceType) {
        var deviceResult = this.deviceType.match(/\d+,\d+/i)
        deviceResult && (curArr = deviceResult[0].split(','))
      } else {
        return false
      }

      for (var i = 0; i < 2; i++) {
        if (parseInt(curArr[i], 10) < parseInt(minArr[i], 10)) {
          return -1
        }
        if (parseInt(curArr[i], 10) > parseInt(minArr[i], 10)) {
          return 1
        }
      }
      return 0
    },
    // 判断最低支持版本
    checkMinVersion: function (versionType, minVersion) {
      var curVersion = this[versionType]
      if (!curVersion) {
        return false
      }
      if (curVersion && curVersion.split('.').length < 3) {
        curVersion = curVersion + '.0'
      }
      if (minVersion && minVersion.split('.').length < 3) {
        minVersion = minVersion + '.0'
      }

      var minArr = minVersion.split('.')
      var curArr = curVersion.split('.')
      for (var i = 0; i < 3; i++) {
        if (parseInt(curArr[i], 10) < parseInt(minArr[i], 10)) {
          return false
        }
        if (parseInt(curArr[i], 10) > parseInt(minArr[i], 10)) {
          return true
        }
      }
      return true
    },
    // 判断版本
    checkVersion: function (curVersion, minVersion) {
      var curArr = curVersion && this.isString(curVersion) ? curVersion.split(/\.|,/g) : [0, 0, 0]
      var minArr = minVersion && this.isString(minVersion) ? minVersion.split(/\.|,/g) : [0, 0, 0]
      var zeroObj = { 0: [0, 0, 0], 1: [0, 0], 2: [0] }
      var versionLen = 3
      curArr.length < versionLen && (curArr = curArr.concat(zeroObj[curArr.length]))
      minArr.length < versionLen && (minArr = minArr.concat(zeroObj[minArr.length]))

      for (var i = 0; i < versionLen; i++) {
        if (parseInt(curArr[i], 10) < parseInt(minArr[i], 10)) {
          return -1
        }
        if (parseInt(curArr[i], 10) > parseInt(minArr[i], 10)) {
          return 1
        }
      }
      return 0
    },
    // 判断系统版本
    checkMinOSVersion: function (minVersion) {
      if (!this.isString(minVersion)) {
        return false
      }
      return this.checkVersion(this.osVersion, minVersion) >= 0
    },
    // 判断京东app版本
    checkMinAppVersion: function (minVersion) {
      if (!this.isString(minVersion)) {
        return false
      }
      return this.checkVersion(this.appVersion, minVersion) >= 0
    },
    // 设置沉浸式导航
    configNav: function (url, androidWidth, iosWidth) {
      // https://cf.jd.com/pages/viewpage.action?pageId=121472141
      if (!this.isJD) {
        return
      }
      var width;
      if (this.isWK) {
        width = iosWidth;
      } else {
        width = androidWidth;
      }
      var defaultOption = {
        canPull: 0,
        supportTran: 1,
        tranParams: {
          blackImg: url, // 透明图片
          whiteImg: url,
          backgroundColor: '#373535',
          naviMenuType: 'ww'
          // pic: 'http://img10.360buyimg.com/fit/jfs/t1/84123/36/9413/8035/5d70dd71E44fe86b6/6d9ba33adc94c7e9.png'
        },
        titleImgWidth: width
      }
      var jsonString = JSON.stringify(defaultOption)
      if (this.isWK) {
        window.webkit.messageHandlers.MobileNavi.postMessage({
          'method': 'configNavigationBar',
          'params': jsonString
        })
      } else {
        window.MobileNavi && window.MobileNavi.configNavigationBar(jsonString)
      }
    },
    // 设置沉浸式导航
    configNavBar: function (navConfig) {
      // https://cf.jd.com/pages/viewpage.action?pageId=121472141
      if (!this.isJD) {
        return
      }
      var defaultOption = navConfig || {
        canPull: 0,
        supportTran: 1,
        tranParams: {
          blackImg: url, // 透明图片
          whiteImg: url,
          backgroundColor: '#EEEEEE',
          naviMenuType: 'bb'
          // pic: 'http://img10.360buyimg.com/fit/jfs/t1/84123/36/9413/8035/5d70dd71E44fe86b6/6d9ba33adc94c7e9.png'
        },
        titleImgWidth: 400
      }
      var jsonString = JSON.stringify(defaultOption)
      if (this.isWK) {
        window.webkit.messageHandlers.MobileNavi.postMessage({
          'method': 'configNavigationBar',
          'params': jsonString
        })
      } else {
        window.MobileNavi && window.MobileNavi.configNavigationBar(jsonString)
      }
    },
    // 批量设置导航栏右侧菜单按钮
    configBtn: function (option) {
      // https://cf.jd.com/pages/viewpage.action?pageId=121472088
      if (!this.isJD) {
        return
      }

      var navOption = option || {
        'message': {
          'type': 'message',
          'display': 'hide',
          'position': 'inside'
        },
        'homepage': {
          'type': 'homepage',
          'display': 'hide',
          'position': 'outside'
        },
        'calendar': {
          'type': 'calendar',
          'display': 'hide',
          'position': 'outside'
        },
        'search': {
          'type': 'search',
          'display': 'hide',
          'position': 'outside'
        },
        'feedback': {
          'type': 'feedback',
          'display': 'hide',
          'position': 'outside'
        },
        'cart': {
          'type': 'cart',
          'display': 'show',
          'position': 'inside'
        }
      }


      var jsonString = JSON.stringify(navOption)
      if (this.isWK) {
        var obj = {
          'method': 'configBtnSince610',
          'params': jsonString
        }
        window.webkit.messageHandlers.MobileNavi.postMessage(obj)
      } else {
        window.MobileNavi && window.MobileNavi.configBtnSince610(jsonString)
      }
    },
    /**
     * 隐藏导航栏右上角【...】按钮
     */
    hideNavBtn() {
      if (this.isWK) {
        var jsonStringForIOS = JSON.stringify({
          message: {
            type: "message",
            display: "hide",
            position: "inside",
          },
          homepage: {
            type: "homepage",
            display: "hide",
            position: "outside",
          },
          calendar: {
            type: "calendar",
            display: "hide",
            position: "outside",
          },
          search: {
            type: "search",
            display: "hide",
            position: "outside",
          },
          feedback: {
            type: "feedback",
            display: "hide",
            position: "outside",
          },
          cart: {
            type: "cart",
            display: "hide",
            position: "inside",
          },
        });
        window.webkit.messageHandlers.MobileNavi.postMessage({
          method: "configBtnSince610",
          params: jsonStringForIOS,
        });
      } else {
        var jsonStringForAndroid = JSON.stringify({
          share: {
            type: "share",
            display: "show", //show, hide
            position: "inside", //outside, inside
          },
          hidemore: {
            type: "hidemore",
            display: "hide",
          },
        });
        window.MobileNavi &&
          window.MobileNavi.configBtnSince610(jsonStringForAndroid);
      }

    },

    setFollowBtn: function () {
      if (!this.isJD) {
        return
      }
      var navOption = {}
      var isHighApp = this.checkMinAppVersion('8.2.4')// true : 大于等于 false:小于
      if (isHighApp) {
        navOption = {
          'follow': {
            'type': 'follow',
            'display': 'show',
            'position': 'outside',
            'icon': '',
            'title': '关注',
            'jump': '',
            'params': {
              'collectionId': '525'
            }
          }
        }
      }

      var jsonString = JSON.stringify(navOption)
      if (this.isWK) {
        var obj = {
          'method': 'configBtnSince610',
          'params': jsonString
        }
        window.webkit.messageHandlers.MobileNavi.postMessage(obj)
      } else {
        window.MobileNavi && window.MobileNavi.configBtnSince610(jsonString)
      }
    },
    setNaviBackground: function (backConfig) {

      var option = backConfig || {
        "naviIcon": "2",
        "backgroundColor": "#000000",
        "pic": "http://storage.jd.com/arvr-common/jdj-nav.png"
      }
      var jsonString = JSON.stringify(option)
      if (jdar.isWK) {
        var obj = {
          'method': 'setNaviBackground',
          'params': jsonString
        }
        window.webkit.messageHandlers.MobileNavi.postMessage(obj)
      } else {
        window.MobileNavi && window.MobileNavi.setNaviBackground(jsonString)
      }

    },
    //初始化分享
    initShare: function (shareConfig) {
      var option = shareConfig || {
        title: "京东好物",
        content: "店铺好货，尽在京东VR场景购！",
        url: '//householdpro.jd.com/jdj-two/index.html',
        img: '//householdpro.jd.com/jdj-two/img/logo.png'
      }
      window.jdshare.setShareInfo(option)
    },
    // app分享,依赖京东分享组件
    jdAppShare: function (shareImgUrl, callback) {
      if (!shareImgUrl) {
        callback && callback(new Error('图片链接错误'))
      }
      if (this.isJD) {
        try {
          window.jdshare && window.jdshare
            .sendDirectShare({
              title: '',
              content: '',
              url: '',
              img: '',
              channel: 'QRCode',
              qrparam: {
                qr_direct: shareImgUrl
              }
            })
        } catch (e) {
          callback && callback(e.message)
        }
      }
    },
    // 埋点 页面PV
    setMpingPagePV: function (option) {
      if (window.unifyRecoReport) {
        try {
          var pv = new window.MPing.inputs.PV(option)
          var mping = new window.MPing()
          mping.send(pv)
        } catch (e) {
        }
      }
    },
    // 埋点 点击事件
    setMpingClick: function name(key, pageId, pageParam, eventParam, jsonParam) {
      if (window.unifyRecoReport) {
        try {
          var eventId = key // 必选参数，事件id
          var click = new window.MPing.inputs.Click(eventId) // 构造click请求
          click.event_param = eventParam// 事件参数
          if (jsonParam) {
            click.json_param = JSON.stringify(jsonParam)   // json参数
          }
          click.page_id = pageId
          // click.event_level = "1"; // 设置事件等级
          // click.page_name = "";  //当前页面类名或（M页）去参URL
          click.page_param = pageParam // 设置click的参数
          click.updateEventSeries() // 更新事件串
          var mping = new window.MPing() // 构造上报实例
          mping.send(click) // 上报click
        } catch (e) {
        }
      }
    },

    // 保存图片到相册
    saveImgToAlbum: function (imgUrl, callback) {
      // http://cf-pmp.jd.com/pages/viewpage.action?pageId=97891908

      if (!imgUrl) return

      this.saveCallBack = function (res) {
        var result = JSON.parse(res)
        if (result.callBackId === 'jdar-save') {
          // code, 0=成功, 1=失败
          callback && callback(result.code)
        }
      }

      var saveOption = {
        imgUrl: imgUrl,
        callBackName: 'jdar.saveCallBack',
        callBackId: 'jdar-save'
      }

      var jsonString = JSON.stringify(saveOption)

      if (this.isJD) {
        if (this.isWK) {
          var obj = {
            'method': 'saveImageToPhoteAlbum',
            'params': jsonString
          }
          window.webkit.messageHandlers.JDAppUnite.postMessage(obj)
        } else {
          window.JDAppUnite && window.JDAppUnite.saveImageToPhoteAlbum(jsonString)
        }
      }
    },

    getDataType: function (o) {
      return Object.prototype.toString.call(o).slice(8, -1)
    },
    isString: function (o) { // 是否字符串
      return this.getDataType(o) === 'String'
    },
    isObj: function (o) { // 是否对象
      return this.getDataType(o) === 'Object'
    },
    // 打开 app
    autoOpenApp: function (para) {
      if (!this.isString(para) && !this.isObj(para)) {
        return
      }
      var openAppParam = para
      if (this.isString(para)) {
        openAppParam = { 'category': 'jump', 'des': 'm', 'url': para }
      }
      var opt = {
        downAppURl: 'https://wqs.jd.com/downloadApp/downloadAppIOSMPage.html?channel=jd-m', // app下载地址，必配
        downAppIos: 'https://itunes.apple.com/us/app/jing-dong-wang-gou-shou-dan/id414245413', // ions下载地址，必配
        downWeixin: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.jingdong.app.mall&g_f=991850', // 微信下载地址，必配
        downIpad: 'https://itunes.apple.com/cn/app/jing-dong-hd/id434374726?mt=8', // ipad下载地址，必配
        inteneUrl: 'openApp.jdMobile://virtual?', // 打开客户端协议（不区分大小写），必配
        M_sourceFrom: 'mxz', // 业务标示，供app唤起后，统计使用，若调用方没有传，则传默认值为mxz，必配
        // 自定义落地参数，例如：
        // 搜索为{"des":"productList","keyWord":source.keyword,"from":"search","category":"jump"}，
        // 详细请参考openApp协议参数一览表，必配
        inteneUrlParams: openAppParam,
        autoOpenAppEventId: 'MDownLoadFloat_AppArouse', // 自动唤起客户端EventId，默认：MDownLoadFloat_AppArouse，必配
        autoOpenAppEventParam: '', // 自动唤起客户端EventIdParam，默认为空，必配
        autoOpenIntervalTime: '1', // 这个参数的值只要不是0就OK，选配
        cookieFlag: 'jdar', // yourFlga   一个字符串，最好个性化一点。例如，jdShopFollow，选配
        sourceType: 'JSHOP_SOURCE_TYPE', // 用户访问渠道来源跟踪，选配
        sourceValue: 'JSHOP_SOURCE_VALUE', // 用户访问渠道来源跟踪，选配
        NoJumpDownLoadPage: true, // 默认唤起失败跳app下载页，若为true则唤起失败后不会跳下载页，选配
        noJdApp: false // 要唤起的是否是京东App，默认false为京东App，例：手机阅读app，则传noJdAapp ： true，选配
      }
      $.downloadAppPlugInOpenApp(opt)
    },
    openChannelPage: function (url) {
      var openAppParam = { 'category': 'jump', 'des': 'guanzhu', 'url': url + '?collectionId=525' }
      var opt = {
        downAppURl: 'https://wqs.jd.com/downloadApp/downloadAppIOSMPage.html?channel=jd-mar3d',
        downAppIos: 'https://itunes.apple.com/us/app/jing-dong-wang-gou-shou-dan/id414245413',
        downWeixin: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.jingdong.app.mall&g_f=991850',
        downIpad: 'https://itunes.apple.com/cn/app/jing-dong-hd/id434374726?mt=8', // ipad下载地址，必配
        inteneUrl: 'openApp.jdMobile://virtual?', // 打开客户端协议（不区分大小写），必配
        inteneUrlParams: openAppParam,
        M_sourceFrom: 'mxz',
        openAppEventId: 'MDownLoadFloat_OpenNow',
        openAppEventParam: ''
      }
      $.immediateOpenApp(opt)
    },
    openUrl: function (url) {
      location.href = url
    },
    openApp: function (openAppParam) {
      if (this.isJD) {
        location.href = 'openApp.jdMobile://virtual?params=' + JSON.stringify(openAppParam)
      } else {
        var opt = {
          downAppURl: 'https://wqs.jd.com/downloadApp/downloadAppIOSMPage.html?channel=jd-mar3d',
          downAppIos: 'https://itunes.apple.com/us/app/jing-dong-wang-gou-shou-dan/id414245413',
          downWeixin: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.jingdong.app.mall&g_f=991850',
          downIpad: 'https://itunes.apple.com/cn/app/jing-dong-hd/id434374726?mt=8', // ipad下载地址，必配
          inteneUrl: 'openApp.jdMobile://virtual?', // 打开客户端协议（不区分大小写），必配
          inteneUrlParams: openAppParam,
          M_sourceFrom: 'mxz',
          openAppEventId: 'MDownLoadFloat_OpenNow',
          openAppEventParam: ''
        }
        $.immediateOpenApp(opt)
      }
    },
    // 微信分享
    wxShare: function () {

    },

    // 下载地址
    dowloadApp: function () {
      var dataUrl = ''

      if (this.isAndroid) {
        dataUrl = '//storage.360buyimg.com/jdmobile/jd-mxz.apk'
      } else if (this.isIPhone) {
        dataUrl = '//itunes.apple.com/cn/app/id414245413'
      } else if (this.isIPad) {
        dataUrl = '//itunes.apple.com/cn/app/jing-dong-hd/id434374726'
      }
      window.open(dataUrl)
    }

  }

  //  core.importLib();
  core.checkVConsole()
  core.getUA()

  return core
})()
