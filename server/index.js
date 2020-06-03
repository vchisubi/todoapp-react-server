const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cookieSession = require('cookie-session')
const passport = require('passport')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const keys = require('./config/keys')
const GoogleStratSetup = require('./config/googlePassport-setup')
const LocalStratSetup = require('./config/localPassport-setup')

module.exports = function () {

  let server = express(),
    create,
    start;

  create = function() {
    server.use(cookieParser())
  
    server.use(cors())
    let routes = require('./routes')

    server.use(cookieSession({
      maxAge: 24 * 60 * 60 * 1000,
      keys: [keys.session.cookieKey]
    }))

    server.use(bodyParser.json())
    server.use(passport.initialize())
    server.use(passport.session())

    routes.init(server)
  }

  start = function() {
    const port = process.env.PORT || 4002

    mongoose.connect(keys.mongodb.dbURI, {useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false}, (err) => {
      if(err){
        console.log('Unable to connect to the database!')
        console.log(err)
        process.exit(1)
      }
      else{
        server.listen(port, () => {
          console.log(`Connection successful: Listening on port ${port}`)
        })
      }
    })
  }

  return {
    create: create,
    start: start
  }
}
