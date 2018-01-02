/**
 * Created by tengen on 2017/11/23.
 */
define(function (require) {
    var common = require('common');
    var courseStudentApi ={
        queryList: function (courseCode) {
            return common.ajaxFun({url:'/course/student/queryList',data:{courseCode: courseCode}});
        },
        // 查看当前用户是否选修这门课程
        hasCourse: function (courseCode) {
            return common.ajaxFun({url:'/course/student/hasCourse',data:{courseCode: courseCode}});
        }
    };
    return courseStudentApi;
});
