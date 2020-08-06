const express = require('express')
const xss = require('xss')
const logger = require('./logger')
const bodyParser = express.json();
const messagesRouter = express.Router();
const admin = require('firebase-admin');
const MessagesService = require('./messages-service');


const serializeMessage = msg => ({
    id: msg.id,
    sender_uid: msg.sender_uid,
    recipient_uid: msg.recipient_uid,
    message: xss(msg.message),
    socket_available: msg.socket_available,
    date_created: msg.date_created

})

/*messagesRouter
    .route('/messages/:title')
    .get((req, res, next) => {
        const title = req.params
        MessagesService.getInitialMessages(req.app.get.('db'), req.uid, title)
            .then(messages => {
                res.json(messages)
            })
    })

messagesRouter
    .route('/next/messages/:title')
    .get(req, res, next) => {
        const prev
        MessagesService.getNextMessages(req.app.get('db'), req.uid, title, limit)
            .then(messages => {
                res.json(messages)
            })
    })*/

messagesRouter
    .route('/message/iconurl/:sender_uid')
    .get((req, res, next) => {
        //console.log(`message icon_url route accessed`)

        const sender_uid = req.params.sender_uid
        MessagesService.getMessageIconUrl(req.app.get('db'), sender_uid)
            .then(url => {
                res.json(url)
            })
            .catch(next)
    })



module.exports = messagesRouter