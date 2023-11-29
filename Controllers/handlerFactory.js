const ApiFeatures = require(`./../utiles/Apifeatures.js`);
const catchAsync = require('../utiles/catchAsync');
const AppError=require('../utiles/AppError');

exports.deleteOne = Model =>catchAsync(async (req,res,next)=>{
    const doc= await Model.findByIdAndDelete(req.params.id);
    if(!doc){
     return next(new AppError('There is no Document with this Id',404));
   }
 res.status(204).json({
     status:'success',
 })
})

exports.updateOne = Model => catchAsync(async (req,res,next)=>{
    const doc = await Model.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators : true});
    if(!doc){
        return next(new AppError('There is no Document with this Id',404));
      }
res.status(200).json({
    status:'success',
    data:{
        doc
    }
})
})

exports.createOne = Model =>catchAsync(async (req,res,next)=>{

    const newDoc = await Model.create(req.body);
    if(!newDoc){
        return next(new AppError('There is no Document was created',400));
      }
        res.status(201).json({
            status : 'success',
            data : {
                newDoc
            }
        })
})

exports.getOne = (Model,popOption) =>catchAsync(async (req,res,next)=>{
    //const id = req.params.id *1;
    let query = Model.findById(req.params.id);
    if(popOption) query = query.populate(popOption);
    const doc = await query;
         // const tour = await Tour.findById(req.params.id).populate('guides');
          // the same like tours.findOne({the condation}) in mongo db , here findbyid belong to mongoose
    //  const tour = tours.find(el => el.id === id);
    if(!doc){
      return next(new AppError('There is no Document with this Id',404));
    }
      res.status(200).json({
          status:'success',
          data:{
              data : doc,
          }
      })
  })

  exports.getAllOne = Model =>catchAsync(async(req,res,next)=>{
    // allow to get all reviews for a certain Id
    let filter={};
    if(req.params.tourId) filter={tour:req.params.tourId};
    const features = new ApiFeatures(Model.find(filter),req.query).fillter().sort().limitFields().pagination();
    const tours = await features.query;
res.status(200).json({
    status : 'success',
    resultes: tours.length,
    data : {
        tours
    }
})
})