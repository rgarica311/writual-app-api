require('dotenv').config()
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
const { AWS_PASS, AWS_USER } = require('./config')


const serializeuser = user => ({
  user_id: xss(user.user_id),
  user_name: xss(user.user_name),
  email: xss(user.logline),
  photo_url: user.genre,
})




usersRouter
  .route('/users')
  .post(bodyParser, (req, res, next) => {
    for(const field of ['user_name', 'email', 'photo_url']) {

      if(!req.body[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send(`${field} is required`)
      } 
  
    } 
    const { user_name, email, photo_url } = req.body
    const uid = req.uid
    const loggedInUser = { uid, user_name, email, photo_url }
    try {
      UserService.getUsers(req.app.get('db'))
        .then(users => {
          if(users.some(user => user.uid === loggedInUser.uid) === true){
          } else {
            UserService.addUser(req.app.get('db'), loggedInUser)
              .then(user => {
                 
                res.status(201)
                .json(serializeuser(user))
                })
                .catch(next)
          }
        })
        .catch(next)

    } catch(e){
       console.error('error getting users', e)
    }
    
  })

  usersRouter
    .route('/verify/user/:email/proj/:project_id/:projformat/:message/:permission')
    .get( async (req, res, next) => {
       req.connection.setTimeout( 20000 )
      const { email, project_id, projformat, message, permission } = req.params
      const { titles } = req.query
      
      const uid  = req.uid
      
      let user

      const approvedEmails = [
              "rory.garcia1@gmail.com",
              "filmfan311@gmail.com",
              "rory@skylineandmanor.com",
              "rory@rorydane.com",
              "austin.adams04@gmail.com",
              "marcuscharlesmusic@gmail.com",
              "margeauxdupuy@gmail.com",
              "sdawkins2292@gmail.com",
              "johnnyattero@gmail.com",
              "kevincobarrubia@gmail.com",
              "ntschrader@gmail.com",
              "nick@skylineandmanor.com",
              "mox@skylineandmanor.com",
              "j.michael.holder@gmail.com",
              "ncastronuova@gmail.com",
              "erickd7@gmail.com",
              "ditomontiel@gmail.com",
              "andrewsfray70@gmail.com",
              "michael.cumberbatch@gmail.com", 
              "erick@erickd.com",
            ]
      
      if(approvedEmails.includes(email)) {
        try {
          res.locals.userExists = await UserService.verifyUserExists(req.app.get('db'), email)
        } catch(err) {
          console.error(`error veryifying user: ${err}`)
        }
        if(res.locals.userExists){
          next()
        } else {
            res.send('User does not exist')
        }
        
      } else {
         res.send('User does not exist')
      }
    },
      async (req, res, next) => {
        let user = res.locals.userExists
        if(user[0].uid !== undefined && user[0].uid !== req.uid) {
          res.locals.sharedUID = user[0].uid 
          res.locals.projectToShare = await ProjectsService.getProjectToShare(req.app.get('db'), req.uid, req.params.project_id)
          next()
        }
      },
      (req, res, next) => {
        
        
        ProjectsService.setShared(req.app.get('db'), req.uid, req.params.project_id)
          .then(response => {
            //console.log(`debug share project set shared STEP 3: res ${response}`)
          })
        
        
        next()
      },
      async (req, res, next) => {
        let { projectToShare, sharedUID } = res.locals
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
        
        res.locals.episodeTitles = req.query.titles

        if(res.locals.episodeTitles[0] !== 'null') {
          if(res.locals.episodeTitles.length > 0) {
            res.locals.episodeTitles.map(ep => 
              EpisodesService.getEpisodeToShare(req.app.get('db'), req.uid, ep)
                .then(async episodeToShare => {
                  if(episodeToShare){
                    
                    let project_id = episodeToShare[0].project_id
                    let result = await EpisodesService.getPermission(req.app.get('db'), project_id)
                    let permission = result[0].permission
                    

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
                        clonedObj.permission = req.params.permission
                        return clonedObj
                    }
                    let episode = renameKey(episodeToShare[0], 'uni_id', 'id')
                     
                    EpisodesService.shareEpisode(req.app.get('db'), episode)
                      .then(ep => {
                         //console.log('shared ep', ep)
                      })
                    
                    EpisodesService.setShared(req.app.get('db'), req.uid, episode.id)
                      .then(ep => {
                         //console.log(`set shared on episdeos`, ep)
                      })
                  }
                })
              
            )
          }
          
        } else if(req.params.projformat === 'Television') {
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
                return clonedObj
            }

            let allEpisodes = await EpisodesService.getAllEpisodes(req.app.get('db'), req.uid, req.params.project_id)
            counter = 0
            allEpisodes.map( async episode => {
              
              res.locals.shared = false
              let project_id = episode.project_id
              let result
              let permission
              try {
                result = await EpisodesService.getPermission(req.app.get('db'), project_id)
                permission = result[0].permission
              } catch (err) {
                 console.error(`error getting permissions: ${err}`)
              }
              
              episode = renameKey(episode, 'uni_id', 'id')
              episode.permission = req.params.permission
              delete episode.shared
              EpisodesService.shareEpisode(req.app.get('db'), renameKey(episode, 'uid', 'shared_by_uid'), counter++)
              EpisodesService.setShared(req.app.get('db'), req.uid, episode.id)
                      .then(ep => {/*console.log(`set shared on episdeos`, ep)*/})
            }) 

            
              
          }
        
        next()
      }, 
      async (req, res, next) => {
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
           console.log('transporter verify running')
          if (error) {
             console.error('error sending email', error);
          } else {
             console.log("Server is ready to take our messages");
          }
        });

        let info = await transporter.sendMail({
          from: '"Writual" <notifications@writualapp.com>',   //sender address
          to: req.params.email,   //list of receivers
          subject: "New Writual Project Shared with You",   //Subject line
          text: req.params.message,   //plain text body
          //html: "<b>Hello world?</b>"   //html body
        });

        next()
      },
      (req, res, next) => {
        if(res.locals.episodeTitles.length > 0) {
          res.locals.episodeTitles.map(title => {
            try {
              ScenesService.shareScenes(req.app.get('db'), req.uid, req.params.project_id, res.locals.sharedUID, req.params.projformat, title)
                .then(rows => {
                   //console.log(`rows updated: ${rows}`)
                })
              
            } catch (err) {
                console.error(`error sharing scenes: ${err}`)
            }

            try {
              CharactersService.shareCharacters(req.app.get('db'), req.uid, req.params.project_id, res.locals.sharedUID, title)
                .then(rows => {
                   //console.log(`rows updated: ${rows}`)
                })
              res.status(200).send()
            } catch (err) {
                console.error(`error sharing characters: ${err}`)
            }

          })
        } else {
          next()
        }
        
        
        
      },
      (req, res, next) => {
        try {
          ScenesService.shareScenes(req.app.get('db'), req.uid, req.params.project_id, res.locals.sharedUID, req.params.projformat, title)
            .then(rows => {
               //console.log(`rows updated: ${rows}`)
            })
          
        } catch (err) {
            console.error(`error sharing scenes: ${err}`)
        }
        try {
          CharactersService.shareCharacters(req.app.get('db'), req.uid, req.params.project_id, res.locals.sharedUID)
            .then(rows => {
               //console.log(`rows updated: ${rows}`)
            })
          res.status(200).send()
        } catch (err) {
          console.error(`error sharing characters: ${err}`)
        }
        
    })
        
      
      
  
  usersRouter
    .route('/users/user/:user')
    .get((req, res, next) => {
      const { user } = req.params
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
            res.status(204).send()
          })
          .catch(next)
      })

  usersRouter
    .route('/message/iconurl/:sender_uid')
    .get((req, res, next) => {
        const { sender_uid } = req.params
        UserService.getMessageIconUrl(req.app.get('db'), sender_uid)
            .then(url => {
              res.json(url)
            })
            .catch(next)
    })

  module.exports = usersRouter
