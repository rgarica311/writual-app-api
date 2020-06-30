require('dotenv').config()
const express = require('express');
const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const client  = redis.createClient();
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const anatomyRouter = require('./anatomy-router')
const catRouter = require('./cat-router')
const frameworksRouter = require('./frameworks-router')
const heroRouter = require('./hero-router')
const projectsRouter = require('./projects-router')
const episodesRouter = require('./episodes-router')
const charactersRouter = require('./characters-router')
const scenesRouter = require('./scenes-router')
const userRouter = require('./user-router')
const sharedProjectsRouter = require('./shared-projects-router')
const sharedEpisodesRouter = require('./shared-episodes-router')
const messagesRouter = require('./messages-router')
const detailsRouter = require('./details-router')
const treatmentsRouter = require('./treatment-router')
const app = express()
const admin = require('./firebaseAdmin');
const bodyParser = express.json();
const UserService = require('./user-service');
const SharedProjectsService = require('./shared-projects-service')
const MessagesService = require(`./messages-service`)
const xss = require('xss')


const http = require('http').createServer(app);
const io = require('socket.io')(http);
const knex = require('knex')
const { PORT, DATABASE_URL } = require('./config')

http.listen(8000, () => {
  console.log('socket io listening on port 8000')
})

const users = []
const sockets = []
const titles = []


const serializeMessage = msg => ({
    id: msg.id,
    sender_uid: msg.sender_uid,
    recipient_uid: msg.recipient_uid,
    message: xss(msg.message),
    proj: msg.proj,
    socket_available: msg.socket_available,
    date_created: msg.date_created
})

io.on('connection', (client) => {
  let scrollCount = 0
  let limit = 10
  //console.log(`debug private message: on connection client, getAuthToken ${Object.keys(client.conn)}`)
  let _uid, _email, _title
  client.on('uid', (uid, title, email, recipient_uid) => {
    _uid = uid
    _title = title
    _email = email
    
    //console.log(`debug private message: client.on 'uid', uid: ${uid}`)
    const socketPairs = {
      uid: uid,
      recipient_uid: recipient_uid,
      socketId: client.id,
      title: title,
      email: email 
    }
    sockets.push(socketPairs)
    console.log(`debug private message: sockets after push: ${JSON.stringify(sockets)}`)

  })

  client.on('scene-added', project_id => {
    client.broadcast.emit('new-scene-added',  project_id)
  })

  client.on('new-character-added', project_id => {
    client.broadcast.emit('new-character-added', project_id)
  })

  client.on('update-detail', project_id => {
    console.log('update-detail running', project_id)
    client.broadcast.emit('update-detail', project_id)
  })

  client.on('update-treatment', project_id => {
    console.log('updated treatment', project_id)
    client.broadcast.emit('update-treatment', project_id)
  })

  client.on('project-shared', email => {
    console.log(`project shared ${email}`)
    UserService.getUid(app.get('db'), email)
      .then(uid => {
        console.log('project shared uid returned:', uid)
        client.broadcast.emit('project-shared', uid)
      })
  })

  client.on('check-unread-msgs', (uid, title) => {
    console.log('checking for unread messages....')
    MessagesService.getUnreadMessages(app.get('db'), uid, title)
      .then(messages => {
        //console.log(`debug chat getUnreadMessages, messages: ${JSON.stringify(messages)}`)
        if(messages.length > 0) {
          messages.map(msg => {
            client.emit('check-unread-msgs', true, messages.length, title, msg.sender_uid)
          })
        } else {
          //console.log(`check unread msgs emit false`)
          client.emit('check-unread-msgs', false, title)
        }
      })
  })

  client.on('get-initial-messages', (title, uid, recipient_uid) => {
    console.log(`debug chat get initial messages running: title, ${title}, uid: ${uid}, recipient_uid: ${recipient_uid}`)
    /*if(!titles.includes(title)){
      titles.push(title)
      console.log(`run getInitialMessages`)
    }*/
    MessagesService.getInitialMessages(app.get('db'), uid, title, recipient_uid)
    .then(messages => {
      messages = messages.rows.reverse()
      //console.log(`debug chat: messages.rows, ${JSON.stringify(messages)}`)
      client.emit('get-initial-messages', messages)
    })

    MessagesService.setRead(app.get('db'), uid)
      .then(rowsAffected => console.log(JSON.stringify(rowsAffected)))
  })

  client.on(`new-private-msg`, async (title, message, email, recipient_uid, sender_uid) => {
    let senderSocket
    const msg = {
          sender_uid: sender_uid,
          recipient_uid: recipient_uid,
          message: message,
          proj: title,
          socket_available: sockets.find(socket => socket.uid === recipient_uid) !== undefined ? true : false
    }

    MessagesService.postMessage(app.get('db'), serializeMessage(msg))

    sockets.find(socket => {
      if(socket.uid === sender_uid && socket.email === email && socket.title === title)
        senderSocket = socket.socketId
      })
    io.to(senderSocket).emit(`to-sender-${title}`, msg)

    if(sockets.find(socket => socket.uid === recipient_uid) !== undefined){
      
      let recipientSocket
      sockets.find(socket => {
        if(socket.uid === recipient_uid && socket.title === title) {
          recipientSocket = socket.socketId
          console.log(`recipientSocket ${recipientSocket}`)
        }
      })
      io.to(recipientSocket).emit(`${title}`, msg)

    } 

    
  })

  client.on(`load-on-scroll`, (title, uid, recipient_uid) => {
    limit += 5
    console.log(`load-on-scroll runnning limit: ${limit}`)
    MessagesService.getNextMessages(app.get('db'), title, uid, limit, recipient_uid )
    .then(messages => {
      console.log(`chat messages.rows loaded on scroll: ${JSON.stringify(messages.rows)}`)
      if(sockets.find(socket => socket.recipient_uid === recipient_uid) !== undefined) {
        console.log('load-on-scroll found socket')
        let recipientSocket
        console.log(`sockets: ${JSON.stringify(sockets)}`)
        sockets.find(socket => {
          if(socket.recipient_uid === recipient_uid && socket.title === title) {
            recipientSocket = socket.socketId
            io.to(recipientSocket).emit('send-old-messages', messages.rows)
            console.log(`recipientSocket ${recipientSocket}`)
          }
        })
      } 

    })
  })

  client.on('close-chat-window', function (uid, title, email) {
    //console.log(`on disconnect uid: ${uid}, title: ${title}, email: ${email}`)
    sockets.find(socket => {
      //console.log(`closec-chat-window socket: ${JSON.stringify(socket)}`)
      //console.log(`on diconnect: ${socket.uid} === ${this.uid} && ${socket.title} === ${title} && ${socket.email} === ${email}`)
      if(socket !== undefined) {
          if(socket.uid === uid && socket.title === title && socket.email === email) {
            sockets.splice(sockets.indexOf(socket), 1)
        }
      }
      
    })
    //console.log('client closed chat window...', uid, title, email)
    console.log(`on disconnect sockets: ${JSON.stringify(sockets)}`)
    //titles.splice(0, titles.length)
  })

  client.on('disconnect', function () {
    sockets.find(socket => {
      //console.log(`disconnect: ${socket}`)
      //console.log(`on diconnect: ${socket.uid} === ${this.uid} && ${socket.title} === ${title} && ${socket.email} === ${email}`)
      if(socket !== undefined) {
        if(socket.uid === _uid && socket.title === _title && socket.email === _email) {
          sockets.splice(sockets.indexOf(socket), 1)
        }
      }
      
    })
  })

  client.on('error', function (err) {
    //console.log('received error from client:', client.id)
    //console.log(err)
  })
})

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test'
}))

