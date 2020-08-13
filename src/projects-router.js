const express = require('express')
const xss = require('xss')
const logger = require('./logger')
const bodyParser = express.json();
const ProjectsService = require('./projects-service');
const ScenesService = require('./scenes-service');
const CharactersService = require('./characters-service');
const projectsRouter = express.Router();
const admin = require('firebase-admin');


const serializeProject = project => ({
  uid: project.uid,
  title: xss(project.title),
  author: xss(project.author),
  logline: xss(project.logline),
  genre: project.genre,
  projformat: project.projformat,
  budget: xss(project.budget),
  timeperiod: xss(project.timeperiod),
  similarprojects: xss(project.similarprojects),
  framework: project.framework,
  visible: project.visible,
  show_hidden: project.show_hidden
})

projectsRouter
  .route('/projects')
  .post(bodyParser, (req, res, next) => {
    for(const field of ['title', 'author', 'logline', 'genre', 'projformat', 'budget', 'timeperiod', 'similarprojects', 'framework']) {
      if(!req.body[field]) {
        return res.status(400).send(`${field} is required`)
      } 
    }
    const { title, author, logline, genre, projformat, budget, timeperiod, similarprojects, framework } = req.body
    const uid = req.uid
    const visible = true
    const show_hidden = false
    const newProj = { uid, title, author, logline, genre, projformat, budget, timeperiod, similarprojects, framework, visible, show_hidden }
    //const serialized = serializeProject(newProj)
    //console.log('serialized newProj in router', serialized)
    
    ProjectsService.addProject(req.app.get('db'), serializeProject(newProj))
      .then(project => {
        res.status(201)
        .json(project)
      })
      .catch(next)
        
})



projectsRouter
  .route('/projects')
  .get((req, res, next) => {
 
    let sess = req.session
    const { uid } = req
    ProjectsService.getUserProjects(req.app.get('db'), uid)
      .then(projects => {
        res.json(projects)
      })
      .catch(next)
  })

projectsRouter
  .route('/projects/iconurls/:project_id/:shared/:episode')
  .get((req, res, next) => {
    const { project_id, shared, episode } = req.params
    const { uid } = req
    const photoUrls = []
    const sharedWith = []
    const sharedBy = []
    let ids
    
    try {
      ProjectsService.getSharedWithUids(req.app.get('db'), req.uid, project_id, shared, episode)
        .then(sharedWithUids => {
          console.log(`getIconUrls: sharedWithUids: ${JSON.stringify(sharedWithUids)}`)
          sharedWithUids.map(obj => {
            if(obj.shared_with_uid !== undefined) {
                sharedWith.push(obj.shared_with_uid)
            } else {
                sharedBy.push(obj.shared_by_uid)
            }
          })
          
          if(sharedWith.length > 0) {
            ids = sharedWith
          } else {
              ids = sharedBy
          }
          ProjectsService.getUrls(req.app.get('db'), ids)
            .then(photoUrl => {
              console.log(`getIconUrls: photoUrl: ${photoUrl}`)
              res.json(photoUrl)
            })
        
          //res.json(sharedWithUids)
          
        })
        .catch(next)

    } catch (error) {
      console.error(`error getting icon url ${error}`)
    }
    
    

  })

  projectsRouter
    .route('/projects/:projectid')
    .delete((req, res, next) => {
        const { projectid } = req.params
        ProjectsService.deleteProject(req.app.get('db'), projectid)
          .then(numRowsAffected => {
            res.status(204).send()
          })
          .catch(next)
    })

  projectsRouter
    .route('/projects/hide/:proj')
    .put((req, res, next) => {
      const { proj } = req.params
      const { uid } = req
      
      ProjectsService.getHiddenProjects(req.app.get('db'), uid)
        .then(projects => {
          if(projects.length < 1){
            ProjectsService.showHiddenProjects(req.app.get('db'), uid, false)
              .then(numRowsAffected => {
                res.json(numRowsAffected)
              })
          }
        })

      ProjectsService.hideProject(req.app.get('db'), proj, uid)
        .then(numRowsAffected => {
          res.status(204).send()
        })
      
    })

  projectsRouter
    .route('/projects/unhide/:proj')
    .put((req, res, next) => {
      const { proj } = req.params
      const { uid } = req
      ProjectsService.unHideProject(req.app.get('db'), proj, uid)
        .then(numRowsAffected => {
          ProjectsService.getHiddenProjects(req.app.get('db'), uid)
            .then(projects => {
              if(projects.length < 1){
                ProjectsService.showHiddenProjects(req.app.get('db'), uid, false)
                  .then(numRowsAffected => {
                    res.status(204).send()
                  })
              }
            })
          res.status(204).send()
        })
    })

  projectsRouter
    .route('/projects/showhidden/:showhiddenmode')
    .put((req, res, next) => {
      const { uid } = req
      const { showhiddenmode } = req.params
      ProjectsService.showHiddenProjects(req.app.get('db'), uid, showhiddenmode)
        .then(numRowsAffected => {
          res.status(204).send()
        })
    })

  projectsRouter
    .route('/projects/show/:proj')
    .put((req, res, next) => {
      const { proj } = req.params
      const { uid } = req
      ProjectsService.showProject(req.app.get('db'), proj, uid)
        .then(numRowsAffected => {
          res.status(204).send()
        })
    })

  module.exports = projectsRouter
