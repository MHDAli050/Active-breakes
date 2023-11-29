/* eslint-disable no-unused-expressions */

const AppError = require("../utiles/AppError");

const handelCastErrorDB = (error)=>{
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message,400)
}

const handelDublicatedFieldErrorDB = (error)=>{
    const message = `there is a dublicated field you have to change this field: ${error.keyValue.name}`;
    return new AppError(message,400)
}
// eslint-disable-next-line no-unused-vars
const handelJasonwebTockenError = err => new AppError('Invaild Token',400);
// eslint-disable-next-line no-unused-vars
const handelExpirJasonwebTockenError = err=> new AppError('Invaild Token',400);

function handelValidationErrorDB(error) {
    const Value = Object.values(error.errors).map(el => el.message).join(', ');
    const message = `Invalid input: ${Value}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err,req,res)=>{
if(req.originalUrl.startsWith('/api')){
    return res.status(err.statusCode).json({
        status : err.status,
        message : err.message,
        error :err,
        stack : err.stack

    })
}

console.error('ERROR ',err);
return res.status(500).render('error',{
    title : 'Something went wird !',
    msg : err.message,
})
}
const sendErrorProd = (err,req,res)=>{
//-A) if api Error
if(req.originalUrl.startsWith('/api')){
    // if Operational Error
    if(err.IsOperational){
    return res.status(err.statusCode).json({
        status : err.status,
        msg : err.message

    })
}
// Unknown Error
    //1-log
    console.error('ERROR ',err);
    //2-send genrator message .

  return  res.status(500).json({
        status :'error',
        msg : 'something went Wrong!'

    })
    
}
//-B) Render website
if(err.IsOperational){
   return res.status(err.statusCode).set('Content-Security-Policy',
   "default-src 'self' https://*.mapbox.com ; connect-src * data: blob: 'unsafe-inline'; base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;").render('error',{
        title : 'Something went Wrong!',
        msg : err.message

    })
}
//Unknown
    //1-log
    console.error('ERROR ',err);
    //2-send genrator message .

   return res.status(500).render('error',{
        title :'Something went Wrong!',
        msg : 'Please try again later!'

    })
}

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
 if(process.env.NODE_ENV === 'development'){
    sendErrorDev(err,req,res);
 }else if(process.env.NODE_ENV === 'production') {
    let error = {...err,name:err.name};
    error.message = err.message;
    // Convert the Casterror to a Opertional-error
    if(error.name === "CastError") error = handelCastErrorDB(error)
    if(error.code === 11000) error = handelDublicatedFieldErrorDB(error)
    if(error.name === "ValidationError") error = handelValidationErrorDB(error)
    if(error.name === "JsonWebTokenError") error = handelJasonwebTockenError(error)
    if(error.name === "TokenExpiredError") error = handelExpirJasonwebTockenError(error)
    sendErrorProd(error,req,res);
 }

}