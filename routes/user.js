const router = require('express').Router();
const passport = require('../config/passport');
const speakeasy = require("speakeasy");
const config = require('../config/config');
const User = require('../models/users');

function checkLoggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

router.get('/login',function (req, res) {
    if(req.user) return res.redirect('/');
    res.render('accounts/login',{message : req.flash('loginMessage')});
});

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/signup', function (req, res, next) {
    if(req.user) return res.redirect('/');
    res.render('accounts/signup',{
        errors : req.flash('errors')
    });
});

router.get('/profile',checkLoggedIn,function (req,res) {
    User.findOne({ _id: req.user._id }, function(err, user) {
        if (err) return next(err);
        res.render('accounts/profile', { user: user });
    });
});

router.post('/signup', function (req, res, next) {
    let user = new User();


    user.profile.name = req.body.name;
    user.password = req.body.password;
    user.email = req.body.email;
    user.profile.picture = user.gravatar();

    User.findOne({email : req.body.email}, function (err, existingUser) {
        if(err) return next(err);
        if(existingUser) {
            if(existingUser.otp.validate){
                req.flash('errors', 'Email Address already exists.');
                return res.redirect('/signup');
            }
            else{
                User.remove({email : req.body.email},function (err) {
                    if(err) return next(err);
                    var secret = speakeasy.generateSecret({length: 20});

                    let token = speakeasy.totp({
                        secret: secret.base32,
                        encoding: 'base32',
                        time: 11000
                    });

                    user.otp.secret = secret;

                    user.save(function (err) {
                        if(err){
                            return next(err);
                        }
                        var send = require('gmail-send')({
                            user: config.mailing.from,
                            pass: config.mailing.password,
                            to:   user.email,
                            subject: 'Your OTP from Expense Manager to signup',
                            html:    'Your OTP is <b>'+token+'</b>. Use this to verify your account. This is valid only for <b>3 hours</b>.'
                        });
                        send();
                        return res.render('accounts/otp', { user: user });
                    });
                });
            }
        }
        else {
            var secret = speakeasy.generateSecret({length: 20});

            let token = speakeasy.totp({
                secret: secret.base32,
                encoding: 'base32',
                time: 11000
            });

            user.otp.secret = secret;

            user.save(function (err) {
                if(err){
                    return next(err);
                }
                var send = require('gmail-send')({
                    user: config.mailing.from,
                    pass: config.mailing.password,
                    to:   user.email,
                    subject: 'Your OTP from Expense Manager to signup',
                    html:    'Your OTP is <b>'+token+'</b>. Use this to verify your account. This is valid only for <b>3 hours</b>.'
                });
                send();
                return res.render('accounts/otp', { user: user });
            });
        }
    });
});

router.post('/otp',function (req, res, next) {
    var token = parseInt(req.body.otp);
    console.log(token);
    User.findOne({email : req.body.email}, function (err, user) {
        if(err) return next(err);
        var tokenValidates = speakeasy.totp.verify({
            secret: user.otp.secret.base32,
            encoding: 'base32',
            token: token,
            time: 11000
        });
        console.log(tokenValidates);
        if(tokenValidates){
            user.otp.validate = true;
            user.save(function (err) {
                if(err) return next(err);
                req.logIn(user,function (err) {
                    if(err) return next(err);
                    res.redirect('/profile');
                });
            })
        }
        else {
            req.flash('errors', 'OTP verification unsuccessful.');
            return res.redirect('/signup');
        }
    });
});

router.get('/auth/facebook', passport.authenticate('facebook', {scope:'email'}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/profile',
    failureRedirect: '/login' }));

router.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login','profile','email'] }));


router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/profile');
    });



router.get('/', function (req, res) {
    if(req.user){
        return res.render('mains/home', {
            user : req.user
        });
    }
    return res.render('mains/home');
});

router.post('/setBudget',checkLoggedIn , function (req, res, next) {
    User.findOne({email : req.user.email}, function (err, user) {
        if(err) return next(err);
        user.budget = parseInt(req.body.budget);
        user.save(function (err) {
            if(err) return next(err);
            return res.redirect('/profile');
        });
    });
});

router.get('/add',checkLoggedIn, function (req, res, next) {
    if(req.user){
        return res.render('accounts/addExpense', {
            user : req.user
        });
    }
    return res.render('mains/home');
});

