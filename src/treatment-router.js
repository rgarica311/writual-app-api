  
const express = require('express')
const bodyParser = express.json()
const treatmentsRouter = express()
const TreatmentService = require('./treatment-service')

treatmentsRouter
    .route('/treatments')
    .post(bodyParser, (req, res, next) => {
        const updatedTreatment = req.body
        TreatmentService.getTreatment(req.app.get('db'), updatedTreatment.project_id, updatedTreatment.episode_id)
            .then(async treatment => {
                let response = await treatment
                if(response.length > 0) {
                    TreatmentService.updateTreatment(req.app.get('db'), updatedTreatment.project_id, updatedTreatment.episode_id, updatedTreatment.treatment)
                        .then(numRowsAffected => {
                            res.status(204).send
                        })
                } else {
                    TreatmentService.postTreatment(req.app.get('db'), updatedTreatment)
                        .then(treatment => {
                            res.status(201)
                            .json(treatment)
                        })
                        .catch(next)
                }
            })
            .catch(next)

    })

treatmentsRouter
    .route('/treatments/:proj_id/:episode_id')
    .get((req, res, next) => {
        const {proj_id, episode_id} = req.params
        TreatmentService.getTreatment(req.app.get('db'), proj_id, episode_id)
            .then(treatment => {
                res.json(treatment)
            })
            .catch(next)

    })

module.exports = treatmentsRouter