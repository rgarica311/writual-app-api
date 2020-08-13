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

console.log(`amazon credentials: user ${AWS_USER} pass: ${AWS_PASS}`)
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
    res.locals.loggedInEmail = email
    try {
      UserService.getUsers(req.app.get('db'))
        .then(users => {
          if(users.some(user => user.uid === loggedInUser.uid) === true){
          } else {
            UserService.addUser(req.app.get('db'), loggedInUser)
              .then(user => {
                next()
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
    
  }, async (req, res, next) => {
      try {
        res.locals.sharedProjects = await SharedProjectsService.getSharedProjectsByEmail(req.app.get('db'), res.locals.loggedInEmail)
        res.locals.sharedEpisodes = await SharedEpisodesService.getSharedEpisodesByEmail(req.app.get('db'), res.locals.loggedInEmail)
        res.locals.sharedCharacters = await CharactersService.getSharedCharactersByEmail(req.app.get('db'), res.locals.loggedInEmail)
        res.locals.sharedScenes = await ScenesService.getSharedScenesByEmail(req.app.get('db'), res.locals.loggedInEmail)

        console.log(`debug sharing sharedPrpojects: ${JSON.stringify(res.locals.sharedProjects)} sharedEpisodes: ${JSON.stringify(res.locals.sharedEpisodes)}`)
        console.log(`debug sharing sharedChar ${res.locals.sharedCharacters} shareScenes ${res.locals.sharedScenes}`)
        if(res.locals.sharedProjects || res.locals.sharedEpisodes) {
          next()
        }

      } catch(error) {
        console.error('error checking for sharedProjects / sharedEpisodes', error)
      }
  }, async(req, res, next) => {
    if(res.locals.sharedProjects) {
      console.log(`debug sharing: SharedProjectsService.addUid should run`)
      try {  
        //change this to get projformat and if television check for has episodes and run addUID accordingly
        SharedProjectsService.addUid(req.app.get('db'), req.uid, res.locals.loggedInEmail).then()
        res.locals.sharedProjects.map(proj => {
          if(proj.projformat === 'Television') {
            if(res.locals.sharedEpisodes) {
              try {
                SharedEpisodesService.addUid(req.app.get('db'), req.uid, res.locals.loggedInEmail).then()
              } catch (error) {
                console.error('error adding uid to episode', error)
              }
            }

          }
        })
      } catch(error) {
        console.error('error adding uid to project', error)
      }
    } else {
      console.log(`debug sharing: SharedEpisodesService.addUid should run`)
      try {
        SharedEpisodesService.addUid(req.app.get('db'), req.uid, res.locals.loggedInEmail).then()
      } catch (error) {
        console.error('error adding uid to episode', error)
      }
    }

    if(res.locals.sharedCharacters) {
      try {
        console.log(`debug sharing: CharactersService.addUid should run`)
        CharactersService.addUid(req.app.get('db'), req.uid, res.locals.loggedInEmail).then()
      } catch(error) {
        console.error(`error adding uid to characters ${error}`)
      }
    } else if(res.locals.sharedScenes) {
      console.log(`debug sharing: ScenesService.addUid should run`)
      try {
        ScenesService.addUid(req.app.get('db'), req.uid, res.locals.loggedInEmail).then()
      } catch(error) {
        console.error(`error adding uid to scenes ${error}`)
      }
    }
  })

  usersRouter
    .route('/verify/user/:email/proj/:project_id/:projformat/:message/:permission')
    .get( async (req, res, next) => {
      req.connection.setTimeout( 20000 )
      const { email, project_id, projformat, message, permission } = req.params

      console.log(`debug sharing message: ${message}`)
      const { titles } = req.query
      
      const uid  = req.uid
      
      try {
        res.locals.userExists = await UserService.verifyUserExists(req.app.get('db'), email)
        let sharee = await UserService.getDisplayName(req.app.get('db'), req.uid)
        res.locals.sharee = sharee.user_name
        console.log(`debug sharing res.locals.userExists: ${res.locals.userExists.length}`)
        console.log(`sharee ${JSON.stringify(res.locals.sharee)}`)
      } catch(err) {
        console.error(`error veryifying user: ${err}`)
      }
      next()
      
        
      
    },
      async (req, res, next) => {
        if(res.locals.userExists.length > 0) {
          let user = res.locals.userExists
          if(user[0].uid !== undefined && user[0].uid !== req.uid) {
            res.locals.sharedUID = user[0].uid 
          } 
        }
        
        res.locals.projectToShare = await ProjectsService.getProjectToShare(req.app.get('db'), req.uid, req.params.project_id)

        
        next()
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
        console.log(`debug sharing projectToShare: ${JSON.stringify(projectToShare)}`)
        if(projectToShare !== undefined) {
          if(projectToShare.length > 0) {
            res.locals.projectName = projectToShare[0].title
            projectToShare[0].visible = true
            projectToShare[0].shared_by_uid = req.uid
            if(sharedUID !== undefined) {
              console.log(`debug sharing: sharedUID: ${sharedUID}`)
              projectToShare[0].shared_with_uid = sharedUID
            } else {
              projectToShare[0].shared_with_email = req.params.email
            }
            projectToShare[0].permission = req.params.permission
            res.locals.sharedProj = await SharedProjectsService.shareProject(req.app.get('db'), projectToShare)
            next()
          }
          
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
                        if(res.locals.sharedUID !== undefined) {
                          clonedObj.shared_with_uid = res.locals.sharedUID
                        } else {
                          clonedObj.shared_with_email = req.params.email
                        }
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
                if(res.locals.sharedUID !== undefined){
                  clonedObj.shared_with_uid = res.locals.sharedUID
                } else {
                  clonedObj.shared_with_email = req.params.email
                }
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
      /*async (req, res, next) => {
        let transporter
        try {
          transporter = nodemailer.createTransport({
            host: "email-smtp.us-east-2.amazonaws.com",
            port: 587,
            secure: false,   //upgrade later with STARTTLS
            auth: {
              user: AWS_USER,
              pass: AWS_PASS
            }
          });
          console.log(`aws pass ${AWS_PASS} user ${AWS_USER}`)
        } catch (error) {
          console.error(`error creating transport ${error}`)
        }
        

        transporter.verify(function(error, success) {
           console.log('transporter verify running')
          if (error) {
             console.error('error sending email', error);
          } else {
             console.log("Server is ready to take our messages");
          }
        });

        try {
          console.log(`email config to: ${req.params.email} text: ${req.params.message}`)
          
        } catch (error) {
          console.error(`error sending mail: ${error}`)
        }
        next()
      },*/
      (req, res, next) => {
        if(res.locals.episodeTitles.length > 0) {
          res.locals.episodeTitles.map(title => {
            console.log(`req.uid in episodes middleware ${req.uid}`)
            if(res.locals.sharedUID) {
              try {
              
                ScenesService.shareScenes(req.app.get('db'), req.uid, req.params.project_id, res.locals.sharedUID, req.params.projformat, title)
                  .then(rows => {
                    //console.log(`rows updated: ${rows}`)
                  })
              
              } catch (err) {
                  console.error(`error sharing scenes: ${err}`)
              }

              try {
                CharactersService.shareCharacters(req.app.get('db'), req.uid, req.params.project_id, res.locals.sharedUID, req.params.projformat, title)
                  .then(rows => {
                    //console.log(`rows updated: ${rows}`)
                  })
                res.status(200).send()
              } catch (err) {
                  console.error(`error sharing characters: ${err}`)
              }

            } else {

                try {
              
                  ScenesService.shareScenesByEmail(req.app.get('db'), req.uid, req.params.email, req.params.project_id, req.params.projformat, title)
                    .then(rows => {
                      //console.log(`rows updated: ${rows}`)
                    })
                
                } catch (err) {
                    console.error(`error sharing scenes: ${err}`)
                }

                try {
                  CharactersService.shareCharactersByEmail(req.app.get('db'), req.uid, req.params.email, req.params.project_id, title)
                    .then(rows => {
                      //console.log(`rows updated: ${rows}`)
                    })
                  res.status(200).send()
                } catch (err) {
                    console.error(`error sharing characters: ${err}`)
                }

              }
            
          })
        } else {
          next()
        }
        
        
        
      },
      (req, res, next) => {
        //alter these tables to accept sha
        if(res.locals.sharedUID) {
          console.log(`req.uid in projects midware ${req.uid}`)
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
        } else {
            try {
              ScenesService.shareScenesByEmail(req.app.get('db'), req.uid, req.params.email, req.params.project_id, req.params.projformat, title)
                .then(rows => {
                  //console.log(`rows updated: ${rows}`)
                })
            
            } catch (err) {
                console.error(`error sharing scenes: ${err}`)
            }

            try {
              CharactersService.shareCharactersByEmail(req.app.get('db'), req.uid, req.params.email, req.params.project_id, title)
                .then(rows => {
                  //console.log(`rows updated: ${rows}`)
                })
              res.status(200).send()
            } catch (err) {
                console.error(`error sharing characters: ${err}`)
            }
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
