const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModel');
//const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name : {
      type : String,
      required : [true,"a tour must have a name"],
      unique : true,
      trim : true,
      maxlength : [40,'the name must have at the most 40 charachter '],
      minlength : [3,'the name must have at least 10 charachter '],
     // validate :[validator.isAlpha,'the must contains just charachters']
    },
    secretTour:{
     type:Boolean,
     default:false
    },
    duration :{
      type : Number,
      required : [true," a tour must have a Duration"]
    },
    maxGroupSize: {
      type: Number,
    },
    rating :{
      type : Number,
      default : 4.5,
     
    },
    difficulty :
      {
        type :String,
        default:'difficult',
        enum :{
          values:['easy','medium','difficult'],
          message : 'The defficulty schould be easy,medium or difficalt'
        }

      },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5,'the rat must be at the most 5 '],
      min : [1,'the rat must be at least 1 '],
      set : val=> Math.round(val*10)/10 // 4.66666 , 46.6666 , 47 , 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price : {
      type : Number,
      required : [true," a tour must have a price"]
    },
    priceDiscount :{ 
      type : Number,
     // default:50,
      validate : [ function validatore (val) {
//this here doesn't work in the update becuase this here points to the current documents and in the update the document is allreday exist
        return val < this.price;
      },
      'The DiscountPrice value ({VALUE}) should be smaller than the price']

      // This Type from Validators doesn't work because of INVALID VALIDATORE: RECIEVED UNDEFIND.
// validate : { validatore: function validatore (val) {
//   //this here doesn't work in the update becuase this here points to the current documents and in the update the document is allreday exist
//           return val < this.price;
//         },
//         message:'The DiscountPrice value ({VALUE}) should be smaller than the price'
//       },
   
    },
    summary:{
        type : String,
        required : [true,"a tour must have a summary"],
        trim : true 
    },
    slug : String,

    description : {
        type : String,
        trim : true
    },
    imageCover:{
        type : String,
        required : [true,"a tour must have an imageCover"]
    },
    images:[String],
    startLocation :{
      //Geojson
      type:{
        type:String,
        default:'Point',
        enum:['Point']
      },
      coordinates:[Number],
      address : String,
      description:String,
    },
    locations :[
      {
      type:{
        type:String,
        default:'Point',
        enum:['Point']
      },
      coordinates:[Number],
      address : String,
      description:String,
      day:Number,
    }
    ]
    ,
 
   guides:[
    {
      type : mongoose.Schema.ObjectId,
      ref: 'User'
    }
   ],
    createdAt : {
        type : Date,
        default:Date.now(),
        select :false
    },
    startDates : [Date]
  },  {
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
  });
  tourSchema.index({price:1,ratingsAverage:1});
  tourSchema.index({slug:1});
  tourSchema.index({startLocation:'2dsphere'});
  // Virtual Properties
  tourSchema.virtual('durationWeeks').get(function(){
   return this.duration / 7 ;
  });
  tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
  });

  //Documents Midellware // this points to the documents 
 // used with just save () and Create ()
   tourSchema.pre('save',function(next){
    this.slug =slugify(this.name,{lower : true});
    next();
  })

  // eslint-disable-next-line prefer-arrow-callback
  // tourSchema.post('save',function(doc,next){
  //   //console.log(doc);
  //   next();
  // })

 // tourSchema.pre("save",async function(next){
  //  const guidesPromises = this.guides.map(async id=> await User.findById(id));
  //  this.guides = await Promise.all(guidesPromises);
  //  next();
 // })
//  Query Midellware this points to the query
  tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}});
    this.start = Date.now();
    next();
  })

  tourSchema.pre(/^find/,function(next){
    this.populate({
      path:'guides',
      select:'-__v -passwordChangedAt'
    });
    next();
  })

  // eslint-disable-next-line prefer-arrow-callback
  // tourSchema.post(/^find/,function(doc,next){
  //  console.log(`Query took ${Date.now()-this.start} milliseconds`)
  //   next();
  // })
  
  //Aggregate Middelware this points to the   AggergateObject we schould use aggregate.Pipeline() array
  // eslint-disable-next-line prefer-arrow-callback
  tourSchema.pre('aggregate',function(next){
    // we take in care the spcialtiy of the geoNear to be allways at the first stage in the pipeline,
    //then the match with the goal to make the secret tours not appeare should be come in the seconed stage in the pipeline,
    //if we make the match after the project stage we will have all the tours , the secret ones also .
   if(this.pipeline()[0].$geoNear){
   this.pipeline().splice(1,0,{$match:{secretTour:{$ne:true}}});
   }else{
    this.pipeline().unshift({$match:{secretTour:{$ne:true}}});
   }
     next();
   })
  const Tour = mongoose.model("Tour", tourSchema);

  module.exports = Tour;