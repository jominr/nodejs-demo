/* 
  需求：开发一个简单的静态文件合并服务器，该服务器需要支持类似以下格式的JS或CSS文件合并请求。
  1、http://127.0.0.1:8300/??test/a.js,test/b.js
  返回/test/a.js 和 test/b.js 按顺序合并后的内容。
  2、http://127.0.0.1:8300/test/a.js
  返回该文件的内容。

  测试：在浏览器内输入：
  http://127.0.0.1:8300/??test/a.js,test/b.js

  版本1

  问题：
  1. 当请求的文件比较多比较大时，串行读取文件会比较耗时，从而拉长了服务端响应等待时间。
  2. 由于每次响应输出的数据都需要先完整地缓存在内存里，当服务器请求并发数较大时，会有较大的内存开销。
*/

var fs = require('fs'), 
  path = require('path'), 
  http = require('http');

/* Multipurpose Internet Mail Extensions
  多用途互联网邮件扩展类型，设定某种扩展名的文件用一种应用程序来打开
  .html => text/html
  .txt  => text/plain
  .java => text/plain
  在HTTP中，MIME类型被定义在Content-Type header中。
*/
var MIME = {
  '.css': 'text/css',
  '.js': 'application/javascript'
};
/*
** js函数自调用传参
  (function(param1, param2) {
    console.log("参数1:", param1);
    console.log("参数2:", param2);
  })("Hello", "World");

  注意：这两种都是立即执行函数的常见写法！
  (function(){...})()
  (function(){...}())
*/
function combineFiles(pathnames, callback) {
  var output = [];
  (function next(i, len) {
    if (i < len) {
      fs.readFile(pathnames[i], function(err, data) {
        if (err) {
          callback(err);
        } else {
          // 这是test/a.js,test/b.js 的data
          // <Buffer 63 6f 6e 73 6f 6c 65 2e 6c 6f 67 28 31 29 3b>
          // <Buffer 63 6f 6e 73 6f 6c 65 2e 6c 6f 67 28 32 29 3b>
          output.push(data);
          next(i + 1, len);
        }
      });
    } else {
      callback(null, Buffer.concat(output));
    }
  }(0, pathnames.length));
}

function main(argv) {

  // 从config.json文件读取配置参数 
  var config = JSON.parse(fs.readFileSync(argv[0], 'utf-8')),
      root = config.root || '.',
      port = config.port || 80;

  // 这里我们跳过配置，直接给定配置参数
  //  __dirname的值是 /Users/qiaomin/Downloads/job for melbourne/nodejs
  // var root = __dirname;
  // var port = 8300;
  http.createServer(function(request, response) {
    // request.url是端口之后的部分
    var urlInfo = parseURL(root, request.url);
    combineFiles(urlInfo.pathnames, function(err, data) {
      if (err) {
        response.writeHead(404);
        response.end(err.message);
      } else {
        response.writeHead(200, {
          'Content-Type': urlInfo.mime
        });
        response.end(data);
      }
    });
  }).listen(port, ()=>{
    console.log('server running at http://127.0.0.1:' + port)
  });
}

function parseURL(root, url) {
  var base, pathnames, parts;
  // /??test/a.js,test/b.js
  // /test/a.js
  if (url.indexOf('??') === -1) {
    // 注意，这里replace不是全局替换，是只替换1个
    // /??test/a.js

    url = url.replace('/', '/??');
  }
  // 字符串分割后的结果
  // [/, test/a.js,test/b.js]
  // [/, test/a.js ]
  parts = url.split('??');
  // /
  // /
  base = parts[0];
  // [test/a.js, test/b.js]
  // [test/a.js]
  pathnames = parts[1].split(',').map(function (value) {
    // ['/Users/qiaomin/Downloads/job for melbourne/nodejs/test/a.js', '/Users/qiaomin/Downloads/job for melbourne/nodejs/test/b.js']
    // ['/Users/qiaomin/Downloads/job for melbourne/nodejs/test/a.js']
    return path.join(root, base, value);
  });

  return {
    // path.extname()返回文件扩展名“.js”
    mime: MIME[path.extname(pathnames[0])] || 'text/plain',
    pathnames: pathnames
  };
}

// 这里从process.argv.slice(2)开始，指的就是我们node server1.js config.json的这个config.json啦。
main(process.argv.slice(2));

/*
关于argv
import { argv } from 'node:process';

argv.forEach((val, index) => {
  console.log(`${index}: ${val}`);
});

启动 Node.js 进程为：
$ node process-args.js one two=three four

将生成输出：

0: /usr/local/bin/node  (这是process.execPath, NodeJS执行程序的绝对路径)
1: /Users/mjr/work/node/process-args.js ()   (process-args.js这个模块的绝对路径)
2: one (依次列出其他参数)
3: two=three
4: four
*/