const router = require('express').Router()
const passport = require('passport')
const GoogleStrategy = require('../../config/googlePassport-setup')
const LocalStrategy = require('../../config/localPassport-setup')
const googleUser = require('../../models/user-model')
const localUser = require('../../models/local-user-model')

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

// Returns true if user is logged in
router.get('/authCheck', (req,res) => {
  if (req.isAuthenticated()) {
    res.send(true)
  } else {
    res.send(false)
  }
})
// Returns logged in user object
router.get('/authCheckUser', (req,res) => {
  if (req.isAuthenticated()) {
    res.send(req.user)
  } else {
    res.send('No user logged in.')
  }
})

router.get('/login', (req, res) => {
  res.redirect('http://localhost:3000/login')
})

router.get('/logout', (req, res) => {
  console.log('Logging out.')
  userType = ''
  req.logOut()
  res.send(true)
})

router.get('/google', passport.authenticate('google', {
  scope: ['profile']
}))

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  res.redirect('http://localhost:3000/list')
})

router.post('/register', function(req, res, next) {
  passport.authenticate('register', function(err, user, info) {
    if (err) { 
      console.log(err)
      return res.send(err)
    }
    else {
      return res.send(true)
    }
  }) (req, res, next)
})

router.post('/login', function(req, res, next) {
  passport.authenticate('local-login', async function(err, user, info) {
    if (err) { 
      console.log(err)
      return res.send(err)
    }
    if (!user) {
      return res.send(false)
    } 
    req.logIn(user, function(err) {
      userType = 'local-login'
      if (err) {
        return res.send(err)
      }
      return res.send(true)
    })
  }) (req, res, next)
})

module.exports = router