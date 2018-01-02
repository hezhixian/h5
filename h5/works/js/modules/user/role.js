define(function (require) {
    var $ = require('jquery');
    var avalon = require('avalon');
    var layer = require('layer_mobile');
    var util = require('util');
    var common = require('common');
    var roleApi = require('api/userApi');

    //MVVM
    avalon.ready(function () {
        var vm = avalon.define({
            $id: "role",
            roleData: [],
            isChange: 0,     //是否为身份切换
            accessToken:'',
            //选择角色
            selectRole: function (role) {
                //切换身份的时候需要清理本地存储项，防止混用前一个身份的信息，不能清除的项目放在excludeItems变量里面
                var excludeItems="isApp,username,rememberMe,password,newTime,localHomeworkTimeList";
                util.clearAllItems(excludeItems);

                var redirectUrl = util.getQueryString("redirectUrl") || "";
                if(redirectUrl!=""){
                    redirectUrl = encodeURIComponent(redirectUrl);
                }
                var url = "/sys/user/ssoLogin?userType=" + role.userType + "&uid=" + role.uid + "&schoolCode=" + role.schoolCode
                    + "&agencyCode=" + (role.agencyCode || "") + "&redirectUrl=" +redirectUrl;
                window.location.href = url;
            },
            init: function () {
                var params ={schoolCode: util.getQueryString("schoolCode")||''};
                roleApi.getRoles(params).success(function (result) {
                    result = result.bizData||result;
                    if (result) {
                        //单身份
                        if (result.length == 1 && vm.isChange == 0) {
                            var role = result[0];
                            vm.selectRole(role)
                        } else {
                            result.forEach(function (el) {
                                el.pic = el.pic ||(el.userType==1?"/images/teacher_tx.jpg":"/image/student1.png");
                            });
                            vm.roleData = result;
                        }
                    } else {
                        //信息框
                        layer.open({
                            content: '获取用户身份异常，5秒后自动跳转',
                            time: 5,
                            end: function () {
                                history.go(-1);
                            }
                        });
                    }
                });
            }
        });
        avalon.scan($('#role')[0], vm);
        vm.init();
    })
});