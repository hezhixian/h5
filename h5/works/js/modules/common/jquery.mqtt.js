/**
 * jquery.mqtt.js v0.1
 * 基于mqttws31.js二次封装的jquery插件，实现mqtt消息收发功能
 * mqttws31.js：https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.2/mqttws31.js
 * Copyright (c) 2016 tengen http://my.oschina.net/tengen
 * Created by tengen on 2016/12/27.
 */
;(function($, window, document,undefined) {

    var pluginName = "mqtt";

    // 构造函数
    function Plugin ( element, options ) {
        this.element = element;
        // 将默认属性对象和传递的参数对象合并到第一个空对象中
        this.settings = $.extend( {}, $.fn.mqtt.defaults, options );
        this._defaults = $.fn.mqtt.defaults;
        this._name = pluginName;
        this._mqtt = null;
        this._reconnectTimeout = 2000;
        this.init();
    }

    // 为了避免和原型对象Plugin.prototype的冲突，这地方采用继承原型对象的方法
    $.extend(Plugin.prototype, {
        init: function () {
            // 初始化，由于继承自Plugin原型，
            // 你可以在这里直接使用this.element或者this.settings
            this._mqttConnect(this);
        },
        sendMessage:function(topic,content){
            var message = new Paho.MQTT.Message(content);//set body
            message.destinationName =topic;// set topic
            this._mqtt.send(message);
        },
        _mqttConnect : function(instance) {
            this._mqtt = new Paho.MQTT.Client(
                this.settings.host,//MQTT域名
                Number(this.settings.port),//WebSocket端口
                this.settings.clientId //客户端ClientId
            );
            this._mqtt.onConnectionLost = function(response) {
                if (response.errorCode !== 0) {
                    console.log("onConnectionLost:"+response.errorMessage);
                    setTimeout(instance._mqttConnect(instance), instance._reconnectTimeout);
                }
            };
            this._mqtt.onMessageArrived = this.settings.onMessageArrived;
            this._mqtt.connect({onSuccess:function() {
                console.log('MQTT Connection succeeded; subscribe to topic ['+instance.settings.topic+']!');
                instance._mqtt.subscribe(instance.settings.topic, {qos: instance.settings.qos});

            }});
        }
    });

    // 对构造函数的一个轻量级封装，
    // 防止产生多个实例
    $.fn[ pluginName ] = function ( options ) {
        // 把第一个参数（插件方法）以后的参数放到数组里，以便后面调用插件方法可传递这些参数.
        var args = Array.prototype.slice.call(arguments, 1);

        var results; //用于保存调用插件方法的返回值

        this.each(function() {
            var element = this, $item = $(element), pluginKey = 'plugin_' + pluginName, instance = $.data(element, pluginKey);
            if (!instance) {
                instance = $.data(element, pluginKey, new Plugin( this, options ));
            }

            // 如果插件已实例化，且当第一个参数(options)为有效的字符串（方法名称）时，则尝试调用该插件实例的同名方法。
            if (instance && typeof options === 'string' && options[0] !== '_' && options !== 'init') {

                var methodName = (options == 'destroy' ? '_destroy' : options);
                if (typeof instance[methodName] === 'function')
                    results = instance[methodName].apply(instance, args);

                // 允许通过destroy方法销毁实例
                if (options === 'destroy')
                    $.data(element, pluginKey, null);
            }

        });

        // 如果调用的是插件方法且有返回值，就返回这个值；否则返回当前对象实例以便可以实现链式调用
        return results !== undefined ? results : this;
    };

    $.fn[ pluginName ].defaults = {
        host: 'localhost', //mqtt broker 地址
        port: '8080', //mqtt broker websocket 端口
        topic: '', //消息主题，为了满足在不同的环境可以共用相同的mqtt代理，建议消息主题包含环境标识，一般取当前域名作为环境标识。
        qos:0, //服务质量 0-至多一次，1-至少一次，2-只有一次
        clientId: '', //mqtt客户端唯一标识。
        onMessageArrived:null //接收消息回调函数
    };

})(jQuery, window, document);
