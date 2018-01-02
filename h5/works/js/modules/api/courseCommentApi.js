/**
 * Created by tengen on 2017/11/23.
 */
define(function (require) {
    var common = require('common');
    var courseCommentApi ={
        /**
         * 添加评论
         * @param param
         * @param {String} dynamicCode 动态code
         * @param {String} courseCode  课程code
         * @param {String} content     评论内容
         * @param {String} parentCommentCode 父级code
         * 一级评论:parentCommentCode为0
         * 回复评论:parentCommentCode为父级code
         * @returns {*}
         */
        addComment: function (param) {
            return common.ajaxFun({
                url:'/course/comment/addComment',
                type:'post',
                data:param
            });
        },

        /**
         * 获取动态的评论
         * @param dynamicCode
         * @returns {*}
         */
        queryCommentList: function (dynamicCode) {
            return common.ajaxFun({
                url:'/course/comment/queryCommentList',
                type:'post',
                data:{dynamicCode:dynamicCode}
            });
        }
    };
    return courseCommentApi;
});
