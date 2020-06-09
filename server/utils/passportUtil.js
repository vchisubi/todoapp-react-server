const passport = require('passport')
const googleUser = require('../models/user-model')
const localUser = require('../models/local-user-model')

let userType = ''

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  if(userType === 'local-login') {
    localUser.findById(id).then(user => {
      done(null, user)
    })
  } else {
    googleUser.findById(id).then(user => {
      done(null, user)
    })
  }
})