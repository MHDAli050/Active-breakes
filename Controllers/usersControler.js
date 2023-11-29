
// eslint-disable-next-line import/order
const multer = require('multer');
const sharp = require('sharp');
const User = require("../Model/userModel");
const AppError = require("../utiles/AppError");
const catchAsync = require("../utiles/catchAsync");
const handlerFactory = require('./handlerFactory');

const fillteringObj = (obj,...allowedFieleds)=>{
    const newObj = {};
    Object.keys(obj).forEach(el=>{if(allowedFieleds.includes(el)) newObj[el]=obj[el]});
    return newObj
}

// const multerStorage = multer.diskStorage({
//     destination : (req,file,cb)=>{
//         cb(null,'public/img/users');
//     },
//     filename:(req,file,cb)=>{
//         const ext= file.mimetype.split('/')[1];
//         cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })

const multerStorage = multer.memoryStorage(); // the image will be store in the buffer in memorey

const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true); 
    }else {cb(new AppError('Not an Image, Please upload just images !',400),false)}   
}

const upload = multer({storage:multerStorage,fileFilter:multerFilter});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req,res,next)=>{
    if(!req.file) return next(); // the return very important with out it will be a problem
  
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    

    sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/users/${req.file.filename}`);

    next();
}

exports.updateMe = catchAsync(async (req,res,next)=>{
    
    //check if the user try to update password
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('you connot change your password here please use! /updateMyPassword',400 ))
    }

    //fillter the Object from unwanted fieleds to not update it by example the role we donot want to modify it
    const fillteredObj = fillteringObj(req.body,'name','email');
    if(req.file){ fillteredObj.photo = req.file.filename;}
  
    // update document 
    const updateUser = await User.findByIdAndUpdate(req.user.id,fillteredObj,{new:true,runValidators:true});
    
    res.status(200).json({
        status : 'success',
        data :{ 
            user :updateUser
        }
    })
   
})

exports.deleteMe = catchAsync(async (req,res,next)=>{
 await User.findByIdAndUpdate(req.user.id,{active:false});
 res.status(200).json({
    status : 'success',
    data :null
 })
})

exports.getMe = (req,res,next)=>{
    req.params.id = req.user.id;
    next();
};
//this functions for the admin
exports.getAllUsers =handlerFactory.getAllOne(User)
exports.getUser = handlerFactory.getOne(User);
exports.createUser =handlerFactory.createOne(User);
//don't use this to update password
exports.updateUser =handlerFactory.updateOne(User);
exports.deleteUser =handlerFactory.deleteOne(User);