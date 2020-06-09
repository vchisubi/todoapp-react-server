const googlePassport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const keys = require('../config/keys')
const GoogleUser = require('../models/user-model')

googlePassport.use(
  new GoogleStrategy({
  clientID: keys.google.clientID,
  clientSecret: keys.google.clientSecret,
  callbackURL: '/auth/google/redirect'
  }, (accessToken, refreshToken, profile, done) => {
    GoogleUser.findOne({ googleId: profile.id }).then((currentUser) => {
      if(currentUser){
        done(null, currentUser)
      } else {
          new GoogleUser({
            username: profile.displayName,
            googleId: profile.id,
            thumbnail: profile._json.picture
          }).save().then((newUser) => {
            console.log('New user created: ' + newUser)
            done(null, newUser)
          })
      }
    })
  }
))