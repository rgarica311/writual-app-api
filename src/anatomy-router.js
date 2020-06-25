const express = require('express')
const xss = require('xss')
const logger = require('./logger')

const AnatomyService = require('./anatomy-service');
const anatomyRouter = express.Router();
const bodyParser = express.json();

anatomyRouter
  .route('/anatomy/:act')
  .get((req, res, next) => {
    const act = req.params
    AnatomyService.getAllAnatomySteps(req.app.get('db'), act)
      .then(anatomysteps => {
        res.json(anatomysteps)
      })
      .catch(next)
  })

module.exports = anatomyRouter
