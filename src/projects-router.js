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
    console.log('projects post router: req.body', req.body)
    console.log('projects post router: uid', req.uid)
    for(const field of ['title', 'author', 'logline', 'genre', 'projformat', 'budget', 'timeperiod', 'similarprojects', 'framework']) {
      if(!req.body[field]) {
        console.log(`${field} is required`)
        return res.status(400).send(`${field} is required`)
      } 
    }
    const { title, author, logline, genre, projformat, budget, timeperiod, similarprojects, framework } = req.body
    const uid = req.uid
    console.log('req.uid', req.uid)
    const visible = true
    const show_hidden = false
    const newProj = { uid, title, author, logline, genre, projformat, budget, timeperiod, similarprojects, framework, visible, show_hidden }
    //const serialized = serializeProject(newProj)
    //console.log('serialized newProj in router', serialized)
    
    ProjectsService.addProject(req.app.get('db'), serializeProject(newProj))
      .then(project => {
        console.log(`Project created with id ${project.id}`)
        res.status(201)
        .json(project)
      })
      .catch(next)
        
})



projectsRouter
  .route('/projects')
  .get((req, res, next) => {
    console.log('req.uid in router:', req.uid)
    let sess = req.session
    const { uid } = req
    console.log('uid in projects router get', uid)
    ProjectsService.getUserProjects(req.app.get('db'), uid)
      .then(projects => {
        console.log(`getUserProjects ran project ${JSON.stringify(projects)}`)

        res.json(projects)
      })
      .catch(next)
  })

projectsRouter
  .route('/projects/iconurls/:project_id/:shared/:episode')
  .get((req, res, next) => {
    const { project_id, shared, episode } = req.params
    //console.log(`getIconUrls router title ${title} shared: ${shared} type of shared: ${typeof shared}`)
    const { uid } = req
    const photoUrls = []
    const sharedWith = []
    const sharedBy = []
    let ids
    console.log('debug photourl: uid in projects router get', uid)
    //console.log('debug photourl: title in projects router get', title)

    ProjectsService.getSharedWithUids(req.app.get('db'), req.uid, project_id, shared, episode)
    .then(sharedWithUids => {
      console.log(`sharedWithUids: ${JSON.stringify(sharedWithUids)}`)
      sharedWithUids.map(obj => {
        console.log(`sharedwithid id: ${JSON.stringify(obj)}, id.shared_with_uid: ${obj.shared_with_uid} `)
        if(obj.shared_with_uid !== undefined) {
            console.log(`getSharedWithUids obj.shared_with_uid: ${obj.shared_with_uid}`)
            sharedWith.push(obj.shared_with_uid)
        } else {
            console.log(`getSharedWithUids obj.shared_by_uid: ${obj.shared_by_uid}`)
            sharedBy.push(obj.shared_by_uid)
        }
        console.log(`sharedWith.length: ${sharedWith.length}`)
      })
      console.log(`sharedWith if: ${sharedWith}`)
      
      if(sharedWith.length > 0) {
        console.log(`sharedWith ${sharedWith}`)
        ids = sharedWith
      } else {
          console.log(`sharedBy ${sharedBy}`)
          ids = sharedBy
      }
      console.log('getSharedWithUids ids:', ids)
      ProjectsService.test(req.app.get('db'), ids)
        .then(photoUrl => {
          console.log(`photoUrl: ${JSON.stringify(photoUrl)}`)
          res.json(photoUrl)
        })
     
      //res.json(sharedWithUids)
      
    })
    .catch(next)
    

  })

  projectsRouter
    .route('/projects/:projectid')
    .delete((req, res, next) => {
        const { projectid } = req.params
        ProjectsService.deleteProject(req.app.get('db'), projectid)
          .then(numRowsAffected => {
            console.log(`Project with id ${projectid} delted`)
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
      console.log(`debug hide/show: proj: ${proj}, uid: ${uid}`)
      ProjectsService.unHideProject(req.app.get('db'), proj, uid)
        .then(numRowsAffected => {
          ProjectsService.getHiddenProjects(req.app.get('db'), uid)
            .then(projects => {
              console.log(`projects.length in getHidden for unhide: ${projects.length}`)
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
