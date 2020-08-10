const express = require('express')
const bodyParser = express.json()
const feedbackRouter = express()
const FeedbackService = require('./feedback-service')

feedbackRouter
    .route('/feedback')
    .post(bodyParser, (req, res, next) => {
        const updatedFeedback = req.body
        FeedbackService.getFeedback(req.app.get('db'), updatedFeedback.project_id, updatedFeedback.episode_id, updatedFeedback.reviewer)
            .then(async feedback => {
                let response = await feedback
                if(response.length > 0) {
                    FeedbackService.updateFeedback(req.app.get('db'), updatedFeedback.reviewer, updatedFeedback.project_id, updatedFeedback.episode_id, updatedFeedback.feedback)
                        .then(numRowsAffected => {
                            res.status(204).send
                        })
                } else {
                    FeedbackService.postFeedback(req.app.get('db'), updatedFeedback)
                        .then(feedback => {
                            res.status(201)
                            .json(feedback)
                        })
                        .catch(next)
                }
            })
            .catch(next)

    })

feedbackRouter
    .route('/feedback/:proj_id/:episode_id/:reviewer/:shared')
    .get((req, res, next) => {
        const {proj_id, episode_id, reviewer, shared} = req.params
        if(shared === 'false') {
            FeedbackService.getUserFeedback(req.app.get('db'), proj_id, episode_id)
                .then(feedback => {
                    res.json(feedback)
                })
                .catch(next)
        } else {
            FeedbackService.getFeedback(req.app.get('db'), proj_id, episode_id, reviewer)
                .then(feedback => {
                    res.json(feedback)
                })
                .catch(next)
        }
        

    })

module.exports = feedbackRouter