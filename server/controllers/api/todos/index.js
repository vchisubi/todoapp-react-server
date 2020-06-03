const express = require('express')
const todoService = require('../../../services/todos')

// TOKEN STUFF ------------------------------------------------------------------------------------------------------------------------------
const dotenv = require('dotenv')
dotenv.config()
const jwt = require('jsonwebtoken')

// Middleware function that grabs JWT cookie from browser and verifies it, then allows CRUD operation if valid
function authenticateToken(req, res, next) {
  let jwtCookie = req.cookies.jwt

  if (jwtCookie) {
    jwt.verify(jwtCookie, process.env.TOKEN_KEY_SECRET, (err, user) => {
      if (err) { return res.sendStatus(403) }
      req.user = user
      next()
    })
  } else { return res.sendStatus(401) }
}
// TOKEN STUFF ------------------------------------------------------------------------------------------------------------------------------

let router = express.Router()

router.get('/:ownerid', authenticateToken, (req,res) => {
  todoService.getList(req.params.ownerid).then(result => {
    res.json(result);
  })
})

// Create new task
router.post('', authenticateToken, (req,res) => {
  const userInput = req.body
  const task = userInput.title
  const ownerid = userInput.ownerid
  const taskObject = {'ownerid': ownerid, 'id': Date.now(), 'title': task, 'completed': false}
  todoService.createTask(taskObject).then(result => {
    res.send(result);
  })
})

// Update existing task
router.patch('/:id', authenticateToken, (req,res) => {
  let taskId = parseInt(req.params.id)
  let userInput = req.body
  const toggle = userInput.completed
  todoService.updateTask(taskId, toggle).then(result => {
    res.json(result)
  })
})

// Delete all existing tasks
router.delete('/clear/:ownerid', authenticateToken, (req,res) => {
  todoService.deleteAllTasks(req.params.ownerid).then(result => {
    res.json(result)
  })
})

// Delete existing task
router.delete('/:id', authenticateToken, (req,res) => {
  let taskId = parseInt(req.params.id)
  todoService.deleteTask(taskId).then(result => {
    res.json(result)
  })
})

module.exports = router