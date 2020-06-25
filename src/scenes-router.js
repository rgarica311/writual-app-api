const express = require('express')
const xss = require('xss')
const logger = require('./logger')

const ScenesService = require('./scenes-service');
const scenesRouter = express.Router();
const bodyParser = express.json();

const serializeScene = scene => ({ 
  uid: xss(scene.uid), 
  project_name: xss(scene.project_name), 
  project_id: scene.project_id,
  act: xss(scene.act), 
  step_name: xss(scene.step_name),
  scene_heading: xss(scene.scene_heading), 
  thesis: xss(scene.thesis), 
  antithesis: xss(scene.antithesis), 
  synthesis: xss(scene.synthesis), 
  shared: scene.shared
})

scenesRouter
  .route('/scenes/:proj')
  .get((req, res, next) => {
    try {
      const { proj } = req.params
      const { uid } = req.uid
      console.log('req.uid in scenes .get', req.uid)
      ScenesService.getProjectScenes(req.app.get('db'), proj, req.uid)
        .then(scene => {
          if(!scene) {
            console.log(`Scene for project ${scene} not found`)
            return res.status(404).json({
              error:{message: 'Scene not found' }
            })
          }
          res.json(scene)
        })
        .catch(next)
    } catch(e) {
      console.log('error in scenes get:', e)
    }
      
  })
  
  .post(bodyParser, (req, res, next) => {
    console.log('req.body scenes post route', req.uid)
    for(const field of ['project_name', 'act', 'step_name', 'scene_heading', 'thesis', 'antithesis', 'synthesis']) {
      if(!req.body[field]) {
        console.log(`${field} is required`)
        return res.status(400).send(`${field} is required`)
      } 
    }
    const uid = req.uid
    const { project_name, project_id, act, step_name, scene_heading, thesis, antithesis, synthesis, shared } = req.body
    const newScene = { uid, project_name, project_id, act, step_name, scene_heading, thesis, antithesis, synthesis, shared }
    console.log('newScene in router', newScene)
    console.log('newScene serialized in router', serializeScene(newScene))
    ScenesService.addScene(req.app.get('db'), serializeScene(newScene))
      .then(scene => {
        console.log('scene', scene)
        console.log(`Scene created with id ${scene.id}`)
        res.status(201)
        .json(scene)
      })
      .catch(next)
  })

  scenesRouter
  .route('/shared/scenes/:proj')
  .get((req, res, next) => {
    const { uid } = req
    const { proj } = req.params
    console.log('shared router accessed')
    ScenesService.getSharedScenes(req.app.get('db'), uid, proj)
      .then(sharedProjects => {
        console.log('sharedProjects', JSON.stringify(sharedProjects))
        res.json(sharedProjects)
      })
      .catch(next)
  })

  scenesRouter
  .route('/scenes/:proj_name/:current_act/:current_step/:search_term')
  .get((req, res, next) => {
    const { uid } = req
    const { proj_name, current_act, current_step, search_term } = req.params
    console.log(`scene search router req.params: ${JSON.stringify(req.params)}`)
    ScenesService.searchScenes(req.app.get('db'), uid, proj_name, current_act, current_step, search_term)
      .then(scenes => {
        console.log(`search results: ${JSON.stringify(scenes.rows)}`)
        res.json(scenes.rows)
      })
      .catch(next)
  })



  scenesRouter
    .route('/scenes/:sceneId')
    .delete((req, res, next) => {
        const { sceneId } = req.params
        const { uid } = req
        console.log(`delete route  sceneid ${sceneId}, uid ${uid}`)
        ScenesService.deleteScene(req.app.get('db'), sceneId, uid)
          .then(numRowsAffected => {
            //logger.info(`Scene with id ${sceneId} delted`)
            res.status(204).send()
          })
          .catch(next)
    })

  module.exports = scenesRouter
