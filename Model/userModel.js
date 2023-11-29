/* eslint-disable no-shadow */
/* eslint-disable prefer-arrow-callback */
const crypto = require('crypto')
const mongoose = require('mongoose');
const validatore = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name :  {
      type: String,
      required : [true, "the user must have a name"]

    },
    role : {
        type : String,
        enum : ["admin","user","lead-guide","Leader"],
        default : "user"
    },
    email:{
        type: String,
        required : [true, "the user must have an email"],
        unique : true,
        lowerCase : true,
        validate:[validatore.isEmail,'your email is not valid please try another email']
    },
    photo : {type:String, default:'default.jpg'},
    password:{
        type : String,
        required :[true,'must have a password'],
        minlength: 8,
        select : false
    },
    passwordConfirm :{
        type : String,
        required :[true,'must to confirm your password'],
        validate:[ function validatore (el){
         return el===this.password;
        },'the passwords are not the same']
    },
    passwordChangedAt : Date,
    restToken : String,
    expireRestToken : Date,
    active:{
        type :String,
        default : true,
        select:false
    }
})



userSchema.pre('save',async function(next){

    // check if the password modified or not
    if(!this.isModified('password')) return next();

    //hash the password with cost 12
    this.password = await bcrypt.hash(this.password,12);

    // delete passwordConfirm field
    this.passwordConfirm = undefined;

})

userSchema.pre(/^find/,function(next){
    //this points to the current query
    this.find({active : {$ne : false}});
    next();
})

userSchema.methods.correctPassword = async function(candidantPassword , userPassword){
    return await bcrypt.compare(candidantPassword,userPassword)
}

userSchema.methods.passwordChangedAfter = function(jwtTimestamp){
    if(this.passwordChangedAt){
        const passwordChangedTimestamp = parseInt(this.passwordChangedAt /1000,10);
        return jwtTimestamp < passwordChangedTimestamp
    }
    //false means Not changed
    return false
}
userSchema.methods.createForgetPasswordRestToken= function(){
    const restToken = crypto.randomBytes(32).toString('hex');
     this.restToken = crypto.createHash('sha256').update(restToken).digest('hex');
     this.expireRestToken = Date.now() + 10 *60 *1000;
     return restToken;
}
userSchema.pre('save',function(next){
    if(!this.isModified('password')||this.isNew)return next();
    this.passwordChangedAt=Date.now() - 1000;
    next()
})

const User = mongoose.model('User',userSchema);


module.exports = User;