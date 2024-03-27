// 一个简单的http服务器的例子，根据url读取对应文件返回

// 引入http模块
const http = require('http')
// 引入fs模块
const fs = require('fs')
// 引入path模块
const path = require('path')


// 创建web服务器
const server = http.createServer()

// 监听web服务器的request事件
server.on('request', (req, res)=>{
    // 获取客户端的url地址
    // /clock/index.html
    // /clock/index.css
    const url = req.url
    // __dirname代表当前文件所处的目录
    // 使用path.join根据传入的url拼接本地文件的存放路径
    // const fpath = path.join(__dirname, url)
    // 拼接fpath优化
    let fpath = ''
    if (url === '/') {
      // 拼接./clock目录下的index
      fpath = path.join(__dirname, './clock/index.html')
    } else {
      // 拼接./clock目录下的url文件
      fpath = path.join(__dirname, './clock', url)
    }
    // 根据映射过来的文件路径读取文件的内容
    fs.readFile(fpath, 'utf-8', (err, data) => {
      if (err) res.end('404 Not found')
      res.end(data)
    })
})
// 启动服务器
server.listen(80, ()=> {
  console.log('server running at http://127.0.0.1')
})