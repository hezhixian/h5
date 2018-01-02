/**
 * Created by tengen on 2017/11/23.
 */
define(function (require) {
    var common = require('common');
    var wxApi ={
        getWxConfig: function (url) {
            return common.ajaxFun({url:'/wechat/mp/getWxConfig',data:{url: url}});
        }
    };
    return wxApi;
});
