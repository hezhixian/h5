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
            $id: 'stuScoreRank',
            courseCode: '',
            stuStatWeekly: [],
            oneweek: [],
            fourweeks: [],
            init: function () {
                if (!vm.initParam()) {
                    layer.open({
                        content: "请在公众号中打开！",
                        btn: "确定"
                    });
                    return;
                }
                vm.getData();
                vm.initPicker();

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
            initPicker: function () {
                $("#week").picker({
                    title: "互动统计时间",
                    cols: [
                        {
                            textAlign: 'center',
                            values: ['本周统计', '近四周统计',]
                        }
                    ],
                    onClose: function (p) {
                        if (p.value) {
                            if(p.cols[0].activeIndex==1){
                                vm.getCourseStuStatWeekly(4);
                            }else{
                                vm.getCourseStuStatWeekly(1);
                            }
                        }
                    }
                });
            },
            // 初始化部分结束
            getData: function () {
                vm.getCourseStuStatWeekly(1);
            },
            getCourseStuStatWeekly: function (beforeweek) {
                if (beforeweek == 1 && vm.oneweek.length > 0) {
                    vm.stuStatWeekly = vm.oneweek;
                    return;
                }

                if (beforeweek == 4 && vm.fourweeks.length > 0) {
                    vm.stuStatWeekly = vm.fourweeks;
                    return;
                }
                // 获取互动值排名数据
                courseStuStatApi.getCourseStuStatWeekly(vm.courseCode, beforeweek, false).success(function (res) {
                    if (res.bizData) {
                        if (beforeweek == 1) {
                            vm.oneweek = res.bizData;
                            vm.stuStatWeekly = res.bizData;
                        }
                        if (beforeweek == 4) {
                            vm.fourweeks = res.bizData;
                            vm.stuStatWeekly = res.bizData;
                        }
                    }

                }).fail(function (res) {

                });
            },
        })
        ;

    avalon.ready(function () {
        vm.init();
    })
})
;