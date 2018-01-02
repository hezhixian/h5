/**
 * Created by tengen on 2017/11/23.
 */
define(function (require) {
    var common = require('common');
    var userApi ={
        getRoles: function (params) {
            return common.ajaxFun({url:'/sys/user/getRoles',data:params});
        },
        //获取公钥
        getPublicKey: function () {
            return $.ajaxFun({
                url: "/sys/user/getMxByLogin",
                cache: false,
                dataType: "json"
            });
        },
        //发送验证码
        sendVerifyCode: function(phone){
            return common.ajaxFun({url:'/sys/user/sendVerifyCodeByLogin',data:{phone:phone}});
        },
        //绑定公众号用户
        bindMpUser: function(appId,openId,phone,verifyCode){
            return common.ajaxFun({url:'/sys/user/bindMpUserByLogin',data:{clientType:21,appId:appId, openId:openId,phone:phone,verifyCode:verifyCode}});
        }
    };
    return userApi;
});
