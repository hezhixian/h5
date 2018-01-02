/**
 * Created by tengen on 2017/11/23.
 */
define(function (require) {
    var common = require('common');
    var courseInfoApi ={
        /**
         * 我的课程列表(教师)
         * @param termCode
         * @returns {*}
         */
        myCourseListForTea: function () {
            return common.ajaxFun({
                url:'/course/info/myCourseListForTea',
                data:{
                }
            });
        },

        /**
         * 我的第一门课程(教师)
         * @param termCode
         * @returns {*}
         */
        myFirstCourseForTea: function () {
            return common.ajaxFun({
                url:'/course/info/myFirstCourseForTea',
                data:{
                }
            });
        },

        /**
         * 我的课程列表(学生)
         * @param termCode
         * @returns {*}
         */
        myCourseListForStu: function () {
            return common.ajaxFun({
                url:'/course/info/myCourseListForStu',
                data:{
                }
            });
        },

        /**
         * 我的第一门课程(学生)
         * @param termCode
         * @returns {*}
         */
        myFirstCourseForStu: function () {
            return common.ajaxFun({
                url:'/course/info/myFirstCourseForStu',
                data:{
                }
            });
        },


        /**
         * 课程介绍接口,老师介绍
         * @param courseCode
         * @returns {*}
         */
        courseIntro: function (courseCode) {
            return common.ajaxFun({
                url:'/course/info/courseIntro',
                data:{
                    courseCode: courseCode
                }
            });
        },

        /**
         * 查询课程封面，名称和学生总数，授课老师
         * @param courseCode
         * @returns {*}
         */
        courseInfo: function (courseCode) {
            return common.ajaxFun({
                url:'/course/info/courseInfo',
                data:{
                    courseCode: courseCode
                }
            });
        },

        /**
         * 分页查询全部课程
         * @param pageNo
         * @param pageSize
         * @returns {*}
         */
        queryPageCourses: function (pageNo,pageSize) {
            return common.ajaxFun({
                url:'/course/info/queryPageCourses',
                data:{
                    pageNo:pageNo,
                    pageSize:pageSize
                }
            });
        },

        /**
         * 查询当前用户是否是某门课的授课老师
         * @param courseCode
         * @returns {*}
         */
        hasCourse: function (courseCode) {
            return common.ajaxFun({
                url:'/course/info/hasCourse',
                data:{
                    courseCode: courseCode
                }
            });
        },

    };
    return courseInfoApi;
});
