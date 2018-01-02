/**
 * Created by Administrator on 2017/12/03.
 * 教师家长同
 */
define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var util = require('util');
    var avalon = require('avalon');
    var attachFastClick = require('fastclick');
    var swiper=require('swiper')($);
    require('jquery_weui')($);
    var courseInfoApi = require('api/courseInfoApi.js');

    var vm = avalon.define({
        $id: 'courseIntro',
        courseCode:'',
        teacherList:[],       //授课教师信息
        faceUrl:'',           //课程封面
        name:'',              //课程名称
        courseIntro:'',       //课程介绍

        init: function () {
            vm.courseCode=util.getLocalValue("currCourse").code;
            vm.courseDetail();
        },

        //获取课程介绍信息
        courseDetail:function () {
            courseInfoApi.courseIntro(vm.courseCode).then(function (res) {
                if(res.bizData.success){
                    vm.teacherList=res.bizData.value.teacherList;
                    vm.faceUrl=res.bizData.value.faceUrl||"/image/emp_class.png";
                    vm.name=res.bizData.value.name;
                    vm.courseIntro=res.bizData.value.courseIntro;
                }else{

                }
            })
        }
    });

    avalon.ready(function () {
        vm.init();
    })
});