/**
 * Created by Administrator on 2017/9/8.
 */
define(function (require) {
    var $ = require('jquery');
    var mqtt=require('mqtt')($);
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
    var wx = require('jweixin');


    var vm = avalon.define({
        $id: 'dynamic',
        courseCode:0,
        courseName:'',
        courseNum:0,
        courseTea:'',
        courseImg:'',
        userId:0,
        userType:0,
        userName:'',
        courseInfoList:[],
        isDynamic:false,//是否有动态
        dynamicRecord:0,//动态总数
        dynamicList:[],//动态列表
        curDynamicCode:'',
        curDynamicIndex:0,
        curDynamicStick:false,
        text:true,
        isNew:false,
        loading:false,
        pageNo:1,
        totalPage:1,
        newDynamic:0,
        $lastAudioPlayId:'',//上一次音频播放对象的id
        init: function () {
            vm.getBasicCode();
            vm.loadMore();
            vm.getNewTime();
            // common.wxInit();
            // wx.onMenuShareTimeline({
            //         title: '分享测试', // 分享标题
            //         link: '', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            //         imgUrl: '/image/teacher.jpg', // 分享图标
            //         success: function () {
            //           console.log("ok")
            //         }
            // });
        },
        //获取课程code和用户id
        getBasicCode:function () {
            // vm.courseCode = 'da7d712195a3444c8a4cd4a048014998';
            vm.courseCode=util.getLocalValue('currCourse','code');
            vm.userType = util.getLocalValue('account', 'userType');
            // vm.userId ='ae453cd461dd11e58635fa163e0e90d3';
            vm.userId = util.getLocalValue('account', 'uid');//家长id或学生id
            vm.userName = util.getLocalValue('account', 'name');
            vm.courseName =util.getLocalValue('currCourse','name');
            vm.courseNum = util.getLocalValue('currCourse','studentNum');
            vm.courseTea =util.getLocalValue('currCourse','teacherNames');
            vm.courseImg =util.getLocalValue('currCourse','faceUrl');
            vm.getDynamic();
        },
        //获取课程基础信息
        getBasicInfo:function () {
            courseInfoApi.courseInfo(vm.courseCode).success(function (res) {
                vm.courseInfoList=res.bizData.value;
                $(".partOne").show();
            })
        },
        //获取作业列表时间戳
        getNewTime:function () {
            if (vm.userType == 1) {   //教师
                courseHomeworkApi.latestUploadHomeworkTime(vm.courseCode).success(function (res) {
                    var preTime=util.getLocalValue('newTime')||0;
                    var curTime=res.bizData;
                    if(curTime>preTime){
                        vm.isNew=true;
                    }
                })
            } else if(vm.userType==4){ //家长
                dynamicApi.latestHomeworkDynamicTime(vm.courseCode).success(function (res) {
                    var preTime=util.getLocalValue('newTime')||0;
                    var curTime=res.bizData;
                    if(curTime>preTime){
                        vm.isNew=true;
                    }
                })
            }
        },
        //跳转到作业列表
        goHomeworkList:function () {
            util.setLocalValue('newTime',new Date().getTime());
            window.location.href='/html/dynamic/homeworkDynamicList.html'
        },
        //获取动态列表
        getDynamic: function () {
            //courseCode,pageNo,pageSize
            if (vm.pageNo <= vm.totalPage) {
                $("#moreTips").show();
                dynamicApi.queryPage(vm.courseCode, vm.pageNo, '5').success(function (res) {
                    vm.totalPage=res.bizData.total;
                    vm.dynamicRecord = res.bizData.records;
                    vm.dynamicList = vm.dynamicList.concat(res.bizData.rows);
                    if (res.bizData.rows.length <= 4) {
                        $("#doneTips").show();
                    }
                    vm.loading = false;
                    $("#moreTips").hide();
                    $(".partTwo").show();
                })
            }else{
                $("#doneTips").show();
                $("#moreTips").hide();
            }
        },
        //滚动加载
        loadMore: function () {
            $(document.body).infinite().on("infinite", function () {
                if (vm.loading) return;
                vm.loading = true;
                vm.pageNo = vm.pageNo + 1;
                vm.getDynamic();
            });
        },
        //点击多媒体执行的操作
        clickMp3:function (id,e) {
            e.stopPropagation();
            //播放前先停止上次播放的音频
            if(vm.$lastAudioPlayId==''){
                vm.$lastAudioPlayId = id;
            }else if(vm.$lastAudioPlayId!=id){
                var lastAudioPlayObj = document.getElementById(vm.$lastAudioPlayId);
                lastAudioPlayObj.pause();
                lastAudioPlayObj.currentTime = 0.0;
                $(lastAudioPlayObj).next().find(".voice-gif").hide().end().find(".voice-png").show();
                vm.$lastAudioPlayId = id;
            }

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
            e.stopPropagation();
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
        clickPic:function (e,imgIndex,dynIndex) {
            e.stopPropagation();
            var imgArray=[];
            vm.dynamicList[dynIndex].attachMapList.forEach(function (el) {
                imgArray.push(el.fileUrl);
            });
            var pb1 = $.photoBrowser({
                items:imgArray,
                initIndex:imgIndex
            });
            pb1.open();
        },
        //
        picSize:function () {
            alert("fsfds")
            var scaleW=window.innerWidth/320;
            var scaleH=window.innerHeight/504;
            var resizes = document.querySelectorAll('.resize');
            for (var j=0; j<resizes.length; j++) {
                resizes[j].style.width=parseInt(resizes[j].style.width)*scaleW+'px';
                resizes[j].style.height=parseInt(resizes[j].style.height)*scaleH+'px';
                resizes[j].style.top=parseInt(resizes[j].style.top)*scaleH+'px';
                resizes[j].style.left=parseInt(resizes[j].style.left)*scaleW+'px';
            }
        },
        //评论的展开收起
        toggleRemark:function (id) {
            $("." + id + " .p-more").find(".icon-gengduo1").toggleClass("icon-shang");
            $("." + id + " .p-more").toggleClass("zk");
            if( $("." + id + " .p-more").siblings().css("height")=='90px'){
                $("." + id + " .p-more").siblings().css("height","auto");
            }else{
                $("." + id + " .p-more").siblings().css("height","90px");
            }
        },
        //点击工具栏
        clickTool:function (code,index,isStick) {
            vm.curDynamicCode=code;
            vm.curDynamicIndex=index;
            vm.curDynamicStick=isStick;
            $.actions({
                title: "选择操作",
                onClose: function() {
                    // console.log("close");
                },
                actions: [
                    {
                        text: vm.curDynamicStick?"取消置顶": "置顶",
                        className: "color-warning",
                        onClick: function() {
                            vm.curDynamicStick ? vm.stickCancel():vm.stick();
                        }
                    },
                    {
                        text: "删除",
                        className: 'color-danger',
                        onClick: function() {
                            vm.deleteDynamic();
                        }
                    }
                ]
            });
            $(".weui-actions_mask").click(function(){ $(".weui-actionsheet_cancel").click(); });
        },
        //编辑评论
        //当前动态code，动态index，点击评论的父评论code，评论的index，
        editRemark: function (code, index, parentCommentCode, commentUserType, commentUserName, studentName, relationName) {
            vm.curDynamicCode = code;
            vm.curDynamicIndex = index;
            $.actions({
                actions: [
                    {
                        text: '<div class="weui-flex pl10 pr10"><div class="weui-flex__item"><div class="placeholder"><div contenteditable="true" id="comment" tabindex=0 class="textbox t-left pt5 pb5" style="border-bottom: 1px solid #28ce57;"></div> </div></div><div class="placeholder t-right"><a  class="weui-btn weui-btn_mini weui-btn_primary bor-no pt5 pb5" id="send">发送</a></div></div>',
                        className: "Bubble01 pb5",
                        autoClose: false
                    }
                ]
            });
            // $('#comment').focus();
            // $('#text').focus();
            if(parentCommentCode!=0){
                var a=commentUserType==1?commentUserName:studentName;
                var b=commentUserType==1?"老师":relationName;
                $('#comment').attr('placeholder', '回复  ' + a + b);
            }
            $(".weui-btn_mini").bind('click', function (event) {
                event.stopPropagation();
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
                if (vm.userType == 1) {
                    var mock = {
                        commentUserName: vm.userName,
                        commentUserType: 1,
                        content: util.utf16toEntities($("#comment").text()),
                        parentCommentCode: parentCommentCode,
                        replyName: commentUserType == 1 ? commentUserName : studentName,//commentUserName
                        replyRelationName: relationName,//relationName
                        replyUserType: commentUserType//commentUserType
                    };
                } else {
                    var mock = {
                        studentName: vm.userName,
                        commentUserType: 2,
                        content:util.utf16toEntities($("#comment").text()),
                        parentCommentCode: parentCommentCode,
                        relationName: util.getLocalValue('guardianship', "relationName"),//mock
                        replyName: commentUserType == 1 ? commentUserName : studentName,//commentUserType==1?commentUserName:studentName
                        replyRelationName: relationName,//relationName
                        replyUserType: commentUserType//commentUserType
                    }

                }
                $(".weui-actionsheet_cancel").click();
                courseCommentApi.addComment(obj).success(function (res) {
                    mock.code=res.bizData.value.code;
                    vm.dynamicList[index].commentTreeList.push(mock);

                })
            });
            // $(".weui-actions_mask").click(function(){ $(".weui-actionsheet_cancel").click(); });

        },
        //置顶
        stick:function () {
            dynamicApi.changeStickDynamic(vm.curDynamicCode,true).success(function (res) {
                var str = vm.dynamicList.splice(vm.curDynamicIndex,1);
                vm.dynamicList.unshift(str[0]);
                vm.dynamicList[0].stick=true;
            })
        },
        //取消置顶
        stickCancel:function () {
            dynamicApi.changeStickDynamic(vm.curDynamicCode,false).success(function (res) {
                location.reload()
            })
        },
        //点好家长
        clickOk:function (code,index,isStick) {
            vm.curDynamicCode=code;
            vm.curDynamicIndex=index;
            vm.curDynamicStick=isStick;
            if(!vm.dynamicList[vm.curDynamicIndex].hasConfirm&&vm.userType==4){
                courseGoodApi.addGood(vm.curDynamicCode).success(function (res) {
                    vm.dynamicList[vm.curDynamicIndex].goodNum+=1;
                    vm.dynamicList[vm.curDynamicIndex].hasConfirm=true;
                })   
            }
        },
        //删除动态
        deleteDynamic: function () {
            dynamicApi.deleteDynamic(vm.curDynamicCode).success(function (res) {
                vm.dynamicList.splice(vm.curDynamicIndex, 1);
                vm.dynamicRecord = vm.dynamicRecord - 1;
            })
        },

        toDetail:function (code,dynamicType) {
            //教师身份
            if(vm.userType==1){
                //作业动态，更新localHomeworkTimeList缓存
                if(dynamicType==1) {
                    var localHomeworkTimeList = util.getLocalValue("localHomeworkTimeList") || [];
                    var isExist = false;
                    $.each(localHomeworkTimeList, function (index, el) {
                        if (el.code == code) {
                            isExist = true;
                            el.localTime = new Date().getTime();
                            return;
                        }
                    });
                    if (!isExist) {
                        var localHomeworkTime = {
                            code: code,
                            localTime: new Date().getTime()
                        };
                        localHomeworkTimeList.push(localHomeworkTime);
                    }
                    util.setLocalValue("localHomeworkTimeList", localHomeworkTimeList);
                }
                window.location.href='/html/dynamic/teaDetail.html?code='+code;
            }else{//家长身份
                window.location.href='/html/dynamic/parDetail.html?code='+code;
            }
        },
        //跳转到我的
        toPersonal:function () {
            if(vm.userType==1){
                window.location.href='/html/personal/teacher.html';
            }else {
                window.location.href='/html/personal/parent.html';
            }
        },
        onMessageArrived: function (message) {
            var topic = message.destinationName;
            var payload = message.payloadString;
            var dynamicObj = JSON.parse(payload);
            if(vm.courseCode==dynamicObj.courseCode){
                vm.newDynamic=vm.newDynamic+1;
            }
            console.log("收到mqtt消息 : "+topic+"   "+payload+"-----"+dynamicObj.courseCode);
        },
        utf161:function (str) {
          return util.entitiestoUtf16(str);
        }
    });


    //动态类型过滤器
    avalon.filters.dynamicType = function (type) {
        if (type == 1) {
            return "作业"
        } else if (type == 2) {
            return"通知"
        }
    };

    avalon.ready(function () {
        vm.init();
    });

    return vm;
});