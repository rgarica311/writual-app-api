const express = require('express')
const xss = require('xss')
const bodyParser = express.json();
const errorRouter = express.Router();
const nodemailer = require('nodemailer')
const { AWS_PASS, AWS_USER } = require('./config')


const serializeError = error => ({
  name: xss(error.name),
  email: xss(error.email),
  error: xss(error.error),
}) 


errorRouter
.route('/error')
.post(bodyParser, async (req, res, next) => {
    for(const field of ['name', 'email', 'error']) {
        if(!req.body[field]) {
            //console.log(`${field} is required`)
            return res.status(400).send(`${field} is required`)
        } 
    }

    const { name, email, error } = req.body
    
    const errorReport = {name, email, error}
    const serializedErrRep = serializeError(errorReport)
    //console.log(`error report: ${JSON.stringify(serializedErrRep)}`)
    let transporter = nodemailer.createTransport({
          host: "email-smtp.us-west-2.amazonaws.com",
          port: 587,
          secure: false,   //upgrade later with STARTTLS
          auth: {
            user: AWS_USER,
            pass: AWS_PASS
          }
        });

        transporter.verify(function(error, success) {
           //console.log('transporter verify running')
          if (error) {
             //console.log(error);
          } else {
             //console.log("Server is ready to take our messages");
          }
        });

        let info = await transporter.sendMail({
          from: serializedErrRep.email,   //sender address
          to: 'error@writualapp.com',   //list of receivers
          subject: `Error Report from ${serializedErrRep.name}`,   //Subject line
          text: serializedErrRep.error,   //plain text body
          //html: "<b>Hello world?</b>"   //html body
        });

        //console.log("Message sent: %s", info.messageId);
})

module.exports = errorRouter