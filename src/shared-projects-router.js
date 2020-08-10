const express = require('express')
const xss = require('xss')
const logger = require('./logger')
const bodyParser = express.json();
const SharedProjectsService = require('./shared-projects-service');
const sharedProjectsRouter = express.Router();

const serializeProject = project => ({
  id: project.id,
  title: xss(project.title),
  author: xss(project.author),
  logline: xss(project.logline),
  genre: project.genre,
  projformat: project.projformat,
  budget: xss(project.budget),
  timeperiod: xss(project.timeperiod),
  similarprojects: xss(project.similarprojects)
})

sharedProjectsRouter
    .route('/shared/projects')
    .get((req, res, next) => {
        const { uid } = req
        SharedProjectsService.getSharedProjects(req.app.get('db'), uid)
            .then(sharedProjects => {
                res.json(sharedProjects)
            })
            .catch(next)
    })

sharedProjectsRouter
    .route('/shared/projects/hide/:proj')
    .put((req, res, next) => {
      const { proj } = req.params
      const { uid } = req

      SharedProjectsService.getHiddenSharedProjects(req.app.get('db'), uid)
        .then(projects => {
          if(projects.length < 1) {
            SharedProjectsService.showHiddenSharedProjects(req.app.get('db'), uid, false)
              .then(numRowsAffected => {
                res.status(204).send()
              })
          }
        })

      SharedProjectsService.hideSharedProject(req.app.get('db'), proj, uid)
        .then(numRowsAffected => {
          res.status(204).send()
        })
    })

sharedProjectsRouter
    .route('/shared/projects/unhide/:proj')
    .put((req, res, next) => {
      const { proj } = req.params
      const { uid } = req
      SharedProjectsService.unHideSharedProject(req.app.get('db'), proj, uid)
        .then(numRowsAffected => {
          SharedProjectsService.getHiddenSharedProjects(req.app.get('db'), uid)
            .then(projects => {
              if(projects.length < 1){
                SharedProjectsService.showHiddenSharedProjects(req.app.get('db'), uid, false)
                  .then(numRowsAffected => {
                    res.status(204).send()
                  })
              }
            })
          res.status(204).send()
        })
    })

sharedProjectsRouter
    .route('/shared/projects/showhidden/:showhiddenmode')
    .put((req, res, next) => {
      const { uid } = req
      const { showhiddenmode } = req.params
      SharedProjectsService.showHiddenSharedProjects(req.app.get('db'), uid, showhiddenmode)
        .then(numRowsAffected => {
          res.status(204).send()
        })
    })

sharedProjectsRouter
    .route('/shared/projects/show/:proj')
    .put((req, res, next) => {
      const { proj } = req.params
      const { uid } = req
      SharedProjectsService.showSharedProject(req.app.get('db'), proj, uid)
        .then(numRowsAffected => {
          res.status(204).send()
        })
    })

module.exports = sharedProjectsRouter


