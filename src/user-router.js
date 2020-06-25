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
    .route('/verify/user/:email/proj/:projname/:projformat/:message/:titles/:permission')
    .get((req, res, next) => {
      const { email, projname, projformat, message, titles, permission } = req.params
      console.log(`titles in users router ${typeof titles}`)
      
      const uid  = req.uid
      let episodeTitles =  null
      if(titles !== 'null') {
        console.log('titles should not be null', titles)
        episodeTitles = titles.split(',')
      }
      console.log(`episodeTitles in users router ${episodeTitles}`)

      console.log(`email in users router ${email}, projname ${projname}`)
      if(email === 'rory.garcia1@gmail.com' || email === 'filmfan311@gmail.com' || email === 'rory@skylineandmanor.com') {
        UserService.verifyUserExists(req.app.get('db'), email)
        .then(user => {
          console.log(`debug sharing: user after verify ${JSON.stringify(user)}`)
          const response = JSON.stringify(user)
          console.log(`user[0].uid: ${user[0].uid}`)
          if(user[0].uid !== undefined && user[0].uid !== uid) {
            const sharedUID = user[0].uid 
            ProjectsService.getProjectToShare(req.app.get('db'), uid, projname)
              .then(projectToShare => {
                ProjectsService.setShared(req.app.get('db'), uid, projname)
                  .then(row => console.log(`row: ${JSON.stringify(row)}`))
                console.log(`projectToShare ${JSON.stringify(projectToShare)}`)
                if(projectToShare) {
                  console.log(`if projectToShare ${JSON.stringify(projectToShare)}`)
                  projectToShare[0].visible = true
                  projectToShare[0].shared_by_uid = uid
                  projectToShare[0].shared_with_uid = sharedUID
                  projectToShare[0].permission = permission
                  console.log(`projectToShare modified: ${JSON.stringify(projectToShare)}`)

                  SharedProjectsService.shareProject(req.app.get('db'), projectToShare )
                      .then(async sharedProj => {
                        console.log(`sharedProj in then of shareProject: ${sharedProj}`)
                        if(sharedProj) {
                          if(episodeTitles !== null) {
                              console.log('episodeTitles[0] should not be null:', episodeTitles[0])
                              
                              episodeTitles.map(ep => 
                                EpisodesService.getEpisodeToShare(req.app.get('db'), uid, ep)
                                  .then(episodeToShare => {
                                    if(episodeToShare){
                                      episodeToShare[0].visible = true
                                      episodeToShare[0].shared_by_uid = uid
                                      episodeToShare[0].shared_with_uid = sharedUID

                                      EpisodesService.shareEpisode(req.app.get('db'), episodeToShare)
                                        .then(ep => {console.log('shared ep', ep)})
                                    }
                                  })
                                
                              )
                            }
                            
                           else if(episodeTitles === null && projformat === 'Television') {
                              console.log('episode titles length:', episodeTitles)
                              const clone = (obj) => Object.assign({}, obj);

                              const renameKey = (object, key, newKey) => {
                                const clonedObj = clone(object)
                                const targetKey = clonedObj[key]
                                delete clonedObj[key]
                                clonedObj[newKey] = targetKey
                                clonedObj.visible = true
                                clonedObj.show_hidden = false
                                clonedObj.shared_by_uid = uid
                                clonedObj.shared_with_uid = sharedUID
                                console.log(`clonedObj: ${JSON.stringify(clonedObj)}`)
                                return clonedObj
                              }
                              EpisodesService.getAllEpisodes(req.app.get('db'), uid, projname)
                                .then(allEpisodes => {
                                  console.log(`allEpisodes: ${allEpisodes}`)
                                  allEpisodes.map(episode => 
                                    
                                    EpisodesService.shareEpisode(req.app.get('db'), renameKey(episode, 'uid', 'shared_by_uid'))
                                      .then(ep => {
                                          console.log(`shared ep from sharing all episodes: ${ep}`)
                                      })
                                  )
                                })
                          }
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
                            to: email, // list of receivers
                            subject: "New Writual Project Shared with You", // Subject line
                            text: message, // plain text body
                            html: "<b>Hello world?</b>" // html body
                          });

                          console.log("Message sent: %s", info.messageId);
                        }
                      })
                      
                } 
                else {
                  console.log(`else projectToShare ${JSON.stringify(projectToShare)}`)

                }
              })

            ScenesService.shareScenes(req.app.get('db'), uid, projname, sharedUID)
                  .then(sharedScenes => {
                    res.json(sharedScenes)
                  })
                  .catch(next)
            CharactersService.shareCharacters(req.app.get('db'), uid, projname, sharedUID)
              .then(sharedCharacters => {
                //res.json(sharedCharacters)
              })
              .catch(next)

            console.log(`uid in verify user exists: ${sharedUID}`)
          } else {
              console.log('send notification email')
              res.send(`Project Cannot be shared, double check email address.`)
          }
        })
        .catch(next)
      }
      
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
