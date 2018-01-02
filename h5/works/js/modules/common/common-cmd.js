 define(function (require) {
    var jQuery = require('jquery'), $ = jQuery;
     var cookie = require('cookie');
    var avalon = require('avalon');
    var util = require('util');
     var INIT = require('init');
     var wx = require('jweixin');

    var common = {
        _init: function () {
            //初始化jquery.mqtt
            INIT.mqtt();
            //记录最近访问的页面地址，下次登录时直接跳转至上次关闭的页面
            /*setTimeout(function () {
                if ($('html').attr('needTracePage') != 'false') {
                    util.setLocalValue('latestPageUrl', window.location.href);
                }
            }, 200);*/
        },

        ajaxFun: function (options) {
            // 设置默认参数
            var settings = $.extend({
                url: '',
                loading: true,
                isPlain: true,      //content-type是否为空text/plain
                isXhr: false,    //检查跨域头（主平台）
                async: true,
                cache: false,
                data: {},
                type: 'get',
                dataType: 'json',
                contentType:"application/x-www-form-urlencoded",
                onSuccess: function (data) {
                },
                onError: function (data) {
                }
            }, options);
            //请求统一打开loading层
            // if (settings.loading) {
            //     var loadIndex = util.openLoading();
            // }
            //普通方式
            return $.ajax({
                url: settings.url,
                type: settings.type,
                data: settings.data,
                async: settings.async,
                cache: settings.cache,
                dataType: settings.dataType,
                contentType:settings.contentType,
                xhrFields: {
                    withCredentials: settings.isXhr
                },
                complete: function () {
                    // if (settings.loading) {
                    //     //关闭loading层
                    //     util.closeLoading(loadIndex);
                    // }
                },
                success: function (data) {
                    if (common.isSuccess(data)) {
                        settings.onSuccess.call(this, data);
                    } else {
                        console.log("请求出错");
                    }
                },
                error: function (data) {
                    console.log("ajax error", data);
                    settings.onError.call(this, data);
                }
            });
        },
        isSuccess: function (result,sourceURL) {
            if(typeof(sourceURL) == "undefined"){
                sourceURL=window.location.pathname;
            }
            var rtnCode = result.rtnCode || result;
            if (result.uri && rtnCode == "0000001") {//登录无效
                window.location.href = result.uri;
                return false;
            }
            //参数错误异常
            if (rtnCode == '0100001')
                return false;
            if (rtnCode == '0000000')
                return true;
        },

        //判断三种环境
        getEnvironment: function () {
            if (window.document.location.host.indexOf("dev") >= 0 || window.document.location.host.indexOf("127.0.0.1") >= 0 || window.document.location.host.indexOf("localhost") >= 0) {
                return 'dev';
            } else if (window.document.location.host.indexOf("test") >= 0) {
                return 'test';
            } else {
                return 'pro';
            }
        },

        //获取用户信息
        getUserInfo: function (callback) {
            var clientType = util.getQueryString("clientType")||"";

            common.ajaxFun({
                url: "/sys/user/getUserInfo?clientType="+clientType,
                loading: false,
                async: false,
                onSuccess: function (data) {
                    var account=data.bizData.account;
                    util.setLocalValue("account", account);
                    util.setLocalValue("projectInfo", data.bizData.projectInfo);
                    util.setLocalValue("accessToken", data.bizData.accessToken);
                    //学生身份，缓存家长身份信息
                    if(account.userType==4) {
                        util.setLocalValue("guardianship", data.bizData.guardianship);
                    }
                    //data.bizData.jwt && util.setLocalValue("_jwt_", data.bizData.jwt);
                    //data.bizData.payload && util.setLocalValue("payload", data.bizData.payload);
                    data.bizData.loginSource && util.setLocalValue("loginSource", data.bizData.loginSource);
                    if(clientType!=""){
                        $.cookie("clientType", clientType);
                    }
                    callback && callback(data.bizData);
                }
            });
        },
        
        //获取当前登录用户
        getCurrUser: function (key) {
            return util.getLocalValue('account', key) || {};
        },

        //获取当前登录用户的身份代码；1 => 教师；2 => 家长； 4 => 学生； 8 => 机构；'' => 未知
        getCurrUserType: function () {
            return util.getLocalValue('account', 'userType') || '';
        },

        //获取项目信息
        getProjectInfo: function (key) {
            return util.getLocalValue('projectInfo', key) || {};
        },



        errorPlacement: function (error, element) {
            if (element.is(':radio') || element.is(':checkbox')) { //如果是radio或checkbox
                var eid = element.attr('name'); //获取元素的name属性
                element = $("input[name='" + eid + "']").last().parent(); //将错误信息添加当前元素的父结点后面
            }
            if (!error.is(':empty')) {

                $(element).not('.valid').qtip({
                    overwrite: false,
                    content: error,
                    hide: false,
                    show: {
                        event: false,
                        ready: true
                    },
                    style: {
                        classes: 'qtip-cream qtip-shadow qtip-rounded'
                    },
                    position: {
                        my: 'top left',
                        at: 'bottom right'
                    }
                }).qtip('option', 'content.text', error);
            }
            else {
                element.qtip('destroy');
            }
        },
        closeAllTip: function () {
            $('.qtip').each(function () {
                $(this).data('qtip').destroy();
            });
        },

        //wx初始化
        wxInit:function () {
            common.ajaxFun({
                url: '/wechat/mp/getWxConfig',
                data:{url: window.location.href},
                onSuccess: function (res) {
                    var appId = res.bizData.appId;
                    var nonceStr = res.bizData.nonceStr;
                    var signature = res.bizData.signature;
                    var timestamp = res.bizData.timestamp;
                    wx.config({
                        beta: true,// 必须这么写，否则在微信插件有些jsapi会有问题
                        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: appId, // 必填，企业微信的cropID
                        timestamp: timestamp, // 必填，生成签名的时间戳
                        nonceStr: nonceStr, // 必填，生成签名的随机串
                        signature: signature,// 必填，签名，见[附录1](#11974)
                        jsApiList: [
                            "onMenuShareTimeline"
                        ] // 必填，需要使用的JS接口列表
                    });
                }
            });
        }
    };

    //avalon自定义过滤器
    if (typeof(avalon) != "undefined") {
        avalon.filters.booleanFilter = function (str) {
            if (str) {
                return '是';
            }
            else {
                return '否';
            }
        };
        var sex = ['', '男', '女'];
        avalon.filters.sexFilter = function (str) {
            return sex[str];
        };
        //用户类型过滤器
        avalon.filters.userType = function (type) {
            if (type == 1) {
                return "教师"
            } else if (type == 2) {
                return"家长"
            }else if (type == 4) {
                return"学生"
            }
        };
        //时间差过滤器
        avalon.filters.timeFilter = function (time) {
            var date1= time;  //开始时间
            var date2 = new Date().getTime();    //结束时间
            var date3 = date2 - date1;   //时间差的毫秒数
            //计算出相差天数
            var days=Math.floor(date3/(24*3600*1000));
            //计算出小时数
            var leave1=date3%(24*3600*1000) ;   //计算天数后剩余的毫秒数
            var hours=Math.floor(leave1/(3600*1000));//计算相差分钟数
            var leave2=leave1%(3600*1000) ;       //计算小时数后剩余的毫秒数
            var minutes=Math.floor(leave2/(60*1000));//计算相差秒数
            var leave3=leave2%(60*1000);    //计算分钟数后剩余的毫秒数
            var seconds=Math.round(leave3/1000);
            if(days>0){
                return days+"天前"
            }else if(hours>0){
                return hours+"小时前"
            }else if(minutes>0){
                return minutes+"分钟前"
            }else if(seconds>0){
                return seconds+"秒前"
            }
        };
    }

    //判断是否需要公共初始化部分
    if ($('body').attr('needCommonInit') != 'false') {
        common._init();
    }
    return common;
});

