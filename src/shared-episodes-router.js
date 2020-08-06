const express = require('express')
const xss = require('xss')
const logger = require('./logger')
const bodyParser = express.json();
const SharedEpisodesService = require('./shared-episodes-service');
const sharedEpisodesRouter = express.Router();

sharedEpisodesRouter 
    .route('/shared/episodes')
    .get((req, res, next) => {
        const { uid } = req
        const { title } = req.params
        //console.log('get episodes router running')
        SharedEpisodesService.getSharedEpisodes(req.app.get('db'), uid)
            .then(episodes => {
                //console.log(`shared episodes: ${JSON.stringify(episodes)}`)
                res.json(episodes)
            })
            .catch(next)
    })

sharedEpisodesRouter
    .route('/shared/episodes/unhide/:show/:episode')
    .put((req, res, next) => {
      const { show, episode } = req.params
      const { uid } = req
      //console.log(`debug hide/show unhide shared runnning: episode: ${show}, uid: ${uid}`)
      SharedEpisodesService.unHideSharedEpisode(req.app.get('db'), show, episode, uid)
        .then(numRowsAffected => {
          SharedEpisodesService.getHiddenSharedEpisodes(req.app.get('db'), uid)
            .then(episodes => {
              //console.log(`episodes.length in getHidden for unhide: ${episodes.length}`)
              if(episodes.length < 1){
                SharedEpisodesService.showHiddenSharedEpisodes(req.app.get('db'), uid, false)
                  .then(numRowsAffected => {
                    res.status(204).send()
                  })
              }
            })
          res.status(204).send()
        })
    })

sharedEpisodesRouter
    .route('/shared/episodes/hide/:show/:episode')
    .put((req, res, next) => {
      const { show, episode } = req.params
      const { uid } = req
      
      

      SharedEpisodesService.hideSharedEpisode(req.app.get('db'), show, episode, uid)
        .then(numRowsAffected => {
            //console.log(`hideShared ran numRowsAffected: ${JSON.stringify(numRowsAffected)}`)
            res.status(204).send()
        })
      
    })

sharedEpisodesRouter
    .route('/shared/episodes/showhidden/:showhiddenmode')
    .put((req, res, next) => {
      const { uid } = req
      const { showhiddenmode } = req.params
      SharedEpisodesService.showHiddenSharedEpisodes(req.app.get('db'), uid, showhiddenmode)
        .then(numRowsAffected => {
          res.status(204).send()
        })
    })

module.exports = sharedEpisodesRouter
