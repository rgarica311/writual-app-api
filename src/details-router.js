const express = require('express')
const bodyParser = express.json()
const detailsRouter = express()
const DetailsService = require('./details-service')

detailsRouter
    .route('/details/:detail/:character/:project_id')
    .get((req, res, next) => {
        const {detail, character, project_id} = req.params
        DetailsService.getDetail(req.app.get('db'), detail, character, project_id)
            .then(detail => {
                res.json(detail)
            })
            .catch(next)

    })

detailsRouter
    .route('/details/existing/:detail/:character/:project_id')
    .post(bodyParser, (req, res, next) => {
        const {detail, character, project_id} = req.params
        const newDetail = req.body
        DetailsService.getDetail(req.app.get('db'), detail, character, project_id)
            .then(async details => {
                let response = await details
                if(response) {
                    DetailsService.updateDetail(req.app.get('db'), detail, character, project_id, newDetail[detail.toLowerCase()])
                        .then(numRowsAffected => {
                            res.status(204).send
                        })
                } else {
                    DetailsService.postDetail(req.app.get('db'), newDetail)
                        .then(detail => {
                            res.status(201)
                            .json(detail)
                        })
                        .catch(next)
                }
            })
            .catch(next)

    })



detailsRouter
    .route('/details/:detail/:character/:proj_id')
    .put(bodyParser, (req, res, next) => {
        const {detail, character, proj_id} = req.params
        let raw  = req.body
        

        DetailsService.updateDetail(req.app.get('db'), detail, character, proj_id, raw)
            .then(numRowsAffected => {
                res.status(204).send
            })
    })

detailsRouter
    .route('/details')
    .post(bodyParser, (req, res, next) => {
        let newDetail = req.body
        
        DetailsService.postDetail(req.app.get('db'), newDetail)
            .then(detail => {
                res.status(201)
                .json(detail)
            })
            .catch(next)
    })

    

module.exports = detailsRouter