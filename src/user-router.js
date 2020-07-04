const express = require('express')
const xss = require('xss')
const logger = require('./logger')
const nodemailer = require('nodemailer')

const UserService = require('./user-service');
const ProjectsService = require('./projects-service');
const SharedProjectsService = require('./shared-projects-service');
const SharedEpisodesService = require('./shared-episodes-service');
const EpisodesService = require('./episodes-service');
const ScenesService = require('./scenes-service');
const CharactersService = require('./characters-service');
const usersRouter = express.Router();
const bodyParser = express.json();


const serializeuser = user => ({
  user_id: xss(user.user_id),
  user_name: xss(user.user_name),
  email: xss(user.logline),
  photo_url: user.genre,
})




usersRouter
  .route('/users')
  .post(bodyParser, (req, res, next) => {
    console.log('req.body', req.body)
    for(const field of ['user_name', 'email', 'photo_url']) {

      if(!req.body[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send(`${field} is required`)
      } 
  
    } 
    const { user_name, email, photo_url } = req.body
    const uid = req.uid
    const loggedInUser = { uid, user_name, email, photo_url }
    console.log('loggedInUser in users route', loggedInUser)
    try {
      UserService.getUsers(req.app.get('db'))
        .then(users => {
          console.log(`users in get users then: ${JSON.stringify(users)}`)
          if(users.some(user => user.uid === loggedInUser.uid) === true){
            console.log('same user')
          } else {
            console.log('new user')
            UserService.addUser(req.app.get('db'), loggedInUser)
              .then(user => {
                console.log('user', user)
                console.log(`user created with id ${user.id}`)
                res.status(201)
                .json(serializeuser(user))
                })
                .catch(next)
          }
        })
        .catch(next)

    } catch(e){
      console.log('error getting users', e)
    }
    
  })

  usersRouter
    .route('/verify/user/:email/proj/:project_id/:projformat/:message/:permission')
    .get( async (req, res, next) => {
      //req.connection.setTimeout( 20000 )
      const { email, project_id, projformat, message, permission } = req.params
      const { titles } = req.query
      console.log(`debug share project: user router accessed titles: ${titles} typeof: ${typeof titles}`)
      
      const uid  = req.uid
      
      console.log(`email in users router ${email}, project_id ${project_id}`)
      let user
      if(email === 'rory.garcia1@gmail.com' || email === 'filmfan311@gmail.com' || email === 'rory@skylineandmanor.com' || email === 'sashatomlinson16@gmail.com') {
        res.locals = await UserService.verifyUserExists(req.app.get('db'), email)
        next()
      } else {
         res.send('User does not exist')
      }
    },
      async (req, res, next) => {
        console.log(`sharing: res in next route ${JSON.stringify(res.locals)}` )
        let user = res.locals
        console.log(`user in midware ${JSON.stringify(user)}`)
        if(user[0].uid !== undefined && user[0].uid !== req.uid) {
          res.locals.sharedUID = user[0].uid 
          res.locals.projectToShare = await ProjectsService.getProjectToShare(req.app.get('db'), req.uid, req.params.project_id)
          next()
        }
      },
      (req, res, next) => {
        console.log(`third middleware locals prjtoshare ${JSON.stringify(res.locals.projectToShare)}`)
        console.log(`third middleware locals shareduid ${JSON.stringify(res.locals.sharedUID)}`)
        
        ProjectsService.setShared(req.app.get('db'), req.uid, req.params.project_id)
          .then(response => console.log(`set shared res ${response}`))
        
        
        next()
      },
      async (req, res, next) => {
        let { projectToShare, sharedUID } = res.locals
        console.log(`debug episode sharing project to share: ${JSON.stringify(projectToShare)}`)
        if(projectToShare.length > 0) {
          projectToShare[0].visible = true
          projectToShare[0].shared_by_uid = req.uid
          projectToShare[0].shared_with_uid = sharedUID
          projectToShare[0].permission = req.params.permission
          res.locals.sharedProj = await SharedProjectsService.shareProject(req.app.get('db'), projectToShare)
          next()
        } else {
            next()
        }
        
      },
      async (req, res, next) => {
        console.log(`debug episode sharing: episode midwarre running typeof req.params.titles ${req.query.titles}`)
        
        res.locals.episodeTitles = req.query.titles
        console.log('debug episode sharing: episodeTitles 1st:', JSON.stringify(res.locals.episodeTitles), JSON.stringify(res.locals.episodeTitles[0]))

        
        console.log('debug episode sharing: res.locals.sharedProj', res.locals.sharedProj)

        if(res.locals.episodeTitles[0] !== 'null') {
          console.log('debug episode sharing: episodeTitles:', JSON.stringify(res.locals.episodeTitles), JSON.stringify(res.locals.episodeTitles[0]))
          if(res.locals.episodeTitles.length > 0) {
            res.locals.episodeTitles.map(ep => 
              EpisodesService.getEpisodeToShare(req.app.get('db'), req.uid, ep)
                .then(episodeToShare => {
                  console.log(`debug episode sharing: episode to share then ${JSON.stringify(episodeToShare)}`)
                  if(episodeToShare){
                    console.log(`debug episode sharing: episode to share if ${JSON.stringify(episodeToShare)}`)

                    episodeToShare[0].visible = true
                    episodeToShare[0].shared_by_uid = req.uid
                    episodeToShare[0].shared_with_uid = res.locals.sharedUID

                    EpisodesService.shareEpisode(req.app.get('db'), episodeToShare)
                      .then(ep => {console.log('shared ep', ep)})
                  }
                })
              
            )
          }
          
        } else if(req.params.projformat === 'Television') {
            console.log('debug episode sharing: episode titles length:', res.locals.episodeTitles)
            clone = (obj) => Object.assign({}, obj);

            renameKey = (object, key, newKey) => {
                const clonedObj = clone(object)
                const targetKey = clonedObj[key]
                delete clonedObj[key]
                clonedObj[newKey] = targetKey
                clonedObj.visible = true
                clonedObj.show_hidden = false
                clonedObj.shared_by_uid = req.uid
                clonedObj.shared_with_uid = res.locals.sharedUID
                console.log(`clonedObj: ${JSON.stringify(clonedObj)}`)
                return clonedObj
            }

            let allEpisodes = await EpisodesService.getAllEpisodes(req.app.get('db'), req.uid, req.params.project_id)
            console.log(`debug episode sharing: allEpisodes: ${allEpisodes}`)
            allEpisodes.map( episode =>
              EpisodesService.shareEpisode(req.app.get('db'), renameKey(episode, 'uid', 'shared_by_uid'))
            )

          }
        
        next()
      }, 
      async (req, res, next) => {
        let transporter = nodemailer.createTransport({
          host: "email-smtp.us-west-2.amazonaws.com",
          port: 587,
          secure: false, // upgrade later with STARTTLS
          auth: {
            user: "AKIASMVSHIUPXED27Y7D",
            pass: "BG4YsM50oV0hyzMl3Wyh1R54JUGxggsbphtJHCEIXqOf"
          }
        });

        transporter.verify(function(error, success) {
          console.log('transporter verify running')
          if (error) {
            console.log(error);
          } else {
            console.log("Server is ready to take our messages");
          }
        });

        let info = await transporter.sendMail({
          from: '"Writual" <notifications@writualapp.com>', // sender address
          to: req.params.email, // list of receivers
          subject: "New Writual Project Shared with You", // Subject line
          text: req.params.message, // plain text body
          html: "<b>Hello world?</b>" // html body
        });

        console.log("Message sent: %s", info.messageId);
        next()
      },
      (req, res, next) => {
        ScenesService.shareScenes(req.app.get('db'), req.uid, req.params.project_id, res.locals.sharedUID)
        next()
      },
      (req, res, next) => {
        CharactersService.shareCharacters(req.app.get('db'), req.uid, req.params.project_id, res.locals.sharedUID)
        res.status(200).send()
      
    })
        
      
      
  
  usersRouter
    .route('/users/user/:user')
    .get((req, res, next) => {
      const { user } = req.params
      console.log(`user in users router ${user}`)
      UserService.getUsers(req.app.get('db'), user)
        .then(users => {
          res.json(users)
        })
        .catch(next)
    })

  usersRouter
    .route('/users/:userid')
    .delete((req, res, next) => {
        const { userid } = req.params
        UserService.deleteuser(req.app.get('db'), userid)
          .then(numRowsAffected => {
            logger.info(`user with id ${userid} delted`)
            res.status(204).send()
          })
          .catch(next)
      })

  usersRouter
    .route('/message/iconurl/:sender_uid')
    .get((req, res, next) => {
        //console.log(`message icon_url route accessed`)
        const { sender_uid } = req.params
        UserService.getMessageIconUrl(req.app.get('db'), sender_uid)
            .then(url => {
              //console.log(`getMessageIcon response url: ${JSON.stringify(url)}`)
              res.json(url)
            })
            .catch(next)
    })

  module.exports = usersRouter
