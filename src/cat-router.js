const express = require('express')
const xss = require('xss')
const logger = require('./logger')

const CatService = require('./cat-service');
const catRouter = express.Router();
const bodyParser = express.json();

catRouter
  .route('/cat')
  .get((req, res, next) => {
    CatService.getAllCatSteps(req.app.get('db'))
      .then(catsteps => {
        res.json(catsteps)
      })
      .catch(next)
  })

module.exports = catRouter
