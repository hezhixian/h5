/**
 * Created by Administrator on 2017/9/8.
 */
define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var util = require('util');
    var avalon = require('avalon');

    require('jquery_weui')($);
    var wx = require('jweixin');
    var Stream = require('lib/stream/1.9.0/js/stream-v1');
    var layer = require('layer_mobile');
    var stopwatch = require("lib/stopwatch");
    require('lib/pinyin/dict/pinyin_dict_firstletter');
    var pinyinUtil = require('lib/pinyin/pinyinUtil');
    var attachFastClick = require('fastclick');
    attachFastClick.attach(document.body);

    var wxApi = require('api/wxApi');
    var courseStudentApi = require('api/courseStudentApi');
    var courseDynamicApi = require('api/courseDynamicApi');
    var courseHomeworkApi = require('api/courseHomeworkApi');
    var courseInfoApi = require('api/courseInfoApi');

    Array.prototype.remove = function (val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };

    var notNeed = attachFastClick.notNeeded(document.body);
    $.fn.triggerFastClick = function () {
        this.trigger("click");
        if (!notNeed) {
            this.trigger("click");
        }
    }

    var imgLocalIdServerIdMap = {};
    var vm = avalon.define({
        $id: 'create',
        isIOS: false,
        courseCode: "",
        dynamicCode: "",
        userType: 0,
        checkResult: true,

        dynamicType: 0, // 0-互动 1-作业 2-通知
        attachType: -1,// -1 不显示附件框 1-图片框  2-音频框  3-视频框
        content: "",// 动态内容
        stuList: [],                       //学生列表
        selStuList: [],                     //已经选择的学生列表
        selStuTmpList: [],                     //已经选择的学生列表

        imgLocalIds: [],// 本地图片ids
        imgLocalIdsIOS: [],// 本地图片ids 苹果用
        imgServerIds: [],// 微信服务器ids
        imgIsProcessing: false, // 图片加载flag
        imgUnloadData: [],
        imgAddFlg: false,
        imgLocalIdDataMap: [],

        voiceStartFlg: false,//音频录制flag
        voiceLocalId: "",
        voiceServerId: "",
        voiceIsPlayIng: false,
        voiceLength: 0,// 录音长度
        voiceLengthStr: 0,// 录音长度时分秒显示
        voiceStatus: 0, // 1 开始录音 2 停止录音 3 播放录音 4 录音播放中
        sw: {},

        videoFile: {},
        videoFileIsUploding: false,

        dataIsUploading: false,

        init: function () {

            vm.isIOS = window.__wxjs_is_wkwebview ? true : false;
            if (!vm.initParam()) {
                vm.checkResult = false;
                layer.open({content: "请在公众号中打开！", btn: "确定"});
                vm.cancleCreate();
            }
            vm.checkParam()
            vm.initWxConfig();
            vm.initEvent();
            if (vm.userType == 1) {
                vm.queryStu();
            }
        },
        // 公共方法开始

        // 公共方法结束
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
                    // 家长身份
                    vm.dynamicCode = util.getQueryString("code");
                    if (!vm.dynamicCode || vm.dynamicCode == '') {
                        return false;
                    }
                }
                vm.userType = account.userType;
                return true;
            } else {
                return false;
            }
        },
        checkParam: function () {
            if (vm.userType == 1) {
                courseInfoApi.hasCourse(vm.courseCode).success(function (res) {
                    if (!res.bizData) {
                        layer.open({
                            content: '您不是该课的授课老师，不能发动态！', btn: ['确定'],
                            yes: function (index) {
                                vm.checkResult = false;
                                vm.cancleCreate();
                            }
                        });
                    }
                }).fail(function (res) {

                });
            }
            if (vm.userType == 4) {
                courseStudentApi.hasCourse(vm.courseCode).success(function (res) {
                    if (!res.bizData) {
                        layer.open({
                            content: '您的孩子没有参加该门课程！', btn: ['确定'],
                            yes: function (index) {
                                vm.checkResult = false;
                                vm.cancleCreate();
                            }
                        });
                    }
                }).fail(function (res) {
                    return false;
                });
            }
        },
        initWxConfig: function () {
            wxApi.getWxConfig(window.location.href).success(function (res) {
                var appId = res.bizData.appId;
                var nonceStr = res.bizData.nonceStr;
                var signature = res.bizData.signature;
                var timestamp = res.bizData.timestamp;
                wx.config({
                    beta: true,// 必须这么写，否则在微信插件有些jsapi会有问题
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: appId, // 必填，企业微信的cropID
                    timestamp: timestamp, // 必填，生成签名的时间戳
                    nonceStr: nonceStr, // 必填，生成签名的随机串
                    signature: signature,// 必填，签名，见[附录1](#11974)
                    jsApiList: ["startRecord",
                        "stopRecord",
                        "onVoiceRecordEnd",
                        "playVoice",
                        "pauseVoice",
                        "stopVoice",
                        "getLocation",
                        "onVoicePlayEnd",
                        "uploadVoice",
                        "downloadVoice",
                        "chooseImage",
                        "uploadImage",
                        "getLocalImgData"] // 必填，需要使用的JS接口列表
                });
            });
        },
        initEvent: function () {
            vm.initWxConfigEvent();
            vm.initVoiceShowEvent();
            vm.initVoiceFinishEvent();
            vm.initVoiceWxEvent();
            // 语音录入框内event
            vm.initVoiceBoxEvent();
        },
        initWxConfigEvent: function () {
            wx.error(function (res) {
                // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                layer.open({content: "微信验证失败，本页面将有部分功能异常！", btn: "确定"});
            });
        },
        initVoiceBoxEvent: function () {
            // 取消按钮
            $(document).on("click", ".weui-actionsheet_cancel", function () {
                var isFinish = false;
                vm.stopRecord(isFinish);
            });

            $(document).on("click", ".resetVoice", function () {
                vm.voiceStatus = 0;
                vm.sw = {};
                vm.voiceLocalId = "";
                vm.stopRecord(false);
                // 恢复成未开始录制样式
                vm.notStartVoiceCss();
            });
            // 未开始录音，点击开始录音
            $(document).on("click", ".voiceNotStart", function () {
                vm.chooseVoice();
            });

            // 录音中，点击按钮停止录音
            $(document).on("click", ".voiceStart", function () {
                var isFinish = true;
                vm.stopRecord(isFinish);
            });

            //状态：停止录音，点击按钮播放
            $(document).on("click", ".voiceFinish", function () {
                vm.playVoice();
                vm.playVoiceCss()
            });

            // 播放中按钮按下
            $(document).on("click", ".voicePlaying", function () {
                vm.stopPlayVoice();
                vm.stopPlayVoiceCss();
            });
        },
        // 点击显示录音操作框
        initVoiceShowEvent: function () {
            $(document).on("click", "#show-voice", function () {
                $.actions({
                    title: $("#templetVoiceTitle").html(),
                    onClose: function () {

                    },
                    actions: [{
                        text: $("#templetVoiceText").html(),
                        className: "",
                        autoClose: false
                    }]
                });
            });
        },
        initVoiceFinishEvent: function () {
            $(document).on("click", "#finishRecord", function () {
                vm.finishRecord();
            });
        },
        initVoiceWxEvent: function () {
            // 监听录音自动停止接口
            wx.onVoiceRecordEnd({
                // 录音时间超过一分钟没有停止的时候会执行 complete 回调
                complete: function (res) {
                    layer.alert("已经录音一分钟，录音自动停止！", function () {
                        vm.voiceLocalId = res.localId;
                        vm.stopPlayVoiceCss();
                    });
                }
            });
            // 监听语音播放完毕接口
            wx.onVoicePlayEnd({
                success: function (res) {
                    var localId = res.localId; // 返回音频的本地ID
                    vm.voiceIsPlayIng = false;
                    vm.stopPlayVoiceCss();
                }
            });
        },
        // 初始化部分结束

        // 图片部分处理开始
        // 选择图片 add点击追加图片
        chooseImage: function (isAdd) {
            if (vm.videoFileIsUploding) {
                layer.open({content: "您有视频未上传完成", btn: "确定"});
                return;
            }
            // 新增,不是追加
            if (!isAdd) {
                vm.imgLocalIds = [];
                vm.imgLocalIdsIOS = [];
            }
            wx.chooseImage({
                count: 9 - vm.imgLocalIds.length, // 默认9
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                success: function (res) {
                    var localIds = res.localIds.slice(0);// 数组深拷贝
                    var localDataIds = res.localIds.slice(0);// 数组深拷贝
                    vm.attachType = 1;
                    if (isAdd) {
                        res.localIds.forEach(function (value) {
                            vm.imgLocalIds.push(value);
                        });
                    } else {
                        vm.imgLocalIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                    }
                    //判断ios是不是用的 wkwebview 内核
                    if (vm.isIOS) {
                        vm.getLocalImgDatas(localDataIds);
                    }
                    vm.uploadImages(localIds);
                }
            });
        },
        uploadImages: function (localIds) {
            var localId = localIds.shift();
            wx.uploadImage({
                localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
                isShowProgressTips: 1, // 默认为1，显示进度提示
                success: function (res) {
                    imgLocalIdServerIdMap[localId] = res.serverId;
                    if (localIds.length > 0) {
                        vm.uploadImages(localIds); // 迭代
                    }
                }
            });
        },

        // 递归调用至图片全部加载
        getLocalImgDatas: function (imgLocalIds) {
            var localId = imgLocalIds.shift();
            wx.getLocalImgData({
                localId: localId, // 图片的localID
                success: function (res) {
                    var localData = res.localData; // localData是图片的base64数据，可以用img标签显示
                    localData = localData.replace('jgp', 'jpeg');//iOS 系统里面得到的数据，类型为 image/jgp,因此需要替换一下
                    vm.imgLocalIdsIOS.push({"key": localId, "data": localData}); // localData是图片的base64数据，可以用img标签显示

                    if (imgLocalIds.length > 0) {
                        vm.getLocalImgDatas(imgLocalIds);
                    }
                }
            });
        },

        // 删除图片
        delLocalImg: function (localId) {
            vm.imgLocalIds.remove(localId);

            if (vm.isIOS) {
                // 删除imgLocalIdsIOS数据
                var temp = vm.imgLocalIdsIOS;

                temp.forEach(function (value, index) {
                    if (value.key == localId) {
                        vm.imgLocalIdsIOS.splice(index, 1);
                    }
                });
            }
        },
        //图片部分处理结束

        // 音频部分处理开始
        chooseVoice: function () {
            if (vm.videoFileIsUploding) {
                layer.open({content: "您有视频未上传完成", btn: "确定"});
                return;
            }
            vm.attachType = -1;
            wx.startRecord({
                cancel: function () {
                    layer.alert('用户拒绝授权录音');
                },
                success: function (res) {
                    vm.voiceStartFlg = true;
                    // 计时器开始
                    vm.sw = new stopwatch({
                        el: '.weui-actionsheet__title .stopwatch', // element,  default value is '.stopwatch'.
                        startTime: 0, // start time by Second, default value is 0.
                        displayTpl: '{minute} : {second} : {millisecond}' // display template
                    });

                    vm.sw.start();
                    // 修改成录音中样式
                    vm.startVoiceCss();
                }
            });
        },
        stopRecord: function (isFinish) {
            if (vm.voiceStartFlg) {
                wx.stopRecord({
                    success: function (res) {
                        vm.voiceStartFlg = false;
                        if (isFinish) {
                            vm.voiceLocalId = res.localId;
                            vm.voiceLength = vm.sw.getTime();
                            vm.voiceLengthStr = vm.sw.getTimeStr();
                            vm.sw.pause();
                            vm.stopPlayVoiceCss();
                        }
                    },
                    fail: function (res) {
                        //alert(JSON.stringify(res));
                    }
                });
            }
        },
        // 完成录音
        finishRecord: function () {
            if (vm.voiceLocalId == "") {
                layer.open({content: "您还没录制音频", btn: "确定"});
                return;
            }

            $.closeActions();
            // 页面音频显示
            vm.attachType = 2;
        },
        switchPlayVoice: function () {
            vm.voiceIsPlayIng = !vm.voiceIsPlayIng;
            if (vm.voiceIsPlayIng) {
                vm.playVoice();
            } else {
                vm.pauseVoice();
            }
        },
        // 语音试听样式修改
        notStartVoiceCss: function () {
            $(".weui-actionsheet__cell .voiceNotStart").show();
            $(".weui-actionsheet__cell .voiceStart").hide();
            $(".weui-actionsheet__cell .voiceFinish").hide();
            $(".weui-actionsheet__cell .voiceFinish + a").hide();
            $(".weui-actionsheet__cell .voicePlaying").hide();
            $(".weui-actionsheet__cell .voicePlaying + a").hide();
            $(".weui-actionsheet__title .stopwatch").html("点击开始录音");
        },
        startVoiceCss: function () {
            $(".weui-actionsheet__cell .voiceNotStart").hide();
            $(".weui-actionsheet__cell .voiceStart").show();
            $(".weui-actionsheet__cell .voiceFinish").hide();
            $(".weui-actionsheet__cell .voiceFinish + a").hide();
            $(".weui-actionsheet__cell .voicePlaying").hide();
            $(".weui-actionsheet__cell .voicePlaying + a").hide();
            $(".weui-actionsheet__title .stopwatch").html("点击开始录音");
        },
        // 播放中
        playVoiceCss: function () {
            $(".weui-actionsheet__cell .voiceNotStart").hide();
            $(".weui-actionsheet__cell .voiceStart").hide();
            $(".weui-actionsheet__cell .voiceFinish").hide();
            $(".weui-actionsheet__cell .voiceFinish + a").hide();
            $(".weui-actionsheet__cell .voicePlaying").show();
            $(".weui-actionsheet__cell .voicePlaying + a").show();
            $(".weui-actionsheet__title .stopwatch").html("播放中...");
        },
        // 停止播放
        stopPlayVoiceCss: function () {
            $(".weui-actionsheet__cell .voiceNotStart").hide();
            $(".weui-actionsheet__cell .voiceStart").hide();
            $(".weui-actionsheet__cell .voiceFinish").show();
            $(".weui-actionsheet__cell .voiceFinish + a").show();
            $(".weui-actionsheet__cell .voicePlaying").hide();
            $(".weui-actionsheet__cell .voicePlaying + a").hide();
            $(".weui-actionsheet__title .stopwatch").html(vm.voiceLengthStr);
        },
        // 播放语音接口
        playVoice: function () {
            wx.playVoice({
                localId: vm.voiceLocalId // 需要播放的音频的本地ID，由stopRecord接口获得
            });
        },
        // 暂停播放接口
        pauseVoice: function () {
            wx.pauseVoice({
                localId: vm.voiceLocalId // 需要播放的音频的本地ID，由stopRecord接口获得
            });
        },
        // 停止播放接口
        stopPlayVoice: function () {
            wx.stopVoice({
                localId: vm.voiceLocalId // 需要播放的音频的本地ID，由stopRecord接口获得
            });
        },
        // 音频部分处理结束

        // 视频部分处理开始
        chooseVideo: function () {
            if (vm.videoFileIsUploding) {
                layer.open({content: "您有视频未上传完成", btn: "确定"});
                return;
            }
            $('#i_select_files').triggerFastClick();
        },
        clickMedia: function (id, e) {
            e.stopPropagation();
            var media = document.getElementById(id);
            var target = $("#" + id).siblings();
            var isPaused = media.paused;
            if (media.requestFullscreen) {
                media.requestFullscreen();
            } else if (media.webkitRequestFullscreen) {
                media.webkitRequestFullscreen();
            } else if (media.mozRequestFullScreen) {
                media.mozRequestFullScreen();
            } else if (media.msRequestFullscreen) {
                media.msRequestFullscreen();
            }
            if (isPaused) {
                media.play();

                target.children(".icon-kaishi1").hide();
                target.children(".weui-loading").show();
            } else {
                media.pause();
                target.children(".icon-kaishi1").show();
                target.children(".weui-loading").hide();
            }
            media.addEventListener("pause", function () {
                    target.children(".icon-kaishi1").show();
                    target.children(".weui-loading").hide();
                }
            );
        },
        // 视频部分处理结束

        // 切换动态类型
        switchDynamicType: function (val) {
            vm.dynamicType = val;
        },
        queryStu: function () {
            var courseCode = vm.courseCode;
            courseStudentApi.queryList(courseCode).success(function (res) {
                // 排序
                var stuList = {};
                for (var i = 0; i < 26; i++) {
                    var character = String.fromCharCode(i + 65);
                    stuList[character] = [];
                }
                stuList['#'] = [];
                res.bizData.forEach(function (el) {
                    el.checked = false;
                    var szm = (pinyinUtil.getFirstLetter(el.studentName.substring(0, 1)) + "").toUpperCase();
                    szm = (szm == "" || szm == null) ? '#' : szm;
                    stuList[szm].push(el);
                });
                // 改成右侧选择字母的可以直接赋值
                var sortStu = [];
                for (var i = 0; i < 26; i++) {
                    var character = String.fromCharCode(i + 65);
                    stuList[character].forEach(function (value) {
                        sortStu.push(value);
                    });
                }
                vm.stuList = sortStu;
            });
        },
        selStu: function () {
            avalon.each(vm.stuList, function (key, value) {
                avalon.each(value, function (index, stu) {
                    stu.checked = false;
                    avalon.each(vm.selStuList, function (index, sel) {
                        if (sel.studentId == stu.studentId) {
                            stu.checked = true;
                            return false;
                        }
                    });
                })
            });
            $("#selStuDiv").show();
            $("#content").hide();
        },
        //过滤长度
        filterSize: function (el) {
            return el.length > 0;
        },
        checkedStuLength: function (stu) {
            if (stu.checked) {
                if (vm.selStuTmpList.length < 10) {
                    vm.selStuTmpList.ensure(stu);
                } else {
                    stu.checked = false;
                    layer.open({content: "最多选择10个学生！"});
                }
            } else {
                vm.selStuTmpList.remove(stu);
            }
        },
        //确认选择的学生
        submitStu: function () {
            vm.selStuList = [];
            vm.selStuList = vm.selStuTmpList;
            $("#content").show();
            $('#selStuDiv').hide()
        },
        cancelSelStu: function () {
            vm.selStuList = [];
            vm.selStuTmpList = [];
            $("#content").show();
            $('#selStuDiv').hide()
        },
        cancleCreate: function () {
            // 取消
            if (vm.userType == 1) {
                var historyUrl = util.getQueryString("historyUrl");
                if(historyUrl){
                    window.location.href = historyUrl;
                }else{
                    window.location.href = "./index.html";
                }
            }
            if (vm.userType == 4) {
                window.location.href = "./parDetail.html?code=" + vm.dynamicCode;
            }
        },
        // 创建动态
        commitData: function () {
            if (!vm.checkResult || vm.dataIsUploading) {
                return;
            }
            vm.content = $.trim(vm.content);
            if (vm.attachType == 1) {
                if (vm.imgLocalIds.length > 0) {
                    vm.imgServerIds = [];
                    vm.voiceLocalId = "";
                    vm.voiceServerId = "";
                    vm.videoFile = {};
                    vm.imgLocalIds.forEach(function (value, index) {
                        vm.imgServerIds.push(imgLocalIdServerIdMap[value]);
                    });

                    vm.commitByUserType();
                } else {
                    if (vm.content == "") {
                        layer.open({content: "请填写有效内容"});
                        return;
                    }
                    vm.commitByUserType();
                }
            }
            if (vm.attachType == 2) {
                vm.imgLocalIds = [];
                vm.imgServerIds = [];
                vm.videoFile = {};

                if (vm.voiceLocalId != "") {
                    wx.uploadVoice({
                        localId: vm.voiceLocalId, // 需要上传的音频的本地ID，由stopRecord接口获得
                        isShowProgressTips: 1, // 默认为1，显示进度提示
                        success: function (res) {
                            vm.voiceServerId = res.serverId; // 返回音频的服务器端ID
                            vm.commitByUserType();
                        }
                    });
                } else {
                    if (vm.content == "") {
                        layer.open({content: "请填写有效内容"});
                        return;
                    }
                    vm.commitByUserType();
                }
            }
            if (vm.attachType == 3) {
                vm.imgLocalIds = [];
                vm.imgServerIds = [];
                vm.voiceLocalId = "";
                vm.voiceServerId = "";
                if (vm.videoFile.attachCode == "" && vm.content == "") {
                    layer.open({content: "请填写有效内容"});
                    return;
                }
                vm.commitByUserType();
            }
            // 没有附件
            if (vm.attachType == -1) {
                if (vm.content == "") {
                    layer.open({content: "请填写有效内容"});
                    return;
                }
                vm.commitByUserType();
            }
        },
        commitByUserType: function () {
            if (vm.userType == 1) {
                vm.createDynamic();
            }
            if (vm.userType == 4) {
                vm.uploadHomework();
            }
        },
        createDynamic: function () {
            layer.open({
                content: '确定发送？', btn: ['确定', '取消'],
                yes: function (index) {
                    util.openLoading();
                    var studentIds = [];
                    var studentNames = [];
                    avalon.each(vm.selStuList.$model, function (index, stu) {
                        studentIds.push(stu.studentId);
                        studentNames.push(stu.studentName);
                    });
                    var contentConvert = util.utf16toEntities(vm.content);
                    var postData = {
                        courseCode: vm.courseCode,
                        dynamicType: vm.dynamicType,
                        content: contentConvert,
                        studentIds: studentIds,
                        studentNames: studentNames,
                        attachType: vm.attachType,
                        imgServerIds: vm.imgServerIds,
                        voiceServerId: vm.voiceServerId,
                        attachCode: vm.videoFile.attachCode
                    };
                    vm.dataIsUploading = true;
                    courseDynamicApi.createDynamic(postData).success(function (res) {
                        util.closeLoading();
                        vm.dataIsUploading = false;
                        $.toast(res.bizData.msg, function () {
                            vm.cancleCreate();
                        });
                    });
                }
            });
        },
        // 提交作业
        uploadHomework: function () {
            layer.open({
                content: '确定提交？', btn: ['确定', '取消'],
                yes: function (index) {
                    util.openLoading();
                    var contentConvert = util.utf16toEntities(vm.content);
                    var postData = {
                        courseCode: vm.courseCode,
                        dynamicType: vm.dynamicType,
                        content: contentConvert,
                        attachType: vm.attachType,
                        imgServerIds: vm.imgServerIds,
                        voiceServerId: vm.voiceServerId,
                        attachCode: vm.videoFile.attachCode,
                        dynamicCode: vm.dynamicCode
                    };
                    vm.dataIsUploading = true;
                    courseHomeworkApi.uploadHomework(postData).success(function (res) {
                        util.closeLoading();
                        vm.dataIsUploading = false;
                        $.toast(res.bizData.msg, function () {
                            vm.cancleCreate();
                        });
                    });
                }
            });
        }
    });

    avalon.ready(function () {
        vm.init();
        var interval;
        var picConfig = {
            customered: true,
            maxSize: 20 * 1024 * 1024, /** 单个文件的最大大小20M，默认:2G */
            browseFileId: "i_select_files", /** 选择文件的ID, 默认: i_select_files */
            dragAndDropArea: "i_select_files",
            postVarsPerFile: {attachBizType: 10},//业务类型 10-课程动态 11-课程作业
            multipleFiles: false, /** 多个文件一起上传, 默认: false */
            useCamera: false,// 拍照
            takeVideo: true,// 拍视频
            extFilters: [".mov", ".mp4", ".avi"], /** 允许的文件扩展名, 默认: [] */
            swfURL: "/js/libs/stream/1.3.2/swf/FlashUploader.swf", /** SWF文件的位置 */
            tokenURL: "/file/upload/getToken", /** 根据文件名、大小等信息获取Token的URI（用于生成断点续传、跨域的令牌） */
            frmUploadURL: "/file/upload/formUpload", /** Flash上传的URI */
            uploadURL: "/file/upload/streamUploadVideo", /** HTML5上传的URI */
            /** 选择文件后的响应事件 */
            onSelect: function (list) {
                avalon.each(list, function (index, file) {
                    var ext = -1 !== file.name.indexOf(".") ? file.name.replace(/.*[.]/, "").toLowerCase() : "";

                    //上传后组装对象
                    var fileObj = {
                        fileId: file.id,
                        fileKSYUrl: '',
                        thumbKSYUrl: "",
                        name: file.name,
                        fileSize: file.size,
                        fileExt: ext,
                        fileStatus: 0,
                        attachCode: ""
                    };
                    vm.videoFile = fileObj;
                });
            },
            onAddTask: function (file, dat) {
                vm.attachType = 3;
                vm.videoFileIsUploding = true;
                $('#videoUploadProgress').css("width", '0%');
                $('#videoUploadProgressTxt').html('0%');
                $("#videoUploadProgressDiv").show();
            },
            /** 单个文件上传完毕的响应事件 */
            onComplete: function (file) {
                vm.videoFileIsUploding = false;
                window.clearInterval(interval);
                $("#videoUploadProgressDiv").hide();
                $('#videoUploadProgressTxt').html('0%');
                $('#videoUploadProgress').css('0%');

                var msgObj = eval("(" + file.msg + ")");

                vm.videoFile.fileKSYUrl = msgObj.videoKSYUrl;
                vm.videoFile.thumbKSYUrl = msgObj.thumbKSYUrl;
                vm.videoFile.attachCode = msgObj.attachCode;
                vm.videoFile.fileStatus = 1;
            },
            /**有重复文件选择的响应事件（注意：不同文件夹下的相同文件不认为是同一文件）**/
            onRepeatedFile: function (file) {
                //可以选择重新上传
                return true;
            },
            onUploadProgress: function (file) {
                $('#videoUploadProgressTxt').html(Math.floor(file.percent * 0.9) + '%');
                $('#videoUploadProgress').css("width", Math.floor(file.percent * 0.9) + '%');
                if (99.99 == file.percent) {
                    var i = 0.01;
                    interval = setInterval(function () {
                        i = i + 0.01;
                        if (i < 0.1) {
                            $('#videoUploadProgressTxt').html(Math.floor(file.percent * (0.9 + i)) + '%');
                            $('#videoUploadProgress').css("width", Math.floor(file.percent * (0.9 + i)) + '%');
                        } else {
                            window.clearInterval(interval);
                        }
                    }, 1000);
                }

            },
            /** 文件的扩展名不匹配的响应事件 */
            onExtNameMismatch: function (file) {
                vm.videoFile = {};
                layer.open({content: "抱歉，仅支持mov，mp4文件格式上传！"});
            },
            /** 文件大小超出的响应事件 */
            onMaxSizeExceed: function (file) {
                vm.videoFile = {};
                layer.open({content: "上传失败，单个文件大小为20M！"});
            }
        };
        new Stream(picConfig);
    });
});