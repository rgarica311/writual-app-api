const express = require('express')
const xss = require('xss')
const logger = require('./logger')
const bodyParser = express.json();
const EpisodesService = require('./episodes-service');
const episodesRouter = express.Router();

const serializeEpisode = episode => ({
  uid: episode.uid,
  show_title: xss(episode.show_title),
  project_id: episode.project_id,
  episode_title: xss(episode.episode_title),
  author: xss(episode.author),
  logline: xss(episode.logline),
  genre: episode.genre,
  projformat: episode.projformat,
  budget: xss(episode.budget),
  timeperiod: xss(episode.timeperiod),
  similarepisodes: xss(episode.similarepisodes),
  framework: episode.framework,
  bottle_episode: episode.bottle_episode,
  shared: episode.shared,
  visible: episode.visible,
  show_hidden: episode.show_hidden
})

const serializeUpdatedEpisode = episode => ({
  episode_title: xss(episode.title),
  author: xss(episode.author),
  logline: xss(pepisode.logline),
  genre: episode.genre,
  projformat: episode.projformat,
  budget: xss(episode.budget),
  timeperiod: xss(episode.timeperiod),
  similarepisodes: xss(episode.similarepisodes),
})

episodesRouter 
    .route('/episodes')
    .get((req, res, next) => {
        const { uid } = req
        const { title } = req.params
        EpisodesService.getEpisodes(req.app.get('db'), uid, title)
            .then(episodes => {
                res.json(episodes)
            })
            .catch(next)
    })

episodesRouter
    .route('/episodes')
    .post(bodyParser, (req, res, next) => {
        for(const field of ['show_title', 'episode_title', 'author', 'logline', 'genre', 'projformat', 'budget', 'timeperiod', 'similarepisodes', 'framework', 'bottle_episode']) {
          if(!req.body[field]) {
              return res.status(400).send(`${field} is required`)
          } 
        }
        const { show_title, project_id, episode_title, author, logline, genre, projformat, budget, timeperiod, similarepisodes, framework, bottle_episode, shared, visible, show_hidden } = req.body
        const uid = req.uid
       
        const newEpisode = { uid, show_title, project_id, episode_title, author, logline, genre, projformat, budget, timeperiod, similarepisodes, framework, bottle_episode, shared, visible, show_hidden }
        EpisodesService.addEpisode(req.app.get('db'), serializeEpisode(newEpisode))
        .then(episode => {
            res.status(201)
            .json(episode)
        })
        .catch(next)
    })

episodesRouter
  .route('/episodes')
  .put(bodyParser, (req, res, next) => {
    console.log(`req.body: ${JSON.stringify(req.body)}`)

    EpisodesService.updateEpisode(req.app.get('db'), serializeUpdatedEpisode(req.body), req.body.uni_id )
      .then(project => {
        res.status(201)
        .json(project)
      })
      .catch(next)
  })

episodesRouter
    .route('/episodes/:episodeid')
    .delete((req, res, next) => {
        const { episodeid } = req.params
        EpisodesService.deleteEpisode(req.app.get('db'), episodeid)
          .then(numRowsAffected => {
            res.status(204).send()
          })
          .catch(next)
    })

  episodesRouter
    .route('/episodes/hide/:show/:episode')
    .put((req, res, next) => {
      const { show, episode } = req.params
      const { uid } = req
      
      EpisodesService.getHiddenEpisodes(req.app.get('db'), uid)
        .then(episodes => {
          if(episodes.length < 1){
            EpisodesService.showHiddenEpisodes(req.app.get('db'), uid, false)
              .then(numRowsAffected => {
                res.status(204).send()
              })
          }
        })

      EpisodesService.hideEpisode(req.app.get('db'), show, episode, uid)
        .then(numRowsAffected => {
          res.status(204).send()
        })
      
    })
  

  episodesRouter
    .route('/episodes/unhide/:show/:episode')
    .put((req, res, next) => {
      const { show, episode } = req.params
      const { uid } = req
      EpisodesService.unHideEpisode(req.app.get('db'), show, episode, uid)
        .then(numRowsAffected => {
          EpisodesService.getHiddenEpisodes(req.app.get('db'), uid)
            .then(episodes => {
              if(episodes.length < 1){
                EpisodesService.showHiddenEpisodes(req.app.get('db'), uid, false)
                  .then(numRowsAffected => {
                    res.status(204).send()
                  })
              }
            })
          res.status(204).send()
        })
    })

  

  

  

episodesRouter
    .route('/episodes/showhidden/:showhiddenmode')
    .put((req, res, next) => {
      const { uid } = req
      const { showhiddenmode } = req.params
      EpisodesService.showHiddenEpisodes(req.app.get('db'), uid, showhiddenmode)
        .then(numRowsAffected => {
          res.status(204).send()
        })
    })



    module.exports = episodesRouter