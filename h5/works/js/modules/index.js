define(function (require) {
    var $ = require('jquery');
    var avalon = require('avalon');
    var util = require('util');
    var common = require('common');
    var schoolTermApi = require('api/schoolTermApi.js');
    var courseInfoApi = require('api/courseInfoApi.js');
    common.getUserInfo(function () {
        //如果发现有记录最近访问地址，则跳转至该地址
        var latestPageUrl = util.getLocalValue("latestPageUrl");
        if(latestPageUrl&&latestPageUrl!=''){
            window.location.href = latestPageUrl;
            return;
        }

        //获取课程
        //教师身份
        var account=util.getLocalValue("account");
        if(account.userType==1) {
            courseInfoApi.myFirstCourseForTea().then(function (res) {
                var currCourse = res.bizData;
                util.setLocalValue("currCourse", currCourse);
                //教师无代课情况
                if(currCourse.code==undefined||currCourse.code==''){
                    window.location.href = "/html/course/courseList.html";
                }else {
                    window.location.href = "/html/dynamic/index.html";
                }
            });
        }
        //学生身份
        else if(account.userType==4) {
            courseInfoApi.myFirstCourseForStu().then(function (res) {
                var currCourse = res.bizData;
                util.setLocalValue("currCourse", currCourse);
                //学生无选课情况
                if(currCourse.code==undefined||currCourse.code==''){
                    window.location.href = "/html/course/courseList.html";
                }else {
                    window.location.href = "/html/dynamic/index.html";
                }
            });
        }
    });
    
});