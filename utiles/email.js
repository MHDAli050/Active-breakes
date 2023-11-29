/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require('nodemailer');
// eslint-disable-next-line node/no-extraneous-require
const pug = require('pug');
const htmlToText = require('html-to-text')


// it is very important this class
module.exports = class Email{
    constructor(user,url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `${process.env.NODE_ENV==='production' ? process.env.SENDGRID_EMAIL_FROM : `Mustafa MHD Ali<${process.env.EMAIL_FROM}> `}`;
    }

    newTransport(){
        if(process.env.NODE_ENV==='production'){
            //sendgrid
            return  nodemailer.createTransport({
                service:'SendGrid',
                auth:{
                    user:process.env.SENDGRID_USERNAME,
                    pass:process.env.SENDGRID_PASSWORD
                }
            }) 

        }  

        
        return  nodemailer.createTransport({
            host : process.env.MAIL_HOST,
            port:process.env.MAIL_PORT,
            auth:{
                user:process.env.MAIL_USERNAME,
                pass:process.env.MAIL_PASSWORD
            }
        }) 
    }

    // send the actual email
     async send (template,subject){
        // -1) Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
            firstName:this.firstName,
            url:this.url,
            subject
        });

        // -2) define mail options
        const mailOPtions = {
            from :this.from ,
            to:this.to,
            subject,
            html,
            text: htmlToText.convert(html)
        }
        // Create a transport and send email
        await this.newTransport().sendMail(mailOPtions)

    }

    async sendWelcome(){
        await this.send('welcome','welcome to the Natours Family. !');
    }

    async sendPasswordRest(){
        await this.send('passwordRest','your password Rest Token (valid for only 10 Minutes)');
    }
}

// const sendEmail = async options=>{
//     // create a mail transporter .


//     // define mail option
//     const mailOPtions = {
//         from : 'samir ali saaamir@hello.de',
//         to:options.email,
//         subject:options.subject,
//         text:options.message
//         //html:
//     }

//     await mailTransporter.sendMail(mailOPtions);

// }

// module.exports = sendEmail;
