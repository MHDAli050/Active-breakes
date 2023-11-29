const mongoose = require('mongoose');
const Tour = require('./tourModel');

//const slugify = require('slugify');




const reviewSchema = new mongoose.Schema({
review : {
    type : String,
    required : [true,"you should inter your review"]
},
rating : {
    type:Number,
    min:[1,'your rate must be more than 1'],
    max:[5,'your rate must be less than 5']
},
createdAt :{
    type : Date,
    default:Date.now()
},
tour:{

        type : mongoose.Schema.ObjectId,
        ref: 'Tour',
        required:[true,'review must belong to a Tour']
    
},
user : {
    
        type : mongoose.Schema.ObjectId,
        ref: 'User',
        required:[true,'review must belong to a User']
}
},{
    toJSON :{virtuals:true},
    toObject:{virtuals:true}
})


reviewSchema.pre(/^find/,function(next){
   // this.populate({
   //   path:'tour',
   //   select:'name'
   // }).populate({
   //     path:'user',
   //     select:'name photo'
   // });
   this.populate({
      path:'user',
      select:'name photo'
     })
    next();
  })

  reviewSchema.index({tour:1,user:1},{unique:true});

  reviewSchema.statics.calcAverageRating = async function(tourId,rating){
    const stats = await this.aggregate([
        {
            $match:{tour:tourId},
        },
        {
            $group : {
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{$avg:'$rating'}
            }
        }
    ])
   
    if(stats.length > 0){
    await Tour.findByIdAndUpdate(tourId,{
        ratingsAverage : stats[0].avgRating,
        ratingsQuantity : stats[0].nRating,
        rating:rating
    })
    }else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsAverage : 4.5,
            ratingsQuantity : 0,
            rating:4.5
        })
    }
    
  }

  reviewSchema.post('save',function(){
    //this points to current review
    this.constructor.calcAverageRating(this.tour,this.rating);
  })
//findOneAndDelete
//findOneAndUpdate
  reviewSchema.pre(/^findOneAnd/,async function(next){
   //clone is important because Mongoose no longer allows executing the same query object twice. 
   this.r = await this.findOne().clone();
   
    next();
  })
  reviewSchema.post(/^findOneAnd/,async function(){

   await this.r.constructor.calcAverageRating(this.r.tour,this.r.rating);
})
const Review = mongoose.model('Review',reviewSchema);

module.exports = Review;

