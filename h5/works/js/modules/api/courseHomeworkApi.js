/**
 * Created by tengen on 2017/11/23.
 */
define(function (require) {
    var common = require('common');
    var courseHomeworkApi ={
        /**
         * 分页查询学生提交的作业
         * @param dynamicCode
         * @returns {*}
         */
        queryPage: function (dynamicCode,pageNo,pageSize) {
            return common.ajaxFun({
                url:'/course/homework/queryPage',
                data:{
                    dynamicCode: dynamicCode,
                    pageNo:pageNo,
                    pageSize:pageSize
                }
            });
        },

        /**
         * 家长端查询学生提交的某次课后作业和教师评价信息
         * @param dynamicCode
         * @returns {*}
         */
        queryMyHomeWorkFouStu: function (dynamicCode) {
            return common.ajaxFun({
                url:'/course/homework/queryMyHomeWorkFouStu',
                data:{
                    dynamicCode: dynamicCode
                }
            });
        },

        /**
         * 删除作业
         * @param homeworkCode
         * @returns {*}
         */
        deleteHomework: function (homeworkCode) {
            return common.ajaxFun({
                url:'/course/homework/deleteHomework',
                data:{
                    homeworkCode: homeworkCode
                }
            });
        },

        /**
         * 查询最新一次学生上传的作业时间（用于教师端New图标展示）
         * @param courseCode
         * @returns {*}
         */
        latestUploadHomeworkTime: function (courseCode) {
            return common.ajaxFun({
                url:'/course/homework/latestUploadHomeworkTime',
                data:{
                    courseCode: courseCode
                }
            });
        },

        /**
         * 获取点评作业信息
         * @param code 作业代码
         */
        queryHomeWorkByCode:function (homeWorkCode) {
            return common.ajaxFun({
                url:'/course/homework/queryHomeWorkByCode',
                data:{
                    code: homeWorkCode
                }
            });
        },

        /**
         * 教师：作业点评/再次点评
         * @param params 参数对象
         * @returns {*}
         */
        commentHomeWork:function (params) {
            return common.ajaxFun({
                url:'/course/homework/commentHomeWork',
                type:'post',
                data:{
                    code: params.code,
                    reviewContent: params.reviewContent,
                    reviewStar: params.reviewStar
                }
            });
        },

        /**
         * 上传作业
         * @param postData 参数数据
         * @returns {*}
         */
        uploadHomework:function (postData) {
            return common.ajaxFun({
                url:'/course/homework/uploadHomework',
                contentType: 'application/json;charset=UTF-8',
                type: "POST",
                data:JSON.stringify(postData),
            });
        }
    };
    return courseHomeworkApi;
});
