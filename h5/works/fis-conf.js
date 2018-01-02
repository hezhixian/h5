var now = new Date();
fis.config.set('timestamp', [now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours(),now.getMinutes()].join(''));

fis.config.set('roadmap.path', [
    {
        //所有libs目录下的.js文件不压缩
        reg : /^\/js\/(.*\.js)/i,
        useOptimizer: false,
        query: '?version=${timestamp}',
        useHash: false
    },
    {
        reg: /.*\.(js|css|png|jpeg|gif|jpg|bmp|eot|svg|ttf|woff)$/,
        query: '?version=${timestamp}',
        useHash: false
    },
    {
        reg: '**.html',
        useCache: false
    }
]);