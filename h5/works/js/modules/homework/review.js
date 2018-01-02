/**
 * 教师作业点评操作
 * @Author: suhongwei
 * @Date: 2017/12/4 14:16
 */
define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var util = require('util');
    var avalon = require('avalon');
    var attachFastClick = require('fastclick');
    var swiper=require('swiper')($);
    var layer = require('layer_mobile');

    var courseHomeWorkApi = require('api/courseHomeworkApi.js');

    require('jquery_weui')($);


    var vm = avalon.define({
        $id: 'review',
        currentPicIndex:0,
        homeWorkCode:'',//作业代码
        reviewStar:1,//点评星级
        reviewContent:'',//点评内容
        homeWorkInfo:{},//作业信息
        isAddOrEdit:0,//是否增加或者编辑标识 0-增加 1-编辑
        nextHomeWorkReviewCode:'',//下一位需要点评的作业Code
        init: function () {
            //获取作业代码
            var code = util.getQueryString("code");
            var type = util.getQueryString("type");
            if($.trim(code)){
                vm.homeWorkCode = code;
            }else{
                layer.open({content: '参数出错，请返回上一页重新进入', btn: "确定"});
                return;
            }
            if($.trim(type)){
                if(type=='add'){
                    vm.isAddOrEdit = 0;
                }else{
                    vm.isAddOrEdit = 1;
                }
            }else{
                layer.open({content: '参数出错，请返回上一页重新进入', btn: "确定"});
                return;
            }
            this.initStarClickEvent();
            this.queryHomeWorkByCode();
        },
        //提交点评
        submitReview:function () {
            if(vm.reviewStar==0){
                layer.open({content: '请至少进行星级评价', btn: "确定"});
                return
            }
            var params = {
                reviewContent:util.utf16toEntities(vm.reviewContent),
                reviewStar:vm.reviewStar,
                code:vm.homeWorkCode
            };
            util.openLoading();
            courseHomeWorkApi.commentHomeWork(params).then(function (res) {
                util.closeLoading();
                layer.open({
                    content: res.bizData.msg,
                    btn: "确定",
                    yes:function () {
                        //返回页面详情页
                        window.location.href='/html/dynamic/teaDetail.html?code='+util.getQueryString("dynCode");
                    }
                });
            });
        },
        //获取点评作业信息
        queryHomeWorkByCode:function () {
            util.openLoading();
            courseHomeWorkApi.queryHomeWorkByCode(vm.homeWorkCode).then(function (res) {
                var data = res.bizData.value;
                if(res.bizData.success){
                    vm.homeWorkInfo = data;
                    vm.reviewStar = vm.homeWorkInfo.reviewStar;
                    vm.reviewContent = vm.homeWorkInfo.reviewContent==undefined?'':vm.utf161(vm.homeWorkInfo.reviewContent);
                    vm.nextHomeWorkReviewCode = vm.homeWorkInfo.nextHomeWorkReviewCode;
                }else{
                    layer.open({
                        content: res.bizData.msg,
                        btn: "确定",
                        yes:function () {
                            //返回页面详情页
                            window.location.href='/html/dynamic/teaDetail.html?code='+util.getQueryString("dynCode");
                        }
                    });
                }
                util.closeLoading();
            });
        },
        //继续下一位
        goToNextReviewCodePage:function () {
            window.location.href = "/html/homework/review.html?code="+vm.nextHomeWorkReviewCode+"&type=add&dynCode="+util.getQueryString("dynCode");
        },
        //初始化点评星级的点击事件
        initStarClickEvent:function () {
            $(".weui-rater a").click(function(){
                var thisL = $(this).index();
                for(var i = 0;i < thisL;i++){
                    $(".weui-rater a").eq(i).addClass('checked');
                }
                for(var i = thisL; i < 5;i++){
                    $(".weui-rater a").eq(i).removeClass('checked');
                }
                $(this).addClass('checked');
                vm.reviewStar = thisL+1;
            })
        },
        //点击多媒体执行的操作
        clickMedia:function (id,e) {
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
        //点击图片执行的操作
        clickPic:function (e,index) {
            var atts = vm.homeWorkInfo.basicAttachList;
            var photoItems = [];
            for(var i=0;i<atts.length;i++){
                photoItems.push(atts[i].fileUrl)
            }
            e.stopPropagation();
            var pb1 = $.photoBrowser({
                items: photoItems,
                initIndex:index
            });
            pb1.open();
        },
        //评论的展开收起
        toggleRemark:function (id) {
            var father=$("#"+id);
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
                    console.log("close");
                },
                actions: [
                    {
                        text: "置顶",
                        className: "color-warning",
                    },
                    {
                        text: "删除",
                        className: 'color-danger',
                        onClick: function() {
                            $.alert("你选择了“删除”");
                        }
                    }
                ]
            });
        },
        //编辑评论
        editRemark:function () {
            $.actions({
                actions: [
                    {
                        text: ' <div class="weui-flex pl10 pr10"><div class="weui-flex__item"><div class="placeholder"><div contenteditable="true" class="textbox t-left pt5 pb5" style="border-bottom: 1px solid #28ce57;"></div> </div></div><div class="placeholder t-right"><a  class="weui-btn weui-btn_mini weui-btn_primary bor-no pt5 pb5" id="send">发送</a></div></div>',
                        className: "Bubble01 pb5",
                        autoClose:false
                    }
                ],
            });
            $("#send").bind('click', function(event) {
                $(".weui-actions_mask").click();
            });

        },
        back:function () {
            window.location.href='/html/dynamic/teaDetail.html?code='+util.getQueryString("dynCode");
        },
        utf161:function (str) {
            return util.entitiestoUtf16(str);
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

    avalon.ready(function () {
        vm.init();
    })
});
