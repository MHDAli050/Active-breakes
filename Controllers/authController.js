/* eslint-disable arrow-body-style */
/* eslint-disable import/order */
const {promisify} = require('util')
const User = require('../Model/userModel');
const AppError = require('../utiles/AppError')
const catchAsync = require('../utiles/catchAsync');
const Email=require('../utiles/email');
const crypto = require('crypto')

const jwt = require('jsonwebtoken');
//const { token } = require('morgan');

// create a token and send it when signup or login
const signToken = (id)=>{
   return jwt.sign({id:id},process.env.JWT_SECRET,{expiresIn :process.env.JWT_EXPIRES_IN})
}
const createSendToken = (user,statusCode,req,res)=>{
    
    const token = signToken(user._id);
    const optionsCookie = {
  expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24*60*60*1000),
  httpOnly:true, //to save the cookie just in the Browser and not in the local storge to avoid xss secripting attack.
  secure:req.secure //|| req.headers('x-forwarded-proto')==='https'
    };
    // if(process.env.NODE_ENV==='production') optionsCookie.secure=true;
    res.cookie('jwt',token,optionsCookie);
    //remove password from output
    user.password=undefined;
    user.active=undefined;
    res.status(statusCode).json({
        status:'success',
        token,
        data : {
            user,
        }
    })
}

exports.signup = catchAsync(async(req,res,next)=>{
   
    const newUser = await User.create(req.body);
    const url = `${req.protocol}://${req.get('host')}/me`;

    await new Email(newUser,url).sendWelcome();

     createSendToken(newUser,201,req,res);
})
//exports.hello = (req,res,next)=>{console.log('rrrrrrrrr');next()}

exports.login = catchAsync(async(req,res,next)=>{

    //check if email  and  password are there .
    const {email , password} = req.body;
    
    if(!email || !password){
        return next(new AppError('you have to enter the email and the password!',400));
    }

    // check if the user exist and if the password is correct 
   const user = await User.findOne({email}).select('+password');// be carefull here must findOne not just find 
 
  // const correct = await user.correctPassword(password,user.password);//here user is instance not User model
  // it is better to check if there is a user first then I see and call the compare method to check the password
   if (!user || !(await user.correctPassword(password,user.password))){
    return next(new AppError('Incorrect email or password!',401));
   }

   //when every thing is ok now send the Token
   createSendToken(user,200,req,res);
})

exports.protect = catchAsync(async (req,res,next)=>{
    //1) Grtting thr token and check if it is there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies.jwt){
        token=req.cookies.jwt;
    }
    //Verification token
    const decode = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
   
    //check if the user still exist
   const cuerrentUser = await User.findById(decode.id);
   if(!cuerrentUser){
    return next(new AppError('the user who belong him this token not any more exist,please log in again',401))
   }
   //check if the user has changed his password
  
   if(cuerrentUser.passwordChangedAfter(decode.iat)){
    return next(new AppError('user password has been changed, please log in again',401))
   }

// if everything ok do next and try to bind the user with the request because we will need it another time
   req.user =cuerrentUser; 
   res.locals.user = cuerrentUser; // we this here to improve performance we we are in viewRoutes and want to protect it also
   next();

})

exports.isLoggedIn = async (req,res,next)=>{
    //1) Grtting thr token and check if it is there
    try {
     if(req.cookies.jwt){

    //Verification token
    const decode = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
   
    //check if the user still exist
   const cuerrentUser = await User.findById(decode.id);
   if(!cuerrentUser){
    return next()
   }
   //check if the user has changed his password
  
   if(cuerrentUser.passwordChangedAfter(decode.iat)){
    return next()
   }

// if everything ok do next and try to bind the user with the request because we will need it another time
  // req.user =cuerrentUser; 
// there is a loggedin user
  res.locals.user = cuerrentUser;
  return next();
}
    }catch(err){
        return next()  // for the logout functionality to not have an error with the verfication of the jwt because it is overwrited
    }
next()

}

exports.logout= (req,res)=>{
    res.cookie('jwt','loggedout',{
        expires : new Date(Date.now() + 10 * 1000),
        httpOnly:true
    });
    res.status(200).json({status:'success'})
}
exports.restricted = (...Roles)=>{
    return (req,res,next)=>{
        // Roles should be admin or leader

        if(!Roles.includes(req.user.role)){
            return next(new AppError("you haven't permission to do this action",403))
        }
        next()
    }
}

exports.forgetPassword =catchAsync(async(req,res,next)=>{
    //search of user
    const user = await User.findOne({email : req.body.email});
    if(!user){
        return next(new AppError('The email address was not found',404))
    }
    //create restToken
    const restToken = user.createForgetPasswordRestToken();
    await user.save({validateBeforeSave : false});
  

    //send email to the user with the Token
    // const message = `Hello you have forget your password! don't wory you can rest it through this link ${restUrl}\n, if you didn't forget yourpassword please ignoore this email `;
try{
    // await sendEmail({
    //     subject:'your password rest token (valid 10 Minute) ', 
    //     email:user.email,
    //     message
    // })
   const restUrl = `${req.protocol}://${req.get('host')}/api/v1/users/restPassword/${restToken}`;
    await new Email(user,restUrl).sendPasswordRest();
    res.status(200).json({
        status:'success',
        mesaage:'The rest token was sent.'
    })
}catch(err){
    user.restToken=undefined;
    user.expireRestToken=undefined;
    await user.save({validateBeforeSave : false});
  
    return next(new AppError('There are an Error sending an email try later!',500))
}
})

exports.restPassword =catchAsync(async(req,res,next)=>{
    // get the user based one the Token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({restToken:hashedToken,expireRestToken:{$gt:Date.now()}});
    //if the Token has not expire and ther is auser , set the new password 
    if(!user)return next(new AppError('Token is invailed or expired',400));
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
   // user.restToken=undefined;
   // user.expireRestToken=undefined;
    await user.save();

    //update changed password property for the user ---> in model pre('save',....)
    //log the user in , send jwt
    createSendToken(user,200,req,res);

});

exports.updatePassword =catchAsync(async(req,res,next)=>{
// get user from the Collection .
const user = await User.findById(req.user.id).select('password') // user come from the protect middelware , because the user is allready loged in and want to update his password

// 2 check if the current password is correct .
if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
    return next(new AppError('your current password was wrong !',401))
}
// 3 if so , updatepassword
user.password=req.body.password;
user.passwordConfirm=req.body.passwordConfirm;
await user.save()// we don't use findAndUpdate because the validation in password will not work because we have this.keyword point to the current user collection

// 4 send token to the user.
createSendToken(user,200,req,res);
})