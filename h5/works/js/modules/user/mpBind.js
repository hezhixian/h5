/**
 * 微信公众号绑定
 * Created by tengen on 2017/12/12.
 */
define(function (require) {
    var $ = require('jquery');
    var avalon = require('avalon');
    var util = require('util');
    var common = require('common');
    var userApi = require('api/userApi');

    var vm = avalon.define({
        $id: "vmMpBind",
        phone: '',
        verifyCode: '',
        appId:"",
        openId:"",
        init: function () {
            vm.appId = util.getQueryString('appId')||'';
            vm.openId = util.getQueryString('openId')||'';
        },
        /**
         * 显示吐司消息
         * @param level 级别 0-一般提示，其他为错误提示
         * @param msg
         * @param timeout 超时时间 单位秒
         */
        toast: function(level,msg,timeout){
            if(level==0){
                $("#infoTip").html(msg).slideDown(500);
                setTimeout(function(){
                    $("#infoTip").slideUp(500);
                },(timeout||3)*1000);
            }else{
                $("#errTip").html(msg).slideDown(500);
                setTimeout(function(){
                    $("#errTip").slideUp(500);
                },(timeout||3)*1000);
            }
        },
        sendVerifyCode: function () {
            if(vm.phone==''){
                vm.toast(1,"手机号码不能为空！");
                return;
            }
            userApi.sendVerifyCode(vm.phone).success(function(res){
                vm.toast(res.bizData.success?0:1,res.bizData.msg);
            });
        },
        bindMpUser:function(){
            if(vm.appId==''||vm.openId==''){
                vm.toast(1,"请从正常渠道进入！");
                return;
            }
            if(vm.phone==''){
                vm.toast(1,"手机号码不能为空！");
                return;
            }
            if(vm.verifyCode==''){
                vm.toast(1,"验证码不能为空！");
                $(".clsVerify").addClass('redcode').find('i').html("&#xe685;");
                return;
            }else{
                $(".clsVerify").removeClass('redcode').find('i').html("&#xe60f;");
            }
            userApi.bindMpUser(vm.appId,vm.openId,vm.phone,vm.verifyCode).success(function(res){
                vm.toast(res.bizData.success?0:1,res.bizData.msg);
                if(res.bizData.success) {
                    setTimeout(function () {
                        window.location = res.bizData.value;
                    }, 3000);
                }
            });
        }
    });

    avalon.ready(function () {
        vm.init();
    })
});
