const express = require('express')
const bodyParser = express.json()
const detailsRouter = express()
const DetailsService = require('./details-service')

detailsRouter
    .route('/details/:detail/:character/:project_id')
    .get((req, res, next) => {
        //console.log(`details details router accessed params: ${JSON.stringify(req.params)}`)
        const {detail, character, project_id} = req.params
        DetailsService.getDetail(req.app.get('db'), detail, character, project_id)
            .then(detail => {
                //console.log(`detail: ${JSON.stringify(detail)}`)
                res.json(detail)
            })
            .catch(next)

    })

detailsRouter
    .route('/details/existing/:detail/:character/:project_id')
    .post(bodyParser, (req, res, next) => {
        //console.log(`details details router accessed params: ${JSON.stringify(req.params)}`)
        const {detail, character, project_id} = req.params
        const newDetail = req.body
        //console.log(`newDetail: ${newDetail}`)
        DetailsService.getDetail(req.app.get('db'), detail, character, project_id)
            .then(async details => {
                let response = await details
                if(response) {
                    //console.log(`detail in getDetail existing then ${response}`)
                    DetailsService.updateDetail(req.app.get('db'), detail, character, project_id, newDetail[detail.toLowerCase()])
                        .then(numRowsAffected => {
                            //console.log(`put complete numRowsAffected ${JSON.stringify(numRowsAffected)}`)
                            res.status(204).send
                        })
                } else {
                    //console.log(`detail existing else triggered`)
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
        //console.log(`details update route raw: ${raw}`)
        //console.log(`details update route typeof raw: ${typeof raw}`)
        //console.log(`details update route raw keys: ${Object.keys(raw)}`)
        //console.log(`details update route json stringify raw: ${JSON.stringify(raw)}`)
        //console.log(`details update route json parse raw: ${JSON.parse(raw)}`)

        DetailsService.updateDetail(req.app.get('db'), detail, character, proj_id, raw)
            .then(numRowsAffected => {
                //console.log(`put complete numRowsAffected ${JSON.stringify(numRowsAffected)}`)
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