require('dotenv').config()
const express = require('express');
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
const errorRouter = require('./error-router')
const feedbackRouter = require('./feedback-router')
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
const { DATABASE_URL, PORT } = require('./config')

http.listen(PORT, () => {
  console.log(`server listening on port: ${PORT}`)
})



const users = []
const sockets = []
const titles = []


const serializeMessage = msg => ({
    id: msg.id,
    sender_uid: msg.sender_uid,
    recipient_uid: msg.recipient_uid,
    message: xss(msg.message),
    project_id: msg.project_id,
    episode_id: msg.episode_id,
    proj: msg.proj,
    socket_available: msg.socket_available,
    date_created: msg.date_created
})

io.on('connect', (client) => {
  let scrollCount = 0
  let limit = 10
  let _uid, _email, _title, _episode_id

  client.on('uid', (uid, title, episode_id,  email, recipient_uid) => {
    _uid = uid
    _title = title
    _email = email
    _episode_id = episode_id
    
    const socketPairs = {
      uid: uid,
      episode_id: episode_id,
      recipient_uid: recipient_uid,
      socketId: client.id,
      title: title,
      email: email 
    }
    sockets.push(socketPairs)

  })

  client.on('scene-added', (project_id, isEpisode) => {
    client.broadcast.emit('new-scene-added',  project_id, isEpisode)
  })

  client.on('new-character-added', (project_id, isEpisode) => {
    client.broadcast.emit('new-character-added', project_id, isEpisode)
  })

  client.on('update-detail', project_id => {
    client.broadcast.emit('update-detail', project_id)
  })

  client.on('update-treatment', project_id => {
    client.broadcast.emit('update-treatment', project_id)
  })

  client.on('update-feedback', project_id => {
    client.broadcast.emit('update-feedback', project_id)
  })

  client.on('project-shared', email => {
    UserService.getUid(app.get('db'), email)
      .then(uid => {
        client.broadcast.emit('project-shared', uid)
      })
  })

  client.on('check-unread-msgs', (unreadArgs) => {

    let promisesToResolve = []
    unreadArgs.forEach(argSet => {
      promisesToResolve.push(MessagesService.getUnreadMessages(app.get('db'), argSet))
    })

    Promise.all(promisesToResolve)
    .then(projStatus => {
      try {
        client.emit('check-unread-msgs', projStatus) //figure out why not broadcasting
      }
      catch (error) {
        console.error('error emitting unread msgs:', error)
      }
      
    }).catch((error) => {
        let errorMsg = 'Could not fetch unread messages'
        console.error(errorMsg, error)
    })
  
  })

  client.on('get-initial-messages', (title, project_id, episode_id, uid, recipient_uid) => {
    
    MessagesService.getInitialMessages(app.get('db'), uid, episode_id, recipient_uid, project_id)
    .then(messages => {
      messages = messages.rows.reverse()
      client.emit('get-initial-messages', messages)
    })

    MessagesService.setRead(app.get('db'), uid)
      .then(rowsAffected => {/*console.log(JSON.stringify(rowsAffected))*/})
  })

  client.on(`new-private-msg`, async (title, project_id, episode_id, message, email, recipient_uid, sender_uid) => {
    let senderSocket
    const msg = {
          sender_uid: sender_uid,
          recipient_uid: recipient_uid,
          message: message,
          proj: title,
          project_id: project_id,
          episode_id: episode_id,
          socket_available: sockets.find(socket => socket.uid === recipient_uid && socket.title === title) !== undefined ? true : false
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
        }
      })
      io.to(recipientSocket).emit(`${title}`, msg)

    } 

    
  })

  client.on(`load-on-scroll`, (episode_id, project_id, uid, recipient_uid) => {
    limit += 5
    MessagesService.getNextMessages(app.get('db'), episode_id, project_id, uid, limit, recipient_uid )
    .then(messages => {
      if(sockets.find(socket => socket.recipient_uid === recipient_uid) !== undefined) {
        let recipientSocket
        sockets.find(socket => {
          if(socket.recipient_uid === recipient_uid && socket.episode_id === episode_id) {
            recipientSocket = socket.socketId
            io.to(recipientSocket).emit('send-old-messages', messages.rows)
          }
        })
      } 

    })
  })

  client.on('close-chat-window', function (uid, title, episode_id, email) {
    sockets.find(socket => {
      if(socket !== undefined) {
          if(socket.uid === uid && socket.title === title && socket.email === email && socket.episode_id === episode_id) {
            sockets.splice(sockets.indexOf(socket), 1)
        }
      }
      
    })
   
  })

  client.on('disconnect', function () {
    sockets.find(socket => {
      if(socket !== undefined) {
        if(socket.uid === _uid && socket.title === _title && socket.email === _email) {
          sockets.splice(sockets.indexOf(socket), 1)
        }
      }
      
    })
  })

  client.on('error', function (err) {
    console.error('received error from client:', client.id)
    console.error(err)
  })
})

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test'
}))

async function verifyId(req, res, next) {
  //console.log('verify id running')
  if(req._parsedOriginalUrl !== undefined && req._parsedOriginalUrl.pathname !== '/socket.io/'){
    const idToken = req.headers.authorization
    //console.log('verify id idToken', idToken)
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken)
      if(decodedToken){
        //console.log('verify id if decodedToken.user_id:', decodedToken.user_id)
        req.uid = decodedToken.user_id
      } else {
        //console.log('Token Not Decoded')
      }
      return next()
    } catch(e) {
        console.error('auth error', e)
        return res.status(401).send('You are not authorized')
    }
  } else {
      //console.log(`rea.headers.auth ${req.headers.authorization}`)
      const idToken = req.headers.authorization
      //console.log(`idToken in veryify ${idToken}`)
      try {
      const decodedToken = await admin.auth().verifyIdToken(idToken)
      if(decodedToken){
        //console.log('verify id if decodedToken.user_id:', decodedToken.user_id)
        req.uid = decodedToken.user_id
      }
      return next()
    } catch(e) {
        console.error('e', e)
        return res.status(401).send('You are not authorized')
    }
      
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
app.use(errorRouter);
app.use(feedbackRouter);


app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = {error: {message: 'server error'}};
  } else {
    response = {error: {message: 'server error'}};
  }
  res.status(500).json(response);
});





module.exports = app;
