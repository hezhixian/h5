define(function (require) {

    var $ = require('jquery');
    var avalon = require('avalon');
    var layer = require('layer_mobile');
    var util = require('util');
    var common = require('common');
    require('security');

    var vm = avalon.define({
        $id: "login",
        username: "",        //用户名
        password: "",        //密码
        appId:"",
        openId:"",
        clientType:"1", //客户端类型 0-pc 1-app 20-wechat 21-wechat_mp 22-wechat_cp
        rememberMe:false,
        pKey: "",             //公钥
        loginVerify: '',  //登录验证码
        showLoginVerify: false, //是否开启登录验证
        loginVerifyImg: '', //登录验证图片
        //刷新验证码
        changeLoginImg: function () {
            vm.loginVerifyImg = '/sys/user/getVerifyImgByLogin?' + new Date();
        },
        //获取公钥
        getPublicKey: function () {
            $.ajax({
                url: "/sys/user/getMxByLogin",
                cache: false,
                dataType: "json",
                success: function (res) {
                    if(res.rtnCode == '0000000'){
                        vm.pKey = RSAUtils.getKeyPair(res.bizData.exponent, '', res.bizData.modules);
                    }
                }
            });
        },
        //获取登录失败次数
        getErrorCount: function () {
            $.ajax({
                url: "/sys/user/getErrorCountByLogin",
                cache: false,
                dataType: "json",
                success: function (res) {
                    if (res.rtnCode == '0000000' && res.bizData >= 3) {
                        vm.showLoginVerify = true;
                        vm.changeLoginImg();
                    }
                }
            });
        },
        init: function () {
            vm.clientType = util.getQueryString('clientType')||'1';
            vm.appId = util.getQueryString('appId');
            vm.openId = util.getQueryString('openId');
            vm.username = util.getLocalValue("username")||'';
            vm.rememberMe = util.getLocalValue("rememberMe")||false;
            var password = util.getLocalValue("password")||'';
            if(vm.rememberMe && password!=''){
                vm.password = password;
            }
            vm.getErrorCount();
            vm.getPublicKey();
        },
        //回车登录
        enter: function (event) {
            if (event.keyCode == 13) {
                vm.login();
            }
        },
        //登录
        login: function () {
            if (vm.username == "") {
                layer.open({content:"请输入用户名！",btn:"确定"});
                return;
            }
            if (vm.password == "") {
                layer.open({content:"请输入密码！",btn:"确定"});
                return;
            }
            if (vm.showLoginVerify && vm.loginVerify == "") {
                layer.open({content:"请输入验证码！",btn:"确定"});
                return;
            }
            var psw = RSAUtils.encryptedString(vm.pKey, vm.password);
            common.ajaxFun({
                url: "/sys/user/login",
                dataType: "json",
                data: {username: vm.username, password: psw, verifyImg: vm.loginVerify,clientType:vm.clientType,appId:vm.appId, openId:vm.openId},
                onSuccess: function (res) {
                    avalon.log('登录返回成功=', res);
                    if (res.bizData.isSuccess) {
                        util.setLocalValue("isApp", true);
                        util.setLocalValue("username", vm.username);
                        util.setLocalValue("rememberMe", vm.rememberMe);
                        if(vm.rememberMe){
                            util.setLocalValue("password", vm.password);
                        }else{
                            util.removeLocalItem("password");
                        }
                        window.location = res.bizData.jumpToH5Url;
                    } else {
                        vm.getErrorCount();
                        vm.changeLoginImg();
                        layer.open({content:res.bizData.msg,btn:"确定"});
                    }
                },
                onError: function (res) {
                    avalon.log("登录返回失败", res);
                    layer.open({content:'您输入的密码有误，请重新输入。',btn:"确定"});
                }
            });
        }
    });

    //初始化完成
    avalon.ready(function () {
        vm.init();
    });
});