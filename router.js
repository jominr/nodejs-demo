const express = require('express');

const router = express.Router();

const userList = [{
  id: '1',
  attributes: {
    name: '悟空',
    age: 18,
    gender: '男',
    address: '花果山'
  }
},{
  id: '2',
  attributes: {
    name: '猪八戒',
    age: 18,
    gender: '男',
    address: '高老庄'
  }
},{
  id: '3',
  attributes: {
    name: '沙和尚',
    age: 18,
    gender: '男',
    address: '花果山'
  }
},{
  id: '4',
  attributes: {
    name: '唐僧',
    age: 18,
    gender: '男',
    address: '花果山'
  }
}];

router.get('/error', (req, res)=> {
  throw new Error('自定义的错误')
})

router.get('/user/list', (req, res)=> {
  const query = req.query
  res.send({
    status: 0,
    msg: 'get user list success',
    data: userList
  })
})

router.post('/user/list', (req, res)=> {
  // 请求体数据
  console.log(req.body);
  res.send({
    status: 0,
    msg: 'post user list success',
    data: req.body
  })
})

router.get('/user', (req, res)=> {
  // 传参 ?name=xx&age=18
  console.log(req.query);
  res.send({name: 'xxx', age: 20, gender: 'male'})
});

router.get('/user/:id/:name', (req, res)=> {
  // 传参 /user/:id
  console.log(req.params)
  res.send(req.params)
});

module.exports = router