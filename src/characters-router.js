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
  shared: character.shared

})

charactersRouter
  .route('/characters')
  .post(bodyParser, (req, res, next) => {
    console.log('req.body', req.body)
    for(const field of ['project_name', 'name', 'age', 'gender', 'details']) {

      if(!req.body[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send(`${field} is required`)
      } 
  
    }
    const uid = req.uid
    const { project_name, project_id, name, age, gender, details, shared } = req.body
    const newChar = { uid, project_name, project_id, name, age, gender, details, shared }
    console.log('newChar in router', newChar)
    CharactersService.addCharacter(req.app.get('db'), newChar)
      .then(character => {
        res.status(201)
        .json(serializeCharacter(character))
      })
      .catch(next)
  })

  charactersRouter
    .route('/characters/:proj')
    .get((req, res, next) => {
      try {
        const { proj } = req.params
        CharactersService.getProjectCharacters(req.app.get('db'), proj, req.uid)
          .then(characters => {
            if(!characters) {
              console.log(`Character for project ${project} not found`)
              return res.status(404).json({
                error:{message: 'Character not found' }
              })
            }
            res.json(characters)
          })
          .catch(next)
      } catch(e) {
        console.log('error in characters router', e)
      }
      
    })

  charactersRouter
    .route('/shared/characters/:proj')
    .get((req, res, next) => {
      const { uid } = req
      const { proj } = req.params
      console.log('shared characters router accessed')
      console.log(`proj in shared characters router: ${proj}`)
      console.log(`JSON.stringify(proj) in shared characters router: ${JSON.stringify(proj)}`)

      CharactersService.getSharedCharacters(req.app.get('db'), uid, proj)
        .then(sharedCharacters => {
          console.log('sharedCharacters', JSON.stringify(sharedCharacters))
          res.json(sharedCharacters)
        })
        .catch(next)
  })
    

  charactersRouter
    .route('/characters/:characterId')
    .delete((req, res, next) => {
        const { characterId } = req.params
        console.log('character id in router', characterId)
        CharactersService.deleteCharacter(req.app.get('db'), characterId, req.uid)
          .then(numRowsAffected => {
            logger.info(`Character with id ${characterId} deleted`)
            res.status(204).send()
          })
          .catch(next)
      })

  module.exports = charactersRouter
