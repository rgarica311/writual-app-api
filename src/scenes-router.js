const express = require('express')
const xss = require('xss')
const logger = require('./logger')

const ScenesService = require('./scenes-service');
const scenesRouter = express.Router();
const bodyParser = express.json();

scenesRouter
  .route('/scenes')
  .get((req, res, next) => {
    ScenesService.getAllScenes(req.app.get('db'))
      .then(scene => {
        res.json(scene)
      })
      .catch(next)
  })

  scenesRouter
    .route('/scenes/:proj/user/:userId')
    .all((req, res, next) => {
      const { proj, userId } = req.params
      ScenesService.getProjectScenes(req.app.get('db'), proj, userId)
        .then(scene => {
          if(!scene) {
            console.log(`Scene for project ${scene} not found`)
            return res.status(404).json({
              error:{message: 'Scene not found' }
            })
          }
          res.scene = scene
          next()
        })
        .catch(next)
    })
    .get((req, res) => {
      res.json(res.scene)
    })

  module.exports = scenesRouter