router.get('/graphsData', function (req, res, next) {
    User.findOne({email : req.user.email}, function (err, user) {
        if(err) return next(err);

        let obj1={},obj2={};
        let obj3={},obj4={};

        user.previousMonth.map(function (obj) {
            if(obj1.hasOwnProperty(obj.date.getDate())){
                obj1[obj.date.getDate()]+=parseInt(obj.amount);
            } else {
                obj1[obj.date.getDate()]=parseInt(obj.amount);
            }
            if(obj3.hasOwnProperty(obj.category)){
                obj3[obj.category]+=parseInt(obj.amount);
            } else {
                obj3[obj.category]=parseInt(obj.amount);
            }
            // console.log(obj);
        });

        user.currentMonth.map(function (obj) {
            if(obj2.hasOwnProperty(obj.date.getDate())){
                obj2[obj.date.getDate()]+=parseInt(obj.amount);
            } else {
                obj2[obj.date.getDate()]=parseInt(obj.amount);
            }
            if(obj4.hasOwnProperty(obj.category)){
                obj4[obj.category]+=parseInt(obj.amount);
            } else {
                obj4[obj.category]=parseInt(obj.amount);
            }
        });
        // console.log(user.previousMonth);
        // console.log(obj1);
        // console.log(obj3);

        let sum=0;
        let x2 = Object.keys(obj2).sort(function(a, b){return parseInt(a)-parseInt(b)});
        let y2 = [];
        for(let i of x2){
            sum+=obj2[i];
            y2.push(sum);
        }
        sum=0;
        let x1 = Object.keys(obj1).sort(function(a, b){return parseInt(a)-parseInt(b)});
        let y1 = [];
        for(let i of x1){
            sum+=obj1[i];
            y1.push(sum);
        }

        let x3 = Object.keys(obj3);
        let y3 = [];
        for(let i of x3){
            y3.push(obj3[i]);
        }
        let x4 = Object.keys(obj4);
        let y4 = [];
        for(let i of x4){
            y4.push(obj4[i]);
        }

        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        let month1="",month2="";
        if(user.previousMonth[0]){
            month1=monthNames[user.previousMonth[0].date.getMonth()]+" "+user.previousMonth[0].date.getFullYear();
        }
        // console.log(user.previousMonth[0]);
        // console.log("CURRENT");
        // console.log(user.currentMonth[0]);
        if(user.currentMonth[0]){
            month2=monthNames[user.currentMonth[0].date.getMonth()]+" "+user.currentMonth[0].date.getFullYear();
        }

        res.json({
            x1 : x1,
            y1 : y1,
            x2 : x2,
            y2 : y2,
            budget : user.budget,
            m1 : month1,
            m2 : month2,
            x3 : x3,
            x4 : x4,
            y3 : y3,
            y4 : y4
        });
    });
});

router.get('/stats',checkLoggedIn, function (req, res, next) {
    return res.render('accounts/stats', {
        user : req.user
    });
});



router.post('/add',function (req, res, next) {
    User.findOne({email : req.user.email}, function (err, user) {
        if(err) return next(err);
        user.currentMonth.push({
            date : new Date(req.body.date),
            category : req.body.category,
            amount : req.body.amount
        });
        user.save(function (err) {
            if(err) next(err)
            return res.redirect('/add');
        });
    });
});

// router.get('/previous',function (req, res, next) {
//     let array = [{"date":"2017-11-01","category":"Food and Drinks","amount":"30"},{"date":"2017-11-03","category":"Food and Drinks","amount":"300"},{"date":"2017-11-10","category":"Food and Drinks","amount":"50"},{"date":"2017-11-15","category":"Food and Drinks","amount":"550"},{"date":"2017-11-19","category":"Food and Drinks","amount":"100"},{"date":"2017-11-01","category":"Health","amount":"1250"},{"date":"2017-11-02","category":"Leisure","amount":"100"},{"date":"2017-11-06","category":"Leisure","amount":"125"},{"date":"2017-11-13","category":"Transportation","amount":"400"},{"date":"2017-11-20","category":"Others","amount":"500"},{"date":"2017-11-09","category":"Food and Drinks","amount":"325"}];
//
//
//     User.findOne({email : req.user.email}, function (err, user) {
//         if(err) return next(err);
//         for(var i=0;i<array.length;i++){
//             console.log(array[i]);
//             user.previousMonth.push({
//                 date : new Date(array[i]["date"]),
//                 category : array[i]["category"],
//                 amount : array[i]["amount"]
//             });
//         }
//         user.save(function (err) {
//             if(err) next(err);
//         });
//     });
//
//     res.json("SUCCESS");
// });

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});

module.exports = router;