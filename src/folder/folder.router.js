const express = require('express')

const router = express.Router()
const validator = require('../../validators/validator')

const { permissions } = require('./folder.permission')
const controller = require('./folder.controller')
const schema = require('./folder.schema')

const joiConfig = require('../../config/joiConfig')

router.route(permissions.getFolderById.path).get(
    validator.validateRouteParameters(schema.getFolderById),
    controller.getFolderById
)

router.route(permissions.getFolders.path).get(
    validator.validateQueryParameters(
        schema.getFolders(joiConfig.maxRecords)
    ),
    controller.getFolders
)

router.route(permissions.createFolder.path).post(
    validator.validateBody(schema.createFolder),
    controller.createFolder
)

router.route(permissions.updateFolder.path).put(
    validator.validateBody(schema.updateFolder),
    controller.updateFolder
)

router.route(permissions.toggleFolder.path).put(
    validator.validateRouteParameters(schema.toggleFolder),
    controller.toggleFolder
)

router.route(permissions.deleteFolder.path).delete(
    validator.validateRouteParameters(schema.deleteFolder),
    controller.deleteFolder
)



module.exports = router
