/**
 * Created by Administrator on 2017/12/20 0020.
 */
define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var util = require('util');
    var avalon = require('avalon');
    require('jquery_weui')($);
    var layer = require('layer_mobile');

    var courseStuStatApi = require('api/courseStuStatApi');
    var courseTeaStatApi = require('api/courseTeaStatApi');

    var vm = avalon.define({
        $id: 'teacher',
        courseCode: '',
        weekly: 0,
        pageNo: 1,
        pageSize: 5,
        stuStatWeekly: [],
        teaStat: {},
        stuTermStat: [],
        stuTermStatLoading: false,
        stuTermStatLoadAll: false,
        init: function () {
            if (!vm.initParam()) {
                layer.open({
                    content: "请在公众号中打开！",
                    btn: "确定"
                });
                return;
            }
            vm.getData();

        },
        // 初始化部分开始
        initParam: function () {
            // 教师身份
            var account = util.getLocalValue("account");
            if (account) {
                if (util.getLocalValue('currCourse') && util.getLocalValue('currCourse').code) {
                    vm.courseCode = util.getLocalValue('currCourse').code;
                }
                if (!vm.courseCode || vm.courseCode == '') {
                    return false;
                }
                if (account.userType == 4) {
                    return false;
                }
                return true;
            } else {
                return false;
            }
        },
        // 初始化部分结束
        getData: function () {
            vm.getCourseStuStatWeekly();
            vm.getCourseTeaStat();
            vm.getTermStatByCourseCode();
        },
        getCourseStuStatWeekly: function () {
            // 获取互动值排名数据
            courseStuStatApi.getCourseStuStatWeekly(vm.courseCode, 1, true).success(function (res) {
                var tmp = [];
                for (var index = 0; index < 3; index++) {
                    if (res.bizData && res.bizData[index]) {
                        tmp.push(res.bizData[index]);
                    } else {
                        tmp.push({"studentId": "", "studentName": "暂无", "score": "0", "studentAvatar": ""});
                    }
                    if (index == 2) {
                        var val1 = tmp[0];
                        var val2 = tmp[1];
                        tmp[0] = val2;
                        tmp[1] = val1;
                        vm.stuStatWeekly = tmp;
                    }
                }
            }).fail(function (res) {

            });
        },
        getCourseTeaStat: function () {
            // 获取教师发动态数据
            courseTeaStatApi.getCourseTeaStat(vm.courseCode).success(function (res) {
                if (res.bizData) {
                    vm.teaStat = res.bizData;
                }
            }).fail(function (res) {
                vm.teaStat = {};
            });
        },
        getTermStatByCourseCode: function () {
            vm.stuTermStatLoading = true;
            // 分页获取学生表扬数据
            courseStuStatApi.getTermStatByCourseCode(vm.courseCode, vm.pageNo, vm.pageSize).success(function (res) {
                vm.stuTermStatLoading = false;
                if (res.bizData) {
                    if (res.bizData.length < vm.pageSize) {
                        vm.stuTermStatLoadAll = true;
                    }
                    res.bizData.forEach(function (value, index) {
                        vm.stuTermStat.push(value);
                    });
                } else {
                    vm.stuTermStatLoadAll = true;
                }
            }).fail(function (res) {
                vm.stuTermStatLoading = false;
            });
        },

        loadMore: function () {
            if (!vm.stuTermStatLoading) {
                vm.pageNo = vm.pageNo + 1;
                vm.getTermStatByCourseCode();
            }
        },
        linkCreate:function () {
            window.location.href = "../dynamic/create.html?historyUrl=" + window.location.href;
        }

    });

    avalon.ready(function () {
        vm.init();
    })
});