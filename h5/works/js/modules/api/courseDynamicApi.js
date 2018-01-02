/**
 * Created by tengen on 2017/11/23.
 */
define(function (require) {
    var common = require('common');
    var courseDynamicApi ={
        /**
         * 分页查询动态列表
         * @param courseCode
         * @param pageNo
         * @param pageSize
         * @returns {*}
         */
        queryPage: function (courseCode,pageNo,pageSize) {
            return common.ajaxFun({
                url:'/course/dynamic/queryPage',
                data:{
                    courseCode: courseCode,
                    pageNo:pageNo,
                    pageSize:pageSize
                }
            });
        },

        /**
         * 查询老师布置全部作业列表（教师端）
         * @param courseCode
         * @returns {*}
         */
        queryAllHomeWorkDynamicForTea: function (courseCode) {
            return common.ajaxFun({
                url:'/course/dynamic/queryAllHomeWorkDynamicForTea',
                data:{
                    courseCode: courseCode
                }
            });
        },

        /**
         * 查询老师布置全部作业列表（家长端）
         * @param courseCode
         * @returns {*}
         */
        queryAllHomeWorkDynamicForStu: function (courseCode) {
            return common.ajaxFun({
                url:'/course/dynamic/queryAllHomeWorkDynamicForStu',
                data:{
                    courseCode: courseCode
                }
            });
        },

        /**
         * 查询最新一次布置的作业时间(用于家长端New图标展示)
         * @param courseCode
         * @returns {*}
         */
        latestHomeworkDynamicTime: function (courseCode) {
            return common.ajaxFun({
                url:'/course/dynamic/latestHomeworkDynamicTime',
                data:{
                    courseCode: courseCode
                }
            });
        },

        /**
         * 置顶或者取消置顶操作
         * @param dynamicCode
         * @param stick
         * @returns {*}
         */
        changeStickDynamic: function (dynamicCode,stick) {
            return common.ajaxFun({
                url:'/course/dynamic/changeStickDynamic',
                data:{
                    dynamicCode: dynamicCode,
                    stick:stick
                }
            });
        },

        /**
         * 删除动态
         * @param dynamicCode
         * @param stick
         * @returns {*}
         */
        deleteDynamic: function (dynamicCode) {
            return common.ajaxFun({
                url:'/course/dynamic/deleteDynamic',
                data:{
                    dynamicCode: dynamicCode
                }
            });
        },

        /**
         * 查询一个动态的详情，包括点好家长信息
         * @param dynamicCode
         * @param stick
         * @returns {*}
         */
        queryOneDynamic: function (dynamicCode) {
            return common.ajaxFun({
                url:'/course/dynamic/queryOneDynamic',
                data:{
                    dynamicCode: dynamicCode
                }
            });
        },

        /**
         * 创建动态
         * @param postData 参数数据
         * @returns {*}
         */
        createDynamic:function (postData) {
            return common.ajaxFun({
                url:'/course/dynamic/createDynamic',
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                data:JSON.stringify(postData),
            });
        },

        /**
         * 查询学生被表扬的动态列表
         * @param courseCode
         * @param studentId
         * @returns {*}
         */
        queryPraiseDynamicList:function (courseCode,studentId) {
            return common.ajaxFun({
                url:'/course/dynamic/queryPraiseDynamicList',
                contentType: 'application/json;charset=UTF-8',
                data:{
                    courseCode:courseCode,
                    studentId:studentId
                }
            });
        }

    };
    return courseDynamicApi;
});
