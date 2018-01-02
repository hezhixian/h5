/**
 * Created by tengen on 2017/11/23.
 */
define(function(require) {
    var common = require('common');
    var courseTeaStatApi = {
        // 获得教师统计数据
        getCourseTeaStat: function(courseCode) {
            return common.ajaxFun({
                url: '/course/teaStat/getCourseTeaStat',
                data: {
                    courseCode: courseCode
                }
            });
        },

    };
    return courseTeaStatApi;
});