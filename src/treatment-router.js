const express = require('express')
const bodyParser = express.json()
const treatmentsRouter = express()
const TreatmentService = require('./treatment-service')

treatmentsRouter
    .route('/treatments')
    .post(bodyParser, (req, res, next) => {
        console.log(`treatment router accessed`)
        const updatedTreatment = req.body
        console.log(`updatedTreatment ${updatedTreatment}`)
        TreatmentService.getTreatment(req.app.get('db'), updatedTreatment.project_id)
            .then(async treatment => {
                let response = await treatment
                if(response) {
                    console.log(`treatment existing then ${response}`)
                    TreatmentService.updateTreatment(req.app.get('db'), updatedTreatment.project_id, updatedTreatment.treatment)
                        .then(numRowsAffected => {
                            console.log(`put complete numRowsAffected ${JSON.stringify(numRowsAffected)}`)
                            res.status(204).send
                        })
                } else {
                    console.log(`treatment existing else triggered`)
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
    .route('/treatments/:proj_id')
    .get((req, res, next) => {
        console.log(`details details router accessed params: ${req.params}`)
        const {proj_id} = req.params
        TreatmentService.getTreatment(req.app.get('db'), proj_id)
            .then(treatment => {
                res.json(treatment)
            })
            .catch(next)

    })

module.exports = treatmentsRouter