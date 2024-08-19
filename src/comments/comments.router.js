const express = require('express')

const router = express.Router()
const validator = require('../../validators/validator')

const {permissions} = require('./comments.permission')
const controller = require('./comments.controller')
const schema = require('./comments.schema')

const joiConfig = require('../../config/joiConfig')

router.route(permissions.getCommentById.path).get(
    validator.validateRouteParameters(schema.getCommentById),
    controller.getCommentById
)

router.route(permissions.getComments.path).get(
    validator.validateQueryParameters(
        schema.getComments(joiConfig.maxRecords)
    ),
    controller.getComments
)

router.route(permissions.createComment.path).post(
    validator.validateBody(schema.createComment),
    controller.createComment
)

router.route(permissions.updateComment.path).put(
    validator.validateBody(schema.updateComment),
    controller.updateComment
)

router.route(permissions.deleteComment.path).delete(
    validator.validateRouteParameters(schema.deleteComment),
    controller.deleteComment
)

module.exports = router