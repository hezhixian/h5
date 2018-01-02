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
    var courseInfoApi = require('api/courseInfoApi.js');

    var vm = avalon.define({
        $id: 'courseList',
        headImage:"/image/teacher.jpg",      //用户头像
        name:"",           //用户名称
        userType:0,       //用户身份
        // headImageEnum:{1:'/image/teacher.jpg',4:'/image/student1.png'},
        myList:[],        //我的课程列表
        count:0,          //课程统计
        allList:[],       //全部课程列表
        pageNo:1,
        pageSize:10,
        total:1,
        loading:false,
        init: function () {
            var account=util.getLocalValue("account");
            vm.userType=account.userType;
            vm.headImage=account.headImage ||(account.userType==1?"/images/teacher_tx.jpg":"/image/student1.png");
            vm.name=account.name;
            vm.queryMyList();
            vm.loadMore();
            if(vm.userType==1) {
                vm.queryAllCourses();
            }
        },

        //获取我的课程列表
        queryMyList:function () {
            //教师身份
            if(vm.userType==1) {
                courseInfoApi.myCourseListForTea().then(function (res) {
                    vm.myList = res.bizData;
                    vm.count = vm.myList.length;
                    if(vm.count==0){
                        $('#nodataOne').show();
                    }
                })
            }
            //学生身份
            else if(vm.userType==4){
                courseInfoApi.myCourseListForStu().then(function (res) {
                    vm.myList = res.bizData;
                    vm.count = vm.myList.length;
                    if (vm.count == 0) {
                        $('#nodataOne').show();
                    }
                    $("#hasDone").show();
                })
            }
        },

        //分页查询全部课程
        queryAllCourses:function () {
            $('#moreTips').show();
            courseInfoApi.queryPageCourses(vm.pageNo,vm.pageSize).then(function (res) {
                if(common.isSuccess(res)) {
                    $('#moreTips').hide();
                    $('.partTwo').show();
                    vm.loading = false;
                    vm.allList = vm.allList.concat(res.bizData.rows);
                    if (vm.allList.length == 0) {
                        $('#nodataTwo').show();
                    }
                    vm.total = res.bizData.total;
                    if (vm.pageNo >= vm.total) {
                        $("#hasDone").show();
                    }
                }else {
                    $('#moreTips').hide();
                    $('.partTwo').show();
                    $('#nodataTwo').show();
                }
            })
         },

        //滚动加载
        loadMore: function () {
            $(document.body).infinite().on("infinite", function () {
                if (vm.loading) return;
                vm.loading = true;
                vm.pageNo = vm.pageNo + 1;
                if(vm.pageNo > vm.total){
                    return;
                }
                vm.queryAllCourses();
            });
        },

        //跳转到动态列表
        jumpToDynamic:function (code) {
            courseInfoApi.courseInfo(code).then(function (res) {
                var currCourse = res.bizData.value;
                util.setLocalValue("currCourse", currCourse);
                window.location.href='../dynamic/index.html';
            });
        }

    });

    avalon.ready(function () {
        vm.init();
    })
});