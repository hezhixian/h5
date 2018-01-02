/**
 * Created by Administrator on 2017/12/03.
 * 教师家长数据来源不同
 */
define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var util = require('util');
    var avalon = require('avalon');
    var attachFastClick = require('fastclick');
    var swiper=require('swiper')($);
    require('jquery_weui')($);
    var courseDynamicApi = require('api/courseDynamicApi.js');

    var vm = avalon.define({
        $id: 'homeworkDynamicList',
        userType:0,
        courseCode:'',
        homeworkList:[],       //布置的作业列表
        count:0,

        init: function () {
            vm.courseCode=util.getLocalValue("currCourse").code;
            var account=util.getLocalValue("account");
            vm.userType=account.userType;
            vm.queryAllHomeWorkDynamic();
        },

        //获取布置的作业列表
        queryAllHomeWorkDynamic:function () {
            $('#moreTips').show();
            //教师
            if(vm.userType==1) {
                courseDynamicApi.queryAllHomeWorkDynamicForTea(vm.courseCode).then(function (res) {
                    $('#moreTips').hide();
                    var localHomeworkTimeList=util.getLocalValue("localHomeworkTimeList")||[];
                    $.each(res.bizData,function (index,el) {
                        if(el.latestHomeworkTime==0){
                            el.hasNew=false;
                            return;
                        }
                        el.hasNew=true;
                        $.each(localHomeworkTimeList,function (index,item) {
                            if(item.code==el.code&&el.latestHomeworkTime<item.localTime){
                                el.hasNew=false;
                                return;
                            }
                        });
                    });
                    vm.homeworkList = res.bizData;
                    vm.count = vm.homeworkList.length;
                    if(vm.count==0){
                        $('#nodata').show();
                    }else {
                        $('#data').show();
                    }
                })
            }
            //家长
            else if(vm.userType==4){
                $('#moreTips').show();
                courseDynamicApi.queryAllHomeWorkDynamicForStu(vm.courseCode).then(function (res) {
                    $('#moreTips').hide();
                    vm.homeworkList = res.bizData;
                    vm.count = vm.homeworkList.length;
                    if(vm.count==0){
                        $('#nodata').show();
                    }else {
                        $('#data').show();
                    }
                })
            }
        },
        //教师身份跳转到详情
        jumpToDetail:function (code) {
            var localHomeworkTimeList=util.getLocalValue("localHomeworkTimeList")||[];
            var isExist=false;
            $.each(localHomeworkTimeList,function (index,el) {
                if (el.code == code) {
                    isExist=true;
                    el.localTime=new Date().getTime();
                    return;
                }
            });
            if(!isExist){
                var localHomeworkTime={
                    code:code,
                    localTime:new Date().getTime()
                };
                localHomeworkTimeList.push(localHomeworkTime);
            }
            util.setLocalValue("localHomeworkTimeList",localHomeworkTimeList);
            window.location.href='teaDetail.html?homework=true&code='+code;
        },
        utf161:function (str) {
            return util.entitiestoUtf16(str);
        }
    });

    avalon.ready(function () {
        vm.init();
    })
});