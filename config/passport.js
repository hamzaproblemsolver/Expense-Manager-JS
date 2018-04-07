const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const facebookStrategy = require('passport-facebook').Strategy;
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config = require('./config');
const User = require('../models/users');

passport.serializeUser(function (user, done) {
    return done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id,function(err, user){
        done(err, user);
    });
});

passport.use('local-login',new localStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
}, function (req, email, password, done) {
    User.findOne({email : email}, function (err, user) {
        if(err) return done(err, user);

        if(!user || !user.otp.validate){
            console.log('Login : No User');
            return done(null, false, req.flash('loginMessage','No user has been found'));
        }

        if(!user.comparePassword(password)){
            console.log('Login : Wrong Password');
            return done(null, false, req.flash('loginMessage','Oops! Wrong Password'));
        }
        console.log('Access Granted');
        user = user.setMonth();
        return done(null, user);
    });
}));

passport.use(new facebookStrategy(config.facebook, function (token, refreshToken, profile, done) {
    User.findOne({facebook : profile.id}, function (err, user) {
        if(err)
            return done(err);
        if(user) {
            user = user.setMonth();
            console.log(user.currentMonth);
            return done(null, user);
        }
        else{
            User.findOne({email : profile._json.email}, function (err, existingUser) {
                if (err) done(err);
                if (existingUser) {
                    existingUser = existingUser.setMonth();
                    return done(null, existingUser);
                } else {
                    let newUser = new User();
                    newUser.email = profile._json.email;
                    newUser.facebook = profile.id;
                    newUser.tokens.push({kind : 'facebook',token : token});
                    newUser.profile.name = profile.displayName;
                    newUser.profile.picture = 'https://graph.facebook.com/'+profile.id+'/picture?type=large';

                    newUser.save(function (err) {
                        if(err) return done(err);
                        return done(null, newUser);
                    });
                }
            });
        }
    })
}));

passport.use(new googleStrategy(config.google, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            User.findOne({google : profile.id}, function (err, user) {
                if(err)
                    return done(err);
                if(user) {
                    user = user.setMonth();
                    return done(null, user);
                }
                else{
                    User.findOne({email : profile.emails[0].value}, function (err, existingUser) {
                        if (err) done(err);
                        if (existingUser) {
                            existingUser = existingUser.setMonth();
                            return done(null, existingUser);
                        } else {
                            let newUser = new User();
                            newUser.email = profile.emails[0].value;
                            newUser.google = profile.id;
                            newUser.tokens.push({kind : 'google',token : accessToken});
                            newUser.profile.name = profile.displayName;
                            newUser.profile.picture = profile.photos[0].value;

                            newUser.save(function (err) {
                                if(err) return done(err);
                                return done(null, newUser);
                            });
                        }
                    });
                }
            })
        });
    }
));


module.exports = passport;