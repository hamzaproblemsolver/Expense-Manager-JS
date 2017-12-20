const mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');
let crypto = require('crypto');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    email : {type : String, unique : true},
    password : String,

    facebook : String,
    google : String,
    tokens : Array,
    otp : {
        secret : Schema.Types.Mixed,
        validate : {type: Boolean, default : false}
    },
    profile : {
        name : {type: String, default : ""},
        picture : {type: String, default:""}
    },
    budget : Number,
    currentMonth : Array,
    previousMonth : Array
});

UserSchema.pre('save', function (next) {
    let user = this;
    if(!user.isModified('password')) return next();
    bcrypt.genSalt(10, function (err, salt) {
        if(err) return next(err);
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if(err) return next(err);
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.setMonth = function () {
    let user = this;
    if(user.currentMonth[0]) {
        if (user.currentMonth[0].date.getMonth() < new Date().getMonth() || (user.currentMonth[0].date.getMonth() == 11 && 0 >= new Date().getMonth())) {
            user.previousMonth = user.currentMonth;
            user.currentMonth = [];
            if(user.currentMonth[0].date.getMonth() + 1 < new Date().getMonth() || (user.currentMonth[0].date.getMonth() == 11 && 0 > new Date().getMonth()) || user.currentMonth[0].date.getFullYear() < new Date().getFullYear()){
                user.previousMonth = [];
            }
            user.save(function (err) {
                return user;
            });
        }
    }
    return user;
}

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

UserSchema.methods.gravatar = function (size) {
    if(!this.size) size=200;
    if(!this.email) return 'https://gravatar.com/avatar/?s='+size+'&d=wavatar';
    let md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return 'https://gravatar.com/avatar/'+md5+'?s='+size+'&d=wavatar';
}

module.exports = mongoose.model('User',UserSchema);