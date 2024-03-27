/* 
  需求：开发一个简单的静态文件合并服务器，该服务器需要支持类似以下格式的JS或CSS文件合并请求。
  1、http://127.0.0.1:8300/??test/a.js,test/b.js
  返回/test/a.js 和 test/b.js 按顺序合并后的内容。
  2、http://127.0.0.1:8300/test/a.js
  返回该文件的内容。

  测试：在浏览器内输入：
  http://127.0.0.1:8300/??test/a.js,test/b.js

  版本4 服务器程序部署目录设计
  bin: 服务控制脚本
  conf: 配置文件
  lib: 服务器代码
*/

var fs = require('fs'), 
  path = require('path'), 
  http = require('http');

var MIME = {
  '.css': 'text/css',
  '.js': 'application/javascript'
};

function main(argv) {
  var config = JSON.parse(fs.readFileSync(argv[0], 'utf-8')),
      root = config.root || '.',
      port = config.port || 80,
      server;

  server = http.createServer(function(request, response) {
    console.log('request', request.url)
    var urlInfo = parseURL(root, request.url);

    validateFiles(urlInfo.pathnames, function(err, pathnames) {
      if (err) {
        response.writeHead(404);
        response.end(err.message);
      } else {
        response.writeHead(200, {
          'Content-Type': urlInfo.mime
        });
        outputFiles(pathnames, response);
      }
    });
  }).listen(port, ()=>{
    console.log('server running at http://127.0.0.1:' + port)
  });

  // 子进程监听process对象的SIGTERM事件响应信号
  process.on('SIGTERM', function() {
    // 正常退出，code码是0
    server.close(function() {
      process.exit(0);
    });
  });
}

function outputFiles(pathnames, writer) {
  (function next(i, len) {
    if (i < len) {
      var reader = fs.createReadStream(pathnames[i]);
      reader.pipe(writer, {end: false});
      reader.on('end', function() {
        next(i + 1, len);
      })
    } else {
      writer.end();
    }
  }(0, pathnames.length));
}

function validateFiles(pathnames, callback) {
  (function next(i, len) {
    if (i < len) {
      fs.stat(pathnames[i], function(err, stats) {
        if (err) {
          callback(err);
        } else if (!stats.isFile()) {
          callback(new Error());
        } else {
          next(i + 1, len);
        }
      });
    } else {
      callback(null, pathnames);
    }
  }(0, pathnames.length))
}

function parseURL(root, url) {
  var base, pathnames, parts;
  if (url.indexOf('??') === -1) {
    url = url.replace('/', '/??');
  }
  parts = url.split('??');
  base = parts[0];
  pathnames = parts[1].split(',').map(function (value) {
    return path.join(root, base, value);
  });

  return {
    mime: MIME[path.extname(pathnames[0])] || 'text/plain',
    pathnames: pathnames
  };
}

main(process.argv.slice(2));