const express = require('express')

const router = express.Router()
const validator = require('../../validators/validator')

const { permissions } = require('./paper.permission')
const controller = require('./paper.controller')
const schema = require('./paper.schema')

const joiConfig = require('../../config/joiConfig')

router.route(permissions.getPaperById.path).get(
    validator.validateRouteParameters(schema.getPaperById),
    controller.getPaperById
)

router.route(permissions.getPapers.path).get(
    validator.validateQueryParameters(
        schema.getPapers(joiConfig.maxRecords)
    ),
    controller.getPapers
)

router.route(permissions.createPaper.path).post(
    validator.validateBody(schema.createPaper),
    controller.createPaper
)

router.route(permissions.updatePaper.path).put(
    validator.validateBody(schema.updatePaper),
    controller.updatePaper
)

router.route(permissions.togglePaper.path).put(
    validator.validateRouteParameters(schema.togglePaper),
    controller.togglePaper
)

router.route(permissions.deletePaper.path).delete(
    validator.validateRouteParameters(schema.deletePaper),
    controller.deletePaper
)



module.exports = router
