/**
 * Created by Administrator on 2017/9/8.
 */
define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var util = require('util');
    var avalon = require('avalon');
    var attachFastClick = require('fastclick');
    var swiper=require('swiper')($);
    require('jquery_weui')($);
    var dynamicApi = require('api/courseDynamicApi');
    var courseInfoApi = require('api/courseInfoApi');
    var courseGoodApi = require('api/courseGoodApi');
    var courseCommentApi = require('api/courseCommentApi');
    var courseHomeworkApi = require('api/courseHomeworkApi');


    var vm = avalon.define({
        $id: 'detail',
        courseCode:0,
        userId:0,
        userType:0,
        userName:'',
        courseInfoList:[],
        isDynamic:false,//是否有动态
        dynamicRecord:0,//动态总数
        dynamicList:{},//动态列表
        curDynamicCode:'',
        curDynamicIndex:0,
        curDynamicStick:false,
        text:true,
        showTab:1,
        pageNo:1,
        totalPage:1,
        homeWorkRecord:0,
        homeworkList:[],
        commentTreeList:[],
        loading:false,
        curStuHomework:[],
        curStuHomeworkCode:0,
        totalStuNum:0,
        init: function () {
            vm.getBasicCode();
            vm.getCommand();
            $("#doneTips").hide();
        },
        //获取课程code和用户id
        getBasicCode:function () {
            // vm.courseCode = 'da7d712195a3444c8a4cd4a048014998';
            vm.courseCode=util.getLocalValue('currCourseCode');
            vm.userType = util.getLocalValue('account', 'userType');
            vm.userId = util.getLocalValue('account', 'uid');//家长id或学生id
            vm.userName = util.getLocalValue('account', 'name');
            vm.curDynamicCode=util.getQueryString('code');
            vm.totalStuNum=util.getLocalValue('currCourse','studentNum');
            vm.getDynamic();
        },
        //获取动态列表
        getDynamic: function () {
            //courseCode,pageNo,pageSize
            dynamicApi.queryOneDynamic(vm.curDynamicCode).success(function (res) {
                vm.dynamicList = res.bizData.value;
                if(vm.dynamicList.dynamicType==1){
                    vm.showTab=1;
                    vm.getHomework();
                    vm.getCurStuHomework();
                }else{
                    vm.showTab=2;
                }
                vm.loadMore();
                $(".partTwo").show();
            });
            vm.showMore();
        },
        //获取作业列表
        getHomework:function () {
            if (vm.pageNo <= vm.totalPage) {
                $("#moreTips").show();
                courseHomeworkApi.queryPage(vm.curDynamicCode, vm.pageNo, '10').success(function (res) {
                    vm.totalPage=res.bizData.total;
                    vm.loading = false;
                    vm.homeWorkRecord=res.bizData.records;
                    vm.homeworkList = vm.homeworkList.concat(res.bizData.rows);
                    if (res.bizData.rows.length <= 4) {
                        // vm.isDynamic = false;
                        $("#doneTips").show();
                    }
                    $("#moreTips").hide();
                    $(".partTwo").show();
                })
            }else{
                $("#doneTips").show();
                $("#moreTips").hide();
            }
        },
        //
        getCurStuHomework: function () {
            courseHomeworkApi.queryMyHomeWorkFouStu(vm.curDynamicCode).success(function (res) {
                vm.curStuHomework = res.bizData.value;
                vm.curStuHomeworkCode= vm.curStuHomework.code;
            })
        },
        //获取评价
        getCommand:function () {
            courseCommentApi.queryCommentList(vm.curDynamicCode).success(function (res) {
                vm.commentTreeList =res.bizData;
            })
        },
        //滚动加载
        loadMore: function () {
            $(document.body).infinite().on("infinite", function () {
                if (vm.loading||vm.showTab==2) return;
                vm.loading = true;
                vm.pageNo = vm.pageNo + 1;
                vm.getHomework();
            });
        },
        //展开
        showMore:function () {
            $(".det-ok .p-more").bind("click",function(){
                var div=$(this).parent();
                $(this).find(".icon-gengduo1").toggleClass("icon-shang");
                div.find(".weui-media-box__desc").toggleClass("det-ok-more");
                $(this).toggleClass("zk");
            });
        },
        //点击多媒体执行的操作
        clickMp3:function (id,e) {
            e.stopPropagation();
            var media = document.getElementById(id);
            var isPaused=media.paused;
            var target=$("#"+id).next().children();
            if(isPaused){
                media.play();
                target.children(".voice-gif").show();
                target.children(".voice-png").hide();
            }else{
                media.pause();
                media.currentTime=0;
                target.children(".voice-gif").hide();
                target.children(".voice-png").show();
            }
            media.onended = function() {
                target.children(".voice-gif").hide();
                target.children(".voice-png").show();
            };
        },
        //点击多媒体执行的操作
        clickMp4:function (id,e) {
            var media = document.getElementById(id);
            var target=  $("#"+id).siblings();
            var isPaused=media.paused;
            if (media.requestFullscreen) {
                media.requestFullscreen();
            } else if (media.webkitRequestFullscreen) {
                media.webkitRequestFullscreen();
            } else if (media.mozRequestFullScreen) {
                media.mozRequestFullScreen();
            } else if (media.msRequestFullscreen) {
                media.msRequestFullscreen();
            }
            if(isPaused){
                media.play();
                // media.load();
                target.children(".icon-kaishi1").hide();
                target.children(".weui-loading").show();
                // $("#"+id).css({
                //     "top":'-4px',
                //     "left":0,
                // });
                // setTimeout(function () {
                //     target.children(".weui-loading").hide();
                // }, 1000)
            } else {
                media.pause();
                target.children(".icon-kaishi1").show();
                target.children(".weui-loading").hide();
                // $("#"+id).css({
                //     "top":1000,
                // });
                // $("#"+id).hide();
                // $("#"+id).siblings('div').show();
                // media.currentTime=0;
            }
            media.addEventListener("pause", function()
                {
                    // $("#"+id).css({
                    //     "top":1000,
                    // });
                    // $("#"+id).hide();
                    // $("#"+id).siblings('div').show();
                    // target.children(".icon-kaishi1").show();
                    // target.children(".weui-loading").hide();
                    // media.load();
                    target.children(".icon-kaishi1").show();
                    target.children(".weui-loading").hide();
                }
            );
        },
        //点击图片执行的操作
        clickPic:function (e,imgIndex,dynIndex,mediaSource) {
            e.stopPropagation();
            var imgArray=[];
            if(mediaSource==0){
                vm.dynamicList.attachMapList.forEach(function (el) {
                    imgArray.push(el.fileUrl);
                });
            }else{
                vm.homeworkList[dynIndex].attachMapList.forEach(function (el) {
                    imgArray.push(el.fileUrl);
                });
            }
            var pb1 = $.photoBrowser({
                items:imgArray,
                initIndex:imgIndex
            });
            pb1.open();
        },
        //评论的展开收起
        toggleRemark:function (id) {
            var father=$("#"+id).parents('.interact-box');
            var son=$("#"+id+" .p-more");
            if(father.hasClass("fold")){
                father.removeClass("fold");
                son.find(".iconfont").removeClass("icon-gengduo1").addClass("icon-shang");
                father.find(".foldContent").slideDown();
                son.addClass("zk");
            }else{
                father.addClass("fold");
                son.find(".iconfont").removeClass("icon-shang").addClass("icon-gengduo1");
                father.find(".foldContent").slideUp();
                son.removeClass("zk");
            }
        },
        //点击工具栏
        clickTool:function () {
            $.actions({
                title: "选择操作",
                onClose: function() {
                    // console.log("close");
                },
                actions: [
                    {
                        text: "删除",
                        className: 'color-danger',
                        onClick: function() {
                            vm.deleteHomework();
                        }
                    }
                ]
            });
            $(".weui-actions_mask").click(function(){ $(".weui-actionsheet_cancel").click(); });
        },
        //当前动态code，动态index，点击评论的父评论code，评论的index，
        editRemark: function (parentCommentCode, commentUserType, commentUserName, studentName, relationName) {
            $.actions({
                actions: [
                    {
                        text: ' <div class="weui-flex pl10 pr10"><div class="weui-flex__item"><div class="placeholder"><div contenteditable="true" id="comment" class="textbox t-left pt5 pb5" style="border-bottom: 1px solid #28ce57;"></div> </div></div><div class="placeholder t-right"><a  class="weui-btn weui-btn_mini weui-btn_primary bor-no pt5 pb5" id="send">发送</a></div></div>',
                        className: "Bubble01 pb5",
                        autoClose: false
                    }
                ]
            });
            if(parentCommentCode!=0){
                var a=commentUserType==1?commentUserName:studentName;
                var b=commentUserType==1?"老师":relationName;
                $('#comment').attr('placeholder','回复  '+a+b);
            }
            $("#send").bind('click', function (event) {
                if(!$.trim($("#comment").text())){
                    $.toast("评论不能为空",'cancel');
                    return;
                }
                var obj = {
                    dynamicCode: vm.curDynamicCode,
                    courseCode: vm.courseCode,
                    content:util.utf16toEntities($("#comment").text()),
                    parentCommentCode:parentCommentCode
                };
                if(vm.userType==1){
                    var mock={
                        commentUserName:vm.userName,
                        commentUserType: 1,
                        content: util.utf16toEntities($("#comment").text()),
                        parentCommentCode: parentCommentCode,
                        replyName:commentUserType==1?commentUserName:studentName,//commentUserName
                        replyRelationName: relationName,//relationName
                        replyUserType:commentUserType//commentUserType
                    };
                }else{
                    var mock={
                        studentName: vm.userName,
                        commentUserType: 2,
                        content: util.utf16toEntities($("#comment").text()),
                        parentCommentCode: parentCommentCode,
                        relationName:'母亲',//mock
                        replyName:commentUserType==1?commentUserName:studentName,//commentUserType==1?commentUserName:studentName
                        replyRelationName: relationName,//relationName
                        replyUserType: commentUserType//commentUserType
                    }

                }
                $(".weui-actionsheet_cancel").click();
                courseCommentApi.addComment(obj).success(function (res) {
                    mock.code=res.bizData.value.code;
                    vm.commentTreeList.push(mock);
                })
            });
            // $(".weui-actions_mask").click(function(){ $(".weui-actionsheet_cancel").click(); });
        },
        //删除动态
        deleteDynamic:function () {
            dynamicApi.deleteDynamic(vm.curDynamicCode).success(function (res) {
                // window.location.href='/html/dynamic/index.html'
                // alert(res.bizData.msg)
            })
        },
        //删除作业
        deleteHomework:function () {
            courseHomeworkApi.deleteHomework(vm.curStuHomeworkCode).success(function (res) {
                // window.location.href='/html/dynamic/index.html'
                // alert(res.bizData.msg)
                location.reload()
            })
        },
        toggleTab:function (tab) {
            vm.showTab=tab;
            if(tab==2){
                $(document.body).destroyInfinite();
            }else{
                vm.loadMore();
            }
        },
        toUpload:function () {
                window.location.href='/html/dynamic/create.html?code='+vm.curDynamicCode;
        },
        utf161:function (str) {
            return util.entitiestoUtf16(str);
        },
        back:function () {
            if(util.getQueryString('homework')){
                window.location.href='/html/dynamic/homeworkDynamicList.html';
            }else if(util.getQueryString('parPersonal')){
                window.location.href='/html/personal/parent.html';
            }else {
                window.location.href='/html/dynamic/index.html';
            }
        }
    });

    //时间差过滤器
    avalon.filters.timeFilter = function (time) {
        var date1= time;  //开始时间
        var date2 = new Date().getTime();    //结束时间
        var date3 = date2 - date1;   //时间差的毫秒数
        //计算出相差天数
        var days=Math.floor(date3/(24*3600*1000));
        //计算出小时数
        var leave1=date3%(24*3600*1000) ;   //计算天数后剩余的毫秒数
        var hours=Math.floor(leave1/(3600*1000));//计算相差分钟数
        var leave2=leave1%(3600*1000) ;       //计算小时数后剩余的毫秒数
        var minutes=Math.floor(leave2/(60*1000));//计算相差秒数
        var leave3=leave2%(60*1000);    //计算分钟数后剩余的毫秒数
        var seconds=Math.round(leave3/1000);
        if(days>0){
            return days+"天前"
        }else if(hours>0){
            return hours+"小时前"
        }else if(minutes>0){
            return minutes+"分钟前"
        }else if(seconds>0){
            return seconds+"秒前"
        }
    };
    //动态类型过滤器
    avalon.filters.dynamicType = function (type) {
        if (type == 1) {
            return "作业"
        } else if (type == 2) {
            return"通知"
        }
    };
    //用户类型过滤器
    avalon.filters.userType = function (type) {
        if (type == 1) {
            return "教师"
        } else if (type == 2) {
            return"老师"
        }else if (type == 4) {
            return"学生"
        }
    };

    avalon.ready(function () {
        vm.init();
    })
});