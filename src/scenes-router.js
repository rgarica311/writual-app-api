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
  .route('/scenes/:project_id/:is_episode')
  .get((req, res, next) => {
    try {
      const { project_id, is_episode } = req.params
      let isEpisode
      console.log(`type of isEpisode: ${typeof is_episode} isEpisode: ${is_episode}`)
      if(is_episode === 'undefined'){
        isEpisode = false
      } else if (is_episode === 'true') {
        isEpisode = true
      } else if (is_episode === 'false') {
        isEpisode = false
      }
      ScenesService.getProjectScenes(req.app.get('db'), project_id, req.uid, isEpisode)
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
    
    let { project_name, project_id, episode_id, act, step_name, scene_heading, thesis, antithesis, synthesis, uid, shared } = req.body
    if(uid === null) {
      uid = req.uid
      console.log(`sharee: uid in in if: ${uid}`)
    } 
    console.log(`sharee: uid after if: ${uid}`)
    
    ScenesService.getAllShared(req.app.get('db'), project_id, episode_id)
      .then(arrays => {
        if(arrays.rows.length > 0) {
          console.log( `sharee arrays: ${JSON.stringify(arrays.rows[0].shared)}`)
          arrays.rows[0].shared.map(uid => {
            if(shared.includes(uid) !== true){
              shared.push(uid)
              console.log(`sharee shared after push: ${shared}`)
            }
          })
        }
        
        console.log(`sharee shared before newScene construction ${shared}`)
        const newScene = { uid, project_name, project_id, episode_id, act, step_name, scene_heading, thesis, antithesis, synthesis, shared }
        console.log('newScene in router', newScene)
        console.log('newScene serialized in router', serializeScene(newScene))
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
  .route('/shared/scenes/:project_id/:is_episode')
  .get((req, res, next) => {
    const { uid } = req
    const { project_id, is_episode } = req.params
    let isEpisode
    if(is_episode === 'true') {
      isEpisode = true
    } else { isEpisode = false }
    console.log(`project_id in router ${project_id}`)
    ScenesService.getSharedScenes(req.app.get('db'), uid, project_id, isEpisode)
      .then(sharedProjects => {
        console.log('sharedProjects', JSON.stringify(sharedProjects))
        res.json(sharedProjects)
      })
      .catch(next)
  })

  scenesRouter
  .route('/scenes/:project_id/:current_act/:current_step/:search_term')
  .get((req, res, next) => {
    const { uid } = req
    const { project_id, current_act, current_step, search_term } = req.params
    console.log(`scene search router req.params: ${JSON.stringify(req.params)}`)
    ScenesService.searchScenes(req.app.get('db'), uid, project_id, current_act, current_step, search_term)
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
