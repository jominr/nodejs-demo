
var cp = require('child_process');

var worker;

function spawn(server, config) {
  worker = cp.spawn('node', [server, config]);
  worker.on('exit', function(code) {
    if (code !== 0) {
      spawn(server, config);
    }
  });
}

function main(argv) {
  // 坑：我们使用脚本来起服务，这里的路径就要修改了，使用了以下两种路径
  // spawn('../lib/server.js', argv[0]);
  spawn(__dirname + '/server.js', argv[0]);
  process.on('SIGTERM', function() {    
    worker.kill();
    process.exit(0);
  });
}

main(process.argv.slice(2));
