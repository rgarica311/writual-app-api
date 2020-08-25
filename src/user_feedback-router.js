const express = require('express')
const bodyParser = express.json()
const user_feedbackRouter = express()
const xss = require('xss')
const nodemailer = require('nodemailer')
const { AWS_PASS, AWS_USER } = require('./config')


const serializeFeedback = text => ({
  name: xss(text.name),
  email: xss(text.email),
  title: xss(text.title),
  description: xss(text.description),
}) 

user_feedbackRouter
.route('/user_feedback')
.post(bodyParser, (req, res, next) => {
    console.log('user feedback router accessed')
    try {
      const { name, email, title, description } = req.body
    
      const userFeedback = {
          name,
          email,
          title,
          description
      }

      const serializedUserFeedback = serializeFeedback(userFeedback)

     let transporter = nodemailer.createTransport({
          host: "email-smtp.us-west-2.amazonaws.com",
          port: 465,
          secure: true,   //upgrade later with STARTTLS
          auth: {
            user: AWS_USER,
            pass: AWS_PASS
          }
        });

        transporter.verify(function(error, success) {
          if (error) {
             console.log(error);
          } else {
             console.log("Server is ready to take our messages");
          }
        });

        let info = transporter.sendMail({
          from: 'notifications@writualapp.com',   //sender address
          to: 'feedback@writualapp.com',   //list of receivers
          subject: `Feedback from ${serializedUserFeedback.name}`,   //Subject line
          text: serializedUserFeedback.title + ' ' + serializedUserFeedback.description + ' ' + serializedUserFeedback.email,   //plain text body
          //html: "<b>Hello world?</b>"   //html body
        });

    } catch (error) {
      console.error('error:', error)
    }
    
})

module.exports = user_feedbackRouter