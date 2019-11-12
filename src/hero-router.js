const express = require('express')
const xss = require('xss')
const logger = require('./logger')

const HeroService = require('./hero-service');
const heroRouter = express.Router();
const bodyParser = express.json();

heroRouter
  .route('/hero')
  .get((req, res, next) => {
    HeroService.getAllHeroSteps(req.app.get('db'))
      .then(herosteps => {
        res.json(herosteps)
      })
      .catch(next)
  })

module.exports = heroRouter
