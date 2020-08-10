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
  episode_id: scene.episode_id,
  act: xss(scene.act), 
  step_name: xss(scene.step_name),
  scene_heading: xss(scene.scene_heading), 
  thesis: xss(scene.thesis), 
  antithesis: xss(scene.antithesis), 
  synthesis: xss(scene.synthesis), 
  shared: scene.shared
})

scenesRouter
  .route('/scenes/:project_id/:episode_id')
  .get((req, res, next) => {
    try {
      const { project_id, episode_id } = req.params      
      ScenesService.getProjectScenes(req.app.get('db'), project_id, req.uid, episode_id,)
        .then(scene => {
          if(!scene) {
            return res.status(404).json({
              error:{message: 'Scene not found' }
            })
          }
          res.json(scene)
        })
        .catch(next)
    } catch(e) {
      console.error('error in scenes get:', e)
    }
      
  })
  
  .post(bodyParser, (req, res, next) => {
    for(const field of ['project_name', 'act', 'step_name', 'scene_heading', 'thesis', 'antithesis', 'synthesis']) {
      if(!req.body[field]) {
        return res.status(400).send(`${field} is required`)
      } 
    }
    
    let { project_name, project_id, episode_id, act, step_name, scene_heading, thesis, antithesis, synthesis, uid, shared } = req.body
    if(uid === null) {
      uid = req.uid
    } 
    
    ScenesService.getAllShared(req.app.get('db'), project_id, episode_id)
      .then(arrays => {
        if(arrays.rows.length > 0) {
          arrays.rows[0].shared.map(uid => {
            if(shared.includes(uid) !== true){
              shared.push(uid)
            }
          })
        }
        
        const newScene = { uid, project_name, project_id, episode_id, act, step_name, scene_heading, thesis, antithesis, synthesis, shared }
        ScenesService.addScene(req.app.get('db'), serializeScene(newScene))
          .then(scene => {
            
            res.status(201)
            .json(scene)
          })
          .catch(next)
      })
      .catch(next)
        
  })

  scenesRouter
  .route('/shared/scenes/:project_id/:episode_id')
  .get((req, res, next) => {
    const { uid } = req
    const { project_id, episode_id } = req.params
    
    ScenesService.getSharedScenes(req.app.get('db'), uid, project_id, episode_id)
      .then(sharedProjects => {
        res.json(sharedProjects)
      })
      .catch(next)
  })

  scenesRouter
  .route('/scenes/:project_id/:current_act/:current_step/:search_term')
  .get((req, res, next) => {
    const { uid } = req
    const { project_id, current_act, current_step, search_term } = req.params
    ScenesService.searchScenes(req.app.get('db'), uid, project_id, current_act, current_step, search_term)
      .then(scenes => {
        res.json(scenes.rows)
      })
      .catch(next)
  })



  scenesRouter
    .route('/scenes/:sceneId')
    .delete((req, res, next) => {
        const { sceneId } = req.params
        const { uid } = req
        ScenesService.deleteScene(req.app.get('db'), sceneId, uid)
          .then(numRowsAffected => {
            //logger.info(`Scene with id ${sceneId} delted`)
            res.status(204).send()
          })
          .catch(next)
    })

  module.exports = scenesRouter
