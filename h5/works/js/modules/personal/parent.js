/**
 * Created by Administrator on 2017/12/20 0020.
 */
define(function (require) {
    var $ = require('jquery');
    var common = require('common');
    var util = require('util');
    var avalon = require('avalon');
    var attachFastClick = require('fastclick');
    var echarts = require('echarts');
    var swiper=require('swiper')($);
    require('jquery_weui')($);
    var courseDynamicApi = require('api/courseDynamicApi.js');
    var courseStuStatApi = require('api/courseStuStatApi.js');
    var courseGoodApi = require('api/courseGoodApi.js');


    var vm = avalon.define({
        $id: 'parent',
        courseCode:'',
        studentId:'',
        summary:'在全部作业中，获得0次五星好评，0次四星，0次三星，0次二星和0次一星。',
        reviewStar1Times:'',
        reviewStar2Times:'',
        reviewStar3Times:'',
        reviewStar4Times:'',
        reviewStar5Times:'',
        reviewStarTimes:'',        //作业评星次数
        dynamicList:[],
        praiseCount:"",

        init: function () {
            vm.courseCode=util.getLocalValue("currCourse").code;
            vm.statDetail();
            vm.queryDynamicAboutMe();
        },

        //查询表扬列表
        queryDynamicAboutMe:function () {
            courseDynamicApi.queryPraiseDynamicList(vm.courseCode).then(function (res) {
                if(common.isSuccess(res)){
                    vm.dynamicList=res.bizData;
                    vm.praiseCount=vm.dynamicList.length;
                    if(vm.praiseCount==0){
                        $("#noPraiseData").show();
                    }else{
                        $("#praiseData").show();
                    }
                }else{
                    //显示信息
                    $.toast(res.msg, function () {
                        vm.praiseCount=0;
                        $("#noPraiseData").show();
                    });
                }
            })
        },
        //查询评星和总结
        statDetail:function () {
            courseStuStatApi.queryTermStatByStudent(vm.courseCode,vm.studentId).then(function (res) {
                if(common.isSuccess(res)) {
                    vm.summary = res.bizData.summary||vm.summary;
                    vm.reviewStar1Times = res.bizData.reviewStar1Times||0;
                    vm.reviewStar2Times = res.bizData.reviewStar2Times||0;
                    vm.reviewStar3Times = res.bizData.reviewStar3Times||0;
                    vm.reviewStar4Times = res.bizData.reviewStar4Times||0;
                    vm.reviewStar5Times = res.bizData.reviewStar5Times||0;
                    vm.reviewStarTimes =  res.bizData.reviewStarTimes||0;
                    //作业评星次数为0时冷启动
                    if(vm.reviewStarTimes==0){
                        $("#noStarData").show();
                    }else {
                        $("#starData").show();
                    }
                }else {
                    $.toast(res.msg, function () {
                        vm.reviewStarTimes=0;
                        $("#noStarData").show();
                    });
                }
            })
        },
        initEcharts:function () {
            var schoolChart = echarts.init(document.getElementById('cla-ranking'));
            var data = [{
                value: vm.reviewStar2Times,
                name: '5星'
            }, {
                value: vm.reviewStar2Times,
                name: '4星'
            }, {
                value: vm.reviewStar2Times,
                name: '3星'
            }, {
                value: vm.reviewStar2Times,
                name: '2星'
            }, {
                value: vm.reviewStar1Times,
                name: '1星'
            }];
            option = {
                backgroundColor: '#fff',
                title: {
                    text: '',
                    subtext: '',
                    x: 'center',
                    y: 'center',
                    textStyle: {
                        fontWeight: 'normal',
                        fontSize: 16
                    },
                    subtextStyle: {
                        fontWeight: 'normal',
                        fontSize: 20
                    }
                },
                tooltip: {
                    show: false,
                    trigger: 'item',
                    formatter: "{b}: {c} ({d}%)"
                },
                legend: {
                    orient: 'horizontal',
                    top: '5px',
                    data: ['5星', '4星', '3星', '2星', '1星']
                },
                series: [{
                    type: 'pie',
                    selectedMode: 'single',
                    radius: ['0', '76%'],
                    center: ['50%', '55%'],
                    color: [ '#59ADF3','#86D560', '#FFCC67',  '#FF999A','#AF89D6'],

                    label: {
                        normal: {
                            position: 'inner',
                            formatter: '{c} ',
                            textStyle: {
                                color: '#fff',
                                fontSize: 14
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: data
                }]
            };
            schoolChart.setOption(option);
        },
        //点好家长
        clickOk:function (code,index,isStick) {
            vm.curDynamicCode=code;
            vm.curDynamicIndex=index;
            vm.curDynamicStick=isStick;
            if(!vm.dynamicList[vm.curDynamicIndex].hasConfirm){
                courseGoodApi.addGood(vm.curDynamicCode).success(function (res) {
                    vm.dynamicList[vm.curDynamicIndex].goodNum+=1;
                    vm.dynamicList[vm.curDynamicIndex].hasConfirm=true;
                })
            }
        },

        utf161:function (str) {
            return util.entitiestoUtf16(str);
        },
        toDetail:function (code) {
            window.location.href='/html/dynamic/parDetail.html?parPersonal=true&code='+code;
        }
    });

    avalon.ready(function () {
        vm.init();
    })
});