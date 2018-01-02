/**
 * Created by tengen on 2017/11/23.
 */
define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var util = require('util');
    var schoolTermApi ={
        /**
         * 获取当前学期
         * @returns {*}
         */
        currTerm: function () {
            var _cache = util.getLocalValue("currentTerm");
            if (!_cache || (new Date()).getTime() - _cache.cacheTime > 2 * 60 * 60 * 1000) {
                common.ajaxFun({
                    url: '/school/term/currTerm',
                    async:false,
                    onSuccess:function (res) {
                        _cache = {data: res.bizData, cacheTime: (new Date()).getTime()};
                        util.setLocalValue("currentTerm", _cache);
                    }
                });
            }
            var dfd =$.Deferred();
            dfd.resolve(_cache.data);
            return dfd.promise();
        }

    };
    return schoolTermApi;
});
