/* 
  版本3 守护进程, => 启动server3.js

  特点：利用NodeJS的进程管理机制，将守护进程作为父进程，将服务器程序作为子进程，并让父进程监控子进程的运行状态，在其异常退出时重启子进程。
*/

// 创建和控制子进程的模块child_process
var cp = require('child_process');

var worker;

function spawn(server, config) {
  // 创建子进程，第一个参数是要运行的命令，第二个参数是参数列表
  worker = cp.spawn('node', [server, config]);
  // 当监听到子进程退出时，判断code码
  worker.on('exit', function(code) {
    if (code !== 0) {
      // 重新启动
      spawn(server, config);
    }
  });
}

function main(argv) {
  spawn('server3.js', argv[0]);
  // 监听事件：SIGTERM表示内核要求当前进程停止，
  process.on('SIGTERM', function() {
    /* 进程退出SIGINT、SIGTERM、SIGKILL区别
      SIGINT：程序终止信号，用户ctrl+c, 或者kill -2 <pid>触发
      SIGKILL：立即结束程序的运行，kill -9 <pid>触发
      SIGTERM: 程序结束信号，kill -15 <pid>触发
      命令行查看node的进程有哪些：ps -ef | grep -i node 
      501 11300  6075   0 10:16下午 ttys003    0:00.09 node daemon.js config.json
      501 11332 11300   0 10:16下午 ttys003    0:00.11 node server3.js config.json
      找到这两个，通过kill -15 11300命令 触发结束进程
    */
    // 父进程通过.kill()方法向子进程发送SIGTERM信号，不带参数就是SIGTERM信号
    worker.kill();
    // 正常退出，code码是0
    // 1:发生未捕获错误，5:V8执行错误，8：不正确的参数，128+信号值
    process.exit(0);
  });
}

main(process.argv.slice(2));
