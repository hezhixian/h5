/****
 初始化方法脚本
 ****/

define(function (require) {
    var util = require('util');
    var $ = require('jquery');
    var INIT = {

        /*初始化【权限控件】*/
        authController: function () {
            if ($.fn.authController) {
                //把html节点设置的ac-moduleUrl属性作为当前模块url
                var moduleUrl = $("html").attr('ac-moduleUrl');
                if (typeof moduleUrl == "undefined") {
                    moduleUrl = $.fn.authController.defaults.moduleUrl;
                }
                //根据具体项目应用情况，覆盖默认配置
                $.extend($.fn.authController.defaults, {
                    ctrlMode: 'visible',
                    moduleUrl: moduleUrl,
                    serviceUrl: '/auth/getPermissions',
                    //对受控元素渲染之后的额外操作
                    afterRender: function ($obj, hasPermission) {
                        if (!hasPermission) {
                            $obj.removeAttr('ms-click').attr('title', '你没有该操作权限');
                        }
                    }
                });
                $(function () {
                    $('li[ac-authCode],a[ac-authCode],input[ac-authCode]').authController();
                });
            }
        },

        /*初始化【jquery.mqtt控件】*/
        mqtt: function () {
            if ($.fn.mqtt) {
                $.ajax({
                    url: "/sys/config/mqtt",
                    success: function (data) {
                        $.extend($.fn.mqtt.defaults, {
                            host: data.bizData.mqtt_host, port: data.bizData.mqtt_websocket_port,
                            clientId: 'qky_circle-' + Math.round(Math.random() * Math.pow(10, 5)).toString() + "-" + new Date().getTime().toString()
                        });
                        var mqttTopic = $("html").attr("mqtt-topic");
                        var onMessageArrivedFun = $("html").attr("mqtt-onMessageArrived");
                        if (mqttTopic && onMessageArrivedFun) {
                            $(document).mqtt({
                                topic: data.bizData.env + '/' + mqttTopic,
                                onMessageArrived: eval(onMessageArrivedFun)
                            });
                        }
                    }
                });
            }
        }
    };

    return INIT;
});
