const express = require('express')

const router = express.Router()
const validator = require('../../validators/validator')

const { permissions } = require('./paper.permission')
const controller = require('./paper.controller')
const schema = require('./paper.schema')

const joiConfig = require('../../config/joiConfig')

router.route(permissions.createPaper.path).post(
    // validator.validateHeader(),
    // validator.validateRouteAccessByRoleMultiple([
    //     {
    //         baseRoute: '/user_roles',
    //         action: 'add',
    //     },
    //     {
    //         baseRoute: '/admin_roles',
    //         action: 'add',
    //     },
    // ]),
    validator.validateBody(schema.createPaper),
    controller.createPaper
)

router.route(permissions.userRoleUpdate.path).put(
    validator.validateHeader(),
    validator.validateRouteAccessByRoleMultiple([
        {
            baseRoute: '/user_roles',
            action: 'edit',
        },
        {
            baseRoute: '/admin_roles',
            action: 'edit',
        },
    ]),
    validator.validateBody(schema.updateRole),
    controller.userRoleUpdate
)

router.route(permissions.toggleBlock.path).post(
    validator.validateHeader(),
    validator.validateRouteAccessByRoleMultiple([
        {
            baseRoute: '/user_roles',
            action: 'block',
        },
        {
            baseRoute: '/admin_roles',
            action: 'block',
        },
    ]),
    validator.validateBody(schema.toggleBlock),
    controller.toggleBlock
)

router.route(permissions.userRoleGetAll.path).get(
    validator.validateHeader(),
    validator.validateQueryParameters(
        joiConfig.userRolesPaginationSchema(joiConfig.maxRecords)
    ),
    controller.getUserRoles
)

router.route(permissions.userRoleGetById.path).get(
    validator.validateHeader(),
    controller.getUserRolesById
)

module.exports = router