app.use(session({
  secret: 'ssshhhhh', 
  store: new redisStore({ host: '192.168.0.13', port: 6379, client: client,ttl : 260}),
  resave: false, 
  saveUninitialized: false
  })
);

async function verifyId(req, res, next) {
  //console.log('verify id running')
 
  if(req._parsedOriginalUrl !== undefined && req._parsedOriginalUrl.pathname !== '/socket.io/'){
    const idToken = req.headers.authorization
    //console.log('verify id idToken', idToken)
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken)
      if(decodedToken){
        //console.log(`Decoded Token Success`)
        //console.log('verify id if decodedToken.user_id:', decodedToken.user_id)
        req.uid = decodedToken.user_id
      } else {
        console.log('Token Not Decoded')
      }
      return next()
    } catch(e) {
        //console.log('e', e)
        return res.status(401).send('You are not authorized')
    }
  } else {
      const idToken = arguments[0]
      try {
      const decodedToken = await admin.auth().verifyIdToken(idToken)
      if(decodedToken){
        console.log('verify id if decodedToken.user_id:', decodedToken.user_id)
        return decodedToken.user_id
      }
    } catch(e) {
        //console.log('e', e)
        return res.status(401).send('You are not authorized')
    }
      //console.log(`debug private message: verifyId arguments ${JSON.stringify(arguments[0])} `)
      //console.log(`debug private message: verifyId req for socket connections: ${req}`)
  }
}

app.use(cors())
app.use(helmet())
app.use(verifyId);
app.use(anatomyRouter);
app.use(catRouter);
app.use(frameworksRouter);
app.use(heroRouter);
app.use(sharedProjectsRouter);
app.use(sharedEpisodesRouter);
app.use(projectsRouter);
app.use(episodesRouter);
app.use(charactersRouter);
app.use(scenesRouter);
app.use(userRouter);
app.use(detailsRouter);
app.use(treatmentsRouter);


app.use((error, req, res, next) => {
  let response;
  console.log(`server error ${error}`)
  if (process.env.NODE_ENV === 'production') {
    response = {error: {message: 'server error'}};
  } else {
    response = {error: {message: 'server error'}};
  }
  res.status(500).json(response);
});





module.exports = app;
