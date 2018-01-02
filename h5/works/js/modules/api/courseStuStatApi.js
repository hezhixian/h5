/**
 * Created by tengen on 2017/11/23.
 */
define(function(require) {
    var common = require('common');
    var courseStuStatApi = {
        queryTermStatByStudent: function(courseCode, studentId) {
            return common.ajaxFun({
                url: '/course/stuStat/queryTermStatByStudent',
                data: {
                    courseCode: courseCode,
                    studentId: studentId
                }
            });
        },
        // 获得互动值排名
        getCourseStuStatWeekly: function(courseCode, beforeWeek, top) {
            return common.ajaxFun({
                url: '/course/stuStat/getCourseStuStatWeekly',
                data: {
                    courseCode: courseCode,
                    beforeWeek: beforeWeek,
                    top: top
                }
            });
        },
        // 获取学生学期的评星，表扬情况，按照评星排名
        getTermStatByCourseCode: function(courseCode, pageNo, pageSize) {
            return common.ajaxFun({
                url: '/course/stuStat/getTermStatByCourseCode',
                data: {
                    courseCode: courseCode,
                    pageNo: pageNo,
                    pageSize: pageSize
                }
            });
        }
    };
    return courseStuStatApi;
});