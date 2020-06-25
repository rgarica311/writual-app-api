const express = require('express')
const bodyParser = express.json()
const detailsRouter = express()
const DetailsService = require('./details-service')

detailsRouter
    .route('/details/:detail/:character/:proj')
    .get((req, res, next) => {
        console.log(`details details router accessed params: ${req.params}`)
        const {detail, character, proj} = req.params
        DetailsService.getDetail(req.app.get('db'), detail, character, proj)
            .then(detail => {
                res.json(detail)
            })
            .catch(next)

    })

detailsRouter
    .route('/details/existing/:detail/:character/:proj')
    .post(bodyParser, (req, res, next) => {
        console.log(`details details router accessed params: ${req.params}`)
        const {detail, character, proj} = req.params
        const newDetail = req.body
        console.log(`newDetail: ${newDetail}`)
        DetailsService.getDetail(req.app.get('db'), detail, character, proj)
            .then(async details => {
                let response = await details
                if(response) {
                    console.log(`detail in getDetail existing then ${response}`)
                    DetailsService.updateDetail(req.app.get('db'), detail, character, proj, newDetail[detail.toLowerCase()])
                        .then(numRowsAffected => {
                            console.log(`put complete numRowsAffected ${JSON.stringify(numRowsAffected)}`)
                            res.status(204).send
                        })
                } else {
                    console.log(`detail existing else triggered`)
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
    .route('/details/:detail/:character/:proj')
    .put(bodyParser, (req, res, next) => {
        const {detail, character, proj} = req.params
        let raw  = req.body
        console.log(`details update route raw: ${raw}`)
        console.log(`details update route typeof raw: ${typeof raw}`)
        console.log(`details update route raw keys: ${Object.keys(raw)}`)
        console.log(`details update route json stringify raw: ${JSON.stringify(raw)}`)
        //console.log(`details update route json parse raw: ${JSON.parse(raw)}`)

        DetailsService.updateDetail(req.app.get('db'), detail, character, proj, raw)
            .then(numRowsAffected => {
                console.log(`put complete numRowsAffected ${JSON.stringify(numRowsAffected)}`)
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