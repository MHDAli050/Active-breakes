//const fs = require("fs");
const sharp = require("sharp");
const Tour = require("../Model/tourModel");
// eslint-disable-next-line import/order
const multer = require('multer');
//const AppError = require("../utiles/AppError");

const handlerFactory = require('./handlerFactory');

const catchAsync = require(`./../utiles/catchAsync.js`);
const AppError = require("../utiles/AppError");

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// we don't need checkId anymore. The mongo will take care about that .
/*exports.checkId =(req,res,next,val)=>{
   // console.log(`this is the tour id : ${val}` );
    if(req.params.id * 1 >= tours.length){
        return  res.status(404).json({
              status : "failed",
              message : "Invalid ID"
          })
      }
    next();
}*/


const multerStorage = multer.memoryStorage(); // the image will be store in the buffer in memorey

const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true); 
    }else {cb(new AppError('Not an Image, Please upload just images !',400),false)}   
}

const upload = multer({storage:multerStorage,fileFilter:multerFilter});

exports.uploadTourimages = upload.fields([{name:'imageCover',maxCount:1},{name:'images',maxCount:3}]);

exports.resizeImages = catchAsync(async(req,res,next)=>{
    if(!req.files.imageCover || !req.files.images) return next();
    // image-Cover
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer).resize(2000,1333)
    .toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${req.body.imageCover}`);
     
    // images
    req.body.images = []
    await Promise.all(
        req.files.images.map(async (file,i)=>{
            const image = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;

            await sharp(file.buffer).resize(2000,1333)
            .toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${image}`); 
            req.body.images.push(image);
        })
    )
    next();

})
exports.checkBody =(req,res,next)=>{
    if(!req.body.name || !req.body.price){
        return  res.status(400).json({
              status : "failed",
              message : "Missing name or price .."
          })
      }
    next();
}
exports.aliasTopTours = (req,res,next)=>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields='name,price,ratingsAverage,summary,difficulty';
    next();
}
exports.getAllTours =handlerFactory.getAllOne(Tour);
exports.creatTour = handlerFactory.createOne(Tour);
exports.getTour = handlerFactory.getOne(Tour,'reviews');
exports.updateTour = handlerFactory.updateOne(Tour);
exports.deleteTour =handlerFactory.deleteOne(Tour);

exports.getToursStates =catchAsync(async(req,res ,next)=>{
        const states = await Tour.aggregate([
            {
                $match : {
                    ratingsAverage : {$gte:4.5}
                },
                
            },
            {
                $group : {
                    _id : {$toUpper:'$difficulty'},
                    numTours :{$sum :1},
                    numRatings : {$sum : '$ratingsQuantity'},
                    avgRating : {$avg:'$ratingsAverage'},
                    avgPrice : {$avg : '$price'},
                    minPrice : {$min:'$price'},
                    maxPrice : {$max:'$price'},
                }
            },
            {

                $sort:{
                    avgPrice : 1
                }
            },
            {
                $match : {
                    _id : {$ne:'EASY'}
                }
            }
            
        ])
        res.status(200).json({
            state : 'sucesse',
            data : {
                states
            }
        })
})
exports.getMonthlyPlan = catchAsync(async (req,res)=>{
        const year = req.query.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind : "$startDates",
        },
        {
            $match :{ startDates:{
                $gte : new Date(`${year}-01-01`),
                $lte : new Date(`${year}-12-31`)
            }
        }
    },
    
        {
            $group : {
                _id : {$month : '$startDates'},
                numTours : {$sum :1},
                Tours : {$push : '$name'},
            
            }
        },  
        {
            $addFields : {month : '$_id'}

        } ,
         {
            $project:{
                _id : 0
            }
        },
        {
            $sort : {numTours : -1}
        },
        {
            $limit : 6
        }
    

    ])
    res.status(200).json({
        state : 'sucesse',
        resultes : plan.length,
        data : {
            plan,
        }
    })
})

exports.getToursWithIn = catchAsync(async (req,res,next)=>{
    const {distance,latlng,unit} = req.params;
    const [lat,lng]=latlng.split(',');
const radious = unit==='mi' ? distance /3963.2 : distance/6378.1;
if(!lat||!lng){
    next(new AppError('you have to enter latitudr and langitude in the form of latlng .',400));
}
const tours = await Tour.find({startLocation:{$geoWithin :{$centerSphere : [[lng,lat],radious]}}});
res.status(200).json({
    status : 'success',
    resultsLength : tours.length,
    data : {
        data:tours
    }
})
})

exports.getDistance = catchAsync(async (req,res,next)=>{
    const {latlng,unit} = req.params;
    const [lat,lng]=latlng.split(',');
const multplier = unit==='mi' ? 0.000621371 : 0.001;
if(!lat||!lng){
    next(new AppError('you have to enter latitudr and langitude in the form of latlng .',400));
}
const distnaces = await Tour.aggregate([
    {
        $geoNear :{
            near :{
            type:'Point',
            coordinates : [lng*1,lat*1],
            },
            distanceField : 'distance',
            distanceMultiplier : multplier
        },
    },
    {
        $project :{
            name : 1,
            distance : 1
        }
    }
])
res.status(200).json({
    status : 'success',
    resultsLength : distnaces.length,
    data : {
        data:distnaces
    }
})
})