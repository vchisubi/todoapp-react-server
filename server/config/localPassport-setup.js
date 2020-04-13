const localPassport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const LocalUser = require('../models/local-user-model')

localPassport.use(
  'local-login',
  new LocalStrategy({
  passReqToCallback : true
  },
  function(req, inputUsername, inputPassword, done) {
    console.log('[Enter local-login--] Begin')
    LocalUser.findOne({ username: inputUsername }, async function(err, user) {
      // If any error was encountered
      if (err) {
        console.log('Error with local login: ' + err)
        return done(err)
      }
      // If username does not exist
      if (!user || user === null) {
        console.log('Username does not exist!')
        return done(null, false)
      }
      // If username exists but password was incorrect
      if (!await bcrypt.compare(inputPassword, user.password)) {
        console.log('Password is incorrect!')
        return done(null, false)
      }
      // Username and password match, return user
      console.log('[End local-login--] Login success')
      return done(null, user)
    })
  }
))

localPassport.use('register', new LocalStrategy({
  passReqToCallback : true
  },
  function(req, inputUsername, inputPassword, done) {
    findOrCreateUser = function() {
      LocalUser.findOne({ username: inputUsername }, async function(err, user) {
        if (err) {
          console.log('Error with registration: ' + err)
          return done(err)
        }
        if (user) {
          console.log('User with this username already exists!')
          return done(null, false)
        } else {
          hashedPassword = await bcrypt.hash(inputPassword, 10)
          var newUser = new LocalUser({
            username: inputUsername,
            password: hashedPassword,
            userid: Date.now().toString()
          }).save().then((newUser) => {
            return done(null, newUser)
          })
        }
      })
    }
    process.nextTick(findOrCreateUser)
  }
))

