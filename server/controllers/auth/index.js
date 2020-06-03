const router = require('express').Router()
const passport = require('passport')
const GoogleStrategy = require('../../config/googlePassport-setup')
const LocalStrategy = require('../../config/localPassport-setup')
const googleUser = require('../../models/user-model')
const localUser = require('../../models/local-user-model')


// TOKEN STUFF ------------------------------------------------------------------------------------------------------------------------------
const dotenv = require('dotenv')
dotenv.config()
const jwt = require('jsonwebtoken')

async function generateAccessToken(user) {
  const accessToken = jwt.sign(user.toJSON(), process.env.TOKEN_KEY_SECRET, { expiresIn: '24h' })
  return accessToken
}
// TOKEN STUFF ------------------------------------------------------------------------------------------------------------------------------

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

// Returns logged in user object and true
router.get('/authCheck', (req,res) => {
  if (req.isAuthenticated()) {
    const authData = {user: req.user, loggedIn: req.isAuthenticated()}
    res.send(authData)
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
  res.clearCookie('jwt')
  res.send(true)
})

router.get('/google', passport.authenticate('google', {
  scope: ['profile']
}))

router.get('/google/redirect', passport.authenticate('google'), async (req, res) => {
  try {
    const jwtToken = await generateAccessToken(req.user)
    res.cookie('jwt', jwtToken, { httpOnly: true, secure: false, maxAge: 3600000 })
    res.redirect('http://localhost:3000/redirect')
  } catch (e) {
      console.log(e)
  }
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
    req.logIn(user, async function(err) {
      userType = 'local-login'
      if (err) {
        return res.send(err)
      }

      try {
        const jwtToken = await generateAccessToken(user)
        res.cookie('jwt', jwtToken, { httpOnly: true, secure: false, maxAge: 3600000 })
        data = {user, success: true }
        res.send(data)
      } catch (e) {
          console.log(e)
      }
    })
  }) (req, res, next)
})

module.exports = router