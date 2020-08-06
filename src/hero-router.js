const express = require('express')
const xss = require('xss')
const logger = require('./logger')

const HeroService = require('./hero-service');
const heroRouter = express.Router();
const bodyParser = express.json();

heroRouter
  .route('/hero/:act')
  .get((req, res, next) => {
    const act = req.params
    HeroService.getAllHeroStepsByAct(req.app.get('db'), act)
      .then(herosteps => {
        //console.log('herosteps', herosteps)
        res.json(herosteps)
      })
      .catch(next)
  })

module.exports = heroRouter
