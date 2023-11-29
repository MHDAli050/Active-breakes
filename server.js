const mongoose = require('mongoose');

const dotenv = require('dotenv');
//console.log(x)
process.on('uncaughtException',err=>{
  console.log(err.name,err.message);
  console.log('Uncought Exception , shutting down ...')
   process.exit(1);
})
dotenv.config({ path: `./config.env` });
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.set('strictQuery', false);
//mongoose.connect(DB).then(()=>{
   // console.log('the conection is success ..')
//})process.env.DATABASE_LOCAL
//To the localData Base we do llike this 
mongoose.connect(DB).then(()=>{
    console.log('the conection to the DB is success ..')
})

//console.log(process.env.NODE_ENV);
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('waiting for requests ...');
});

process.on('unhandledRejection',err=>{
  console.log(err.name,err.message);
  console.log('UnhandledRejection, shutting down ...')
  server.close(()=>{
    process.exit(1);
  })
})

process.on('SIGTERM',()=>{
  console.log('SIG term recieved, shutting down ...')
  server.close(()=>{
    process.exit(1);
  })
})
