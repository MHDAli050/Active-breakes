const mongoose = require('mongoose');

//const Tour = require(`${__dirname}/../../Model/tourModel.js`);
const dotenv = require('dotenv');

dotenv.config({ path: `./config.env` });
const fs = require("fs");
//const { json } = require('express');
const Tour = require('../../Model/tourModel');
const User = require('../../Model/userModel');
const Review = require('../../Model/reviewModel');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.set('strictQuery', false);

mongoose.connect(DB).then(()=>{
    console.log('the conection to DBS is success ..')
})

const importData = async()=>{

 try{
     await Tour.create(tours);
     await User.create(users,{validateBeforeSave:false});
     await Review.create(reviews);
    console.log("succefuly the data is loaded to DB")

}catch(err){
console.log(err)
}
process.exit();
};

const deleteData = async()=>{

    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
       console.log("the data is deleted from DB")
   
   }catch(err){
   console.log(err)
   }
   process.exit();
   };

   if(process.argv[2]=== '--import'){
    importData();
   }else if(process.argv[2]=== '--delete'){
    deleteData()
   }