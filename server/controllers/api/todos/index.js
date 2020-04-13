const express = require('express')
const todoService = require('../../../services/todos')

let router = express.Router()

router.get('/:ownerid', (req,res) => {
  todoService.getList(req.params.ownerid).then(result => {
    res.json(result);
  })
})

router.post('', (req,res) => {
  const userInput = req.body
  const task = userInput.title
  const ownerid = userInput.ownerid
  const taskObject = {'ownerid': ownerid, 'id': Date.now(), 'title': task, 'completed': false}
  todoService.createTask(taskObject).then(result => {
    res.send(result);
  })
})

router.patch('/:id', (req,res) => {
  let taskId = parseInt(req.params.id)
  let userInput = req.body
  const toggle = userInput.completed
  todoService.updateTask(taskId, toggle).then(result => {
    res.json(result)
  })
})

router.delete('/clear/:ownerid', (req,res) => {
  todoService.deleteAllTasks(req.params.ownerid).then(result => {
    res.json(result)
  })
})

router.delete('/:id', (req,res) => {
  let taskId = parseInt(req.params.id)
  todoService.deleteTask(taskId).then(result => {
    res.json(result)
  })
})

module.exports = router