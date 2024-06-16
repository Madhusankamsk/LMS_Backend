const express = require('express')

const router = express.Router()
const validator = require('../../validators/validator')
const joiConfig = require('../../config/joiConfig')

const { permissions } = require('./category.permission')
const controller = require('./category.controller')
const schema = require('./category.schema')

router.route(permissions.getCategoryById.path).get(
    validator.validateRouteParameters(schema.getCategoryById),
    controller.getCategoryById
)

router.route(permissions.getCategories.path).get(
    validator.validateQueryParameters(
        schema.getCategories(joiConfig.maxRecords)
    ),
    controller.getCategories
)

router.route(permissions.createCategory.path).post(
    validator.validateBody(schema.createCategory),
    controller.createCategory
)

router.route(permissions.updateCategory.path).put(
    validator.validateBody(schema.updateCategory),
    controller.updateCategory
)

router.route(permissions.toggleCategory.path).put(
    validator.validateRouteParameters(schema.toggleCategory),
    controller.toggleCategory
)

router.route(permissions.deleteCategory.path).delete(
    validator.validateRouteParameters(schema.deleteCategory),
    controller.deleteCategory
)

module.exports = router