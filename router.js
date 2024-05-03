const express = require('express');

const router = express.Router();

const stuList = [{
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

const getStuById = (id) => {
  return stuList.find(item => item.id == id);
}

const addStudent = (stuData) => {
  const id = stuList.length + 1;
  const data = {id, attributes: {...stuData}};
  stuList.push(data);
  return data;
}

const updata = (id, stuData) => {
  const data = stuList.find(item => item.id === id);
  data.attributes = {...stuData};
  return data;
}

const delStu = (id) => {
  const data = stuList.find(item => item.id === id);
  const index = stuList.findIndex(item => item.id === id);
  stuList.splice(index, 1);
  return data
}

const user = {
  username: 'min qiao',
  psd: '123',
  email: 'mm@qq.com'
}


router.get('/error', (req, res)=> {
  throw new Error('自定义的错误')
})

router.post('/auth/register', (req, res)=> {
  res.send({
    status: 0,
    msg: 'register success',
    data: req.body
  })
})

router.post('/auth/login', (req, res)=> {
  res.send({
    status: 0,
    msg: 'register success',
    data: user,
  })
})


router.get('/students', (req, res)=> {
  res.send({
    status: 0,
    msg: 'get student list success',
    data: stuList
  })
})

router.get('/students/:id', (req, res)=> {
  const data = getStuById(req.params.id);
  res.send({
    status: 0,
    msg: 'get student by id success',
    data: data
  })
})

router.post('/students/', (req, res)=> {
  // 请求体数据
  const data = addStudent(req.body);
  res.send({
    status: 0,
    msg: 'add student success',
    data: data
  })
})

router.put('/students/:id', (req, res)=> {
  res.send({
    status: 0,
    msg: 'update student success',
    data: updata(req.params.id, req.body)
  })
})

router.delete('/students/:id', (req, res)=> {
  res.send({
    status: 0,
    msg: 'delete student success',
    data: delStu(req.params.id)
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