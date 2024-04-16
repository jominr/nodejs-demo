const express = require('express');
// const parser = require('body-parser')

const app = express();

// 内置中间件：解析json格式的请求体数据
app.use(express.json());

// 内置中间件: 解析urlencoded请求体数据
app.use(express.urlencoded( {extended: false} ));

// 第三方中间件：
// app.use(parser.urlencoded( {extended: false} ))

// 解决跨域
const cors = require('cors');
app.use(cors());

const router = require('./router');
// 统一添加了访问前缀api
app.use('/api', router);

// 错误中间件必须放在路由后
app.use((err, req, res, next)=> {
  console.log('发生了错误' + err.message);
  res.send('Error: ' + err.message);
})

app.listen(80, ()=>{
  console.log('express server running at http://127.0.0.1')
})
