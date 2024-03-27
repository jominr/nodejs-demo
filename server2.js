/* 
  需求：开发一个简单的静态文件合并服务器，该服务器需要支持类似以下格式的JS或CSS文件合并请求。
  1、http://127.0.0.1:8300/??test/a.js,test/b.js
  返回/test/a.js 和 test/b.js 按顺序合并后的内容。
  2、http://127.0.0.1:8300/test/a.js
  返回该文件的内容。

  测试：在浏览器内输入：
  http://127.0.0.1:8300/??test/a.js,test/b.js

  版本2

  特点：一边读取文件一边输出响应，把响应输出时机提前至读取第一个文件的时刻。
  在检查了请求的所有文件是否有效之后，立即就输出了响应头，并接着一边按顺序读取文件一边输出响应内容。
  在读取文件时直接使用了只读数据流来简化代码。
*/

var fs = require('fs'), 
  path = require('path'), 
  http = require('http');

var MIME = {
  '.css': 'text/css',
  '.js': 'application/javascript'
};

function main(argv) {
  // 从config.json文件读取配置参数 
  var config = JSON.parse(fs.readFileSync(argv[0], 'utf-8')),
      root = config.root || '.',
      port = config.port || 80;

  http.createServer(function(request, response) {
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
}

function outputFiles(pathnames, writer) {
  (function next(i, len) {
    if (i < len) {
      // 创建一个只读数据流
      var reader = fs.createReadStream(pathnames[i]);
      // 默认情况下，当源可读流触发'end'事件时，目标流也会调用stream.end()方法从而结束写入。
      // 要禁用这一默认行为， end选项应该指定为false，这将使目标流保持打开
      reader.pipe(writer, {end: false});
      // 当流中不再有数据可供使用时触发，
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
      // 返回Stats对象，提供有关文件的信息，包括uid, gid, size,mode等等信息
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