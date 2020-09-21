  
const express = require('express')
const bodyParser = express.json()
const treatmentsRouter = express()
const TreatmentService = require('./treatment-service')

treatmentsRouter
    .route('/treatments')
    .post(bodyParser, (req, res, next) => {
        const updatedTreatment = req.body
        const blocks = updatedTreatment.treatment.blocks
        blocks.map(block => {
            if(block.text.includes("'")) {
                let index = blocks.indexOf(block)
                updatedTreatment.treatment.blocks[index].text = updatedTreatment.treatment.blocks[index].text.replace("'", "''")
            }
        })

        TreatmentService.getTreatment(req.app.get('db'), updatedTreatment.project_id, updatedTreatment.episode_id)
            .then(async treatment => {
                let response = await treatment
                if(response.length > 0) {
                    console.log('updatedTreatment before update', JSON.stringify(updatedTreatment))
                    TreatmentService.updateTreatment(req.app.get('db'), updatedTreatment.project_id, updatedTreatment.episode_id, updatedTreatment.treatment)
                        .then(numRowsAffected => {
                            res.status(204).send
                        })
                } else {
                    console.log('updatedTreatment before post', JSON.stringify(updatedTreatment))
                    try {
                        console.log('updatedTreatment before post', JSON.stringify(updatedTreatment))
                        TreatmentService.postTreatment(req.app.get('db'), updatedTreatment)
                            .then(treatment => {
                                console.log(`res: ${res}`)
                                res.status(201)
                                .json(treatment)
                            })
                            .catch(next)
                    } catch (err) {
                        console.log(`error posting treatment: ${error}`)
                    }
                    
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