const express = require('express')
const xss = require('xss')
const logger = require('./logger')

const ProjectsService = require('./projects-service');
const projectsRouter = express.Router();
const bodyParser = express.json();

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

projectsRouter
  .route('/projects')
  .post(bodyParser, (req, res, next) => {
    console.log('req.body', req.body)
    for(const field of ['user_id', 'title', 'author', 'logline', 'genre', 'projformat', 'budget', 'timeperiod', 'similarprojects']) {

      if(!req.body[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send(`${field} is required`)
      } 
  
    }
    const { user_id, title, author, logline, genre, projformat, budget, timeperiod, similarprojects } = req.body
    const newProj = { user_id, title, author, logline, genre, projformat, budget, timeperiod, similarprojects }
    console.log('newProj in router', newProj)
    ProjectsService.addProject(req.app.get('db'), newProj)
      .then(project => {
        console.log('project', project)
        console.log(`Project created with id ${project.id}`)
        res.status(201)
        .json(serializeProject(project))
      })
      .catch(next)
  })

  projectsRouter
    .route('/projects/user/:user')
    .get((req, res, next) => {
      const { user } = req.params
      console.log(`user in projects router ${user}`)
      ProjectsService.getUserProjects(req.app.get('db'), user)
        .then(projects => {
          res.json(projects)
        })
        .catch(next)
    })

  projectsRouter
    .route('/projects/:projectid')
    .delete((req, res, next) => {
        const { projectid } = req.params
        ProjectsService.deleteProject(req.app.get('db'), projectid)
          .then(numRowsAffected => {
            logger.info(`Project with id ${projectid} delted`)
            res.status(204).send()
          })
          .catch(next)
      })

  module.exports = projectsRouter
