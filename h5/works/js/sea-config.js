seajs.config({
    base: '/js/modules',
    //开发环境设置
    debug: true,
    paths: {
        'lib': '/js/libs'
    },
    // 别名配置
    alias: {
        "zepto":"lib/zepto/zepto-cmd.min.js",
        "jquery": "lib/jquery/1.11.1/jquery-cmd.min.js",
        "avalon": "lib/avalon/2.2.4/avalon2.modern-cmd.js",
        "layer_mobile": "lib/layer_mobile/2.0/layer_mobile.min.js",
        "common": "common/common-cmd.js",
        "fastclick": "lib/fastclick.js",
        "security": "lib/security.js",
        "echarts":"lib/echarts/3.5.0/echarts-cmd.js",
        "scroll":"lib/iscroll.js",
        "swiper":"lib/swiper.js",
        "jquery_weui": "lib/jquery-weui.js",
        'util':'common/util',
        'init':'common/init',
        'store':'lib/store.min',
        'cookie':'lib/jquery.cookie',
        'jweixin':'lib/wx/jweixin-1.2.0.js',
        'mqtt':'common/jquery.mqtt-cmd'
    },
    //映射规则
    map: [
        //加载的js统一加上版本号
        ['.js','.js?v=1.6.0_20171229_02']
    ],
    // 变量配置
    vars: {
        'locale': 'zh-cn'
    }
});