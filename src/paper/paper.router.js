const express = require('express')

const router = express.Router()
const validator = require('../../validators/validator')

const { permissions } = require('./paper.permission')
const controller = require('./paper.controller')
const schema = require('./paper.schema')

const joiConfig = require('../../config/joiConfig')

router.route(permissions.createPaper.path).post(
    //validator.validateHeader(),
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
//jvgokdsgjkaojg
router.route(permissions.updatePaper.path).put(
    //validator.validateHeader(),
    // validator.validateRouteAccessByRoleMultiple([
    //     {
    //         baseRoute: '/user_roles',
    //         action: 'edit',
    //     },
    //     {
    //         baseRoute: '/admin_roles',
    //         action: 'edit',
    //     },
    // ]),
    validator.validateBody(schema.updatePaper),
    controller.updatePaper
)

//For delete
// router.route(permissions.toggleBlock.path).post(
//     validator.validateHeader(),
//     // validator.validateRouteAccessByRoleMultiple([
//     //     {
//     //         baseRoute: '/user_roles',
//     //         action: 'block',
//     //     },
//     //     {
//     //         baseRoute: '/admin_roles',
//     //         action: 'block',
//     //     },
//     // ]),
//     validator.validateBody(schema.toggleBlock),
//     controller.toggleBlock
// )

// router.route(permissions.getPaperAll.path).get(
//     validator.validateHeader(),
//     validator.validateQueryParameters(
//         joiConfig.userRolesPaginationSchema(joiConfig.maxRecords)
//     ),
//     controller.getPaperAll
// )

// router.route(permissions.getPaperById.path).get(
//     validator.validateHeader(),
//     controller.getPaperById
// )

module.exports = router
