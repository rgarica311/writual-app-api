const express = require('express')
const xss = require('xss')
const logger = require('./logger')

const CatService = require('./cat-service');
const catRouter = express.Router();
const bodyParser = express.json();

catRouter
  .route('/cat/:act')
  .get((req, res, next) => {
    const act = req.params
    CatService.getAllCatSteps(req.app.get('db'), act)
      .then(catsteps => {
        res.json(catsteps)
      })
      .catch(next)
  })

module.exports = catRouter
