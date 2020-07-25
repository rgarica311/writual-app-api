const express = require('express')
const xss = require('xss')
const logger = require('./logger')

const CharactersService = require('./characters-service');
const charactersRouter = express.Router();
const bodyParser = express.json();

const serializeCharacter = character => ({
  id: character.id,
  project_name: character.project_name,
  uid: character.uid,
  project_id: character.project_id,
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
    let { project_name, project_id, episode_id, name, age, gender, details, uid, shared } = req.body
    if(uid === null) {
      uid = req.uid
    }
    CharactersService.getAllShared(req.app.get('db'), project_id, episode_id)
      .then(arrays => {
        if(arrays.rows.length >0) {
          arrays.rows[0].shared.map(uid => {
            if(shared.includes(uid) !== true) {
              shared.push(uid)
            }
          })
        }
        const newChar = { uid, project_name, project_id, name, age, gender, details, shared }
        console.log('newChar in router', newChar)
        CharactersService.addCharacter(req.app.get('db'), serializeCharacter(newChar))
          .then(character => {
            res.status(201)
            .json(character)
          })
          .catch(next)
      })
      .catch(next)
  
  })

  charactersRouter
    .route('/characters/:project_id')
    .get((req, res, next) => {
      try {
        const { project_id } = req.params
        CharactersService.getProjectCharacters(req.app.get('db'), project_id, req.uid)
          .then(characters => {
            if(!characters) {
              console.log(`Character for project ${project_id} not found`)
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
    .route('/shared/characters/:project_id')
    .get((req, res, next) => {
      const { uid } = req
      const { project_id } = req.params
      console.log('shared characters router accessed project_id', project_id)
      CharactersService.getSharedCharacters(req.app.get('db'), uid, project_id)
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
