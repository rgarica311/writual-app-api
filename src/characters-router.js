const express = require('express')
const xss = require('xss')
const logger = require('./logger')

const CharactersService = require('./characters-service');
const charactersRouter = express.Router();
const bodyParser = express.json();

const serializeCharacter = character => ({
  id: character.id,
  user_id: character.user_id,
  project_name: character.project_name,
  name: xss(character.name),
  age: xss(character.age),
  gender: xss(character.gender),
  details: character.details,

})

charactersRouter
  .route('/characters')
  .get((req, res, next) => {
    CharactersService.getAllCharacters(req.app.get('db'))
      .then(characters => {
        res.json(characters)
      })
      .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    console.log('req.body', req.body)
    for(const field of ['user_id', 'project_name', 'name', 'age', 'gender', 'details']) {

      if(!req.body[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send(`${field} is required`)
      } 
  
    }
    const { user_id, project_name, name, age, gender, details } = req.body
    const newChar = { user_id, project_name, name, age, gender, details }
    console.log('newChar in router', newChar)
    CharactersService.addCharacter(req.app.get('db'), newChar)
      .then(character => {
        res.status(201)
        .json(serializeCharacter(character))
      })
      .catch(next)
  })

  charactersRouter
    .route('/characters/:proj/user/:userId')
    .all((req, res, next) => {
      const { proj, userId } = req.params
      console.log(`proj in characters router ${proj} userId ${userId}`)
      CharactersService.getProjectCharacters(req.app.get('db'), proj, userId)
        .then(characters => {
          if(!characters) {
            console.log(`Character for project ${project} not found`)
            return res.status(404).json({
              error:{message: 'Character not found' }
            })
          }
          res.characters = characters
          next()
        })
        .catch(next)
    })
    .get((req, res) => {
      res.json(res.characters)
    })

  charactersRouter
    .route('/characters/:characterid')
    .delete((req, res, next) => {
        const { characterid } = req.params
        console.log('character id in router', characterid)
        CharactersService.deleteCharacter(req.app.get('db'), characterid)
          .then(numRowsAffected => {
            logger.info(`Character with id ${characterid} delted`)
            res.status(204).send()
          })
          .catch(next)
      })

  module.exports = charactersRouter
