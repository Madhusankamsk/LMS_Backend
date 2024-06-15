const express = require('express')

const router = express.Router()
const validator = require('../../validators/validator')

const { permissions } = require('./subject.permission')
const controller = require('./subject.controller')
const schema = require('./subject.schema')

const joiConfig = require('../../config/joiConfig')

router.route(permissions.getSubjectById.path).get(
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
    validator.validateRouteParameters(schema.getSubjectById),
    controller.getSubjectById
)

router.route(permissions.getSubjects.path).get(
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
    validator.validateBody(schema.getSubjects),
    controller.getSubjects
)

router.route(permissions.createSubject.path).post(
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
    validator.validateBody(schema.createSubject),
    controller.createSubject
)
//jvgokdsgjkaojg
router.route(permissions.updateSubject.path).put(
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
    validator.validateBody(schema.updateSubject),
    controller.updateSubject
)

router.route(permissions.deleteSubject.path).delete(
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
    validator.validateRouteParameters(schema.deleteSubject),
    controller.deleteSubject
)

module.exports = router