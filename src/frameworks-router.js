const express = require('express')
const xss = require('xss')
const logger = require('./logger')

const FrameworksService = require('./frameworks-service');
const frameworksRouter = express.Router();
const bodyParser = express.json();

frameworksRouter
  .route('/frameworks')
  .get((req, res, next) => {
    FrameworksService.getAllFrameworks(req.app.get('db'))
      .then(frameworks => {
        res.json(frameworks)
      })
      .catch(next)
  })

  module.exports = frameworksRouter
