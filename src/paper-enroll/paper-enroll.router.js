const express = require('express')

const router = express.Router()
const validator = require('../../validators/validator')

const { permissions } = require('./paper-enroll.permission')
const controller = require('./paper-enroll.controller')
const schema = require('./paper-enroll.schema')

const joiConfig = require('../../config/joiConfig')

router.route(permissions.getEnrollPaperById.path).get(
    validator.validateRouteParameters(schema.getEnrollPaperById),
    controller.getEnrollPaperById
)

router.route(permissions.getEnrollPapers.path).get(
    validator.validateQueryParameters(
        schema.getEnrollPapers(joiConfig.maxRecords)
    ),
    controller.getEnrollPapers
)

router.route(permissions.createEnrollPaper.path).post(
    validator.validateBody(schema.createEnrollPaper),
    controller.createEnrollPaper
)

router.route(permissions.updateEnrollPaper.path).put(
    validator.validateBody(schema.updateEnrollPaper),
    controller.updateEnrollPaper
)

router.route(permissions.deleteEnrollPaper.path).delete(
    validator.validateRouteParameters(schema.deleteEnrollPaper),
    controller.deleteEnrollPaper
)

module.exports = router
