/**
 * Created by tengen on 2017/11/23.
 */
define(function (require) {
    var common = require('common');
    var courseCommentApi ={
        /**
         * 点好接口
         * @param dynamicCode
         * @returns {*}
         */
        addGood: function (dynamicCode) {
            return common.ajaxFun({
                url:'/course/good/addGood',
                data:{
                    dynamicCode: dynamicCode
                }
            });
        }
    };
    return courseCommentApi;
});
