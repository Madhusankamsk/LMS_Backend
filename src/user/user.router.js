const express = require('express')
const schema = require('./user.schema')
const controller = require('./user.controller')
const validator = require('../../validators/validator')

const router = express.Router()
const { permissions } = require('./user.permission')

router.route(permissions.usersGetById.path).get(
    validator.validateHeader(), 
    controller.getUserById
)

router.route(permissions.usersGetAll.path).get(
        validator.validateHeader(),
        validator.validateQueryParameters(schema.getAllUsers),
        controller.getUsers
)

router.route(permissions.usersCreate.path).post(
    validator.validateBody(schema.createUser),
    controller.createUser
)

router.route(permissions.usersLoginEmail.path).post(
    validator.validateBody(schema.loginUser), 
    controller.loginUser
)

router.route(permissions.usersForgetPassword.path).post(
    validator.validateBody(schema.forgetPassword),
    controller.userForgotPasswordEmail
)

router.route(permissions.userForgotPasswordReset.path).post(
    validator.validateBody(schema.forgetPasswordReset),
    controller.userForgotPasswordResetWithCode
)

router.route(permissions.userEmailVerify.path).post(
    validator.validateBody(schema.userEmailVerify),
    controller.userEmailVerify
)

router.route(permissions.userEmailVerifyWithCode.path).post(
    validator.validateBody(schema.emailVerifyWithCode),
    controller.userEmailVerifyWithCode
)

router.route(permissions.usersUpdate.path).put(
    validator.validateBody(schema.updateUser),
    controller.updateUser
)


















router.route(permissions.userResetPassword.path).post(
validator.validateHeader(),
// validator.validateRouteAccessByRole({
//     baseRoute: '/users',
//     action: 'edit',
// }),
validator.validateBody(schema.resetPassword),
controller.resetPasswordAdmin
)






router.route(permissions.blockUser.path).post(
    validator.validateHeader(),
    // validator.validateRouteAccessByRole({
    //     baseRoute: '/user',
    //     action: 'block',
    // }),
    validator.validateBody(schema.blockUser),
    controller.blockUser
)

router.route(permissions.userPasswordResetAdmin.path).post(
    validator.validateHeader(),
    // validator.validateRouteAccessByRole({
    //     baseRoute: '/user',
    //     action: 'reset_password',
    // }),
    validator.validateBody(schema.passwordResetAdmin),
    controller.userPasswordReset
)

router.route(permissions.deleteUser.path).post(
    validator.validateHeader(permissions.deleteUser.granted),
    // validator.validateRouteAccessByRole({
    //     baseRoute: '/user',
    //     action: 'delete',
    // }),
    validator.validateBody(schema.deleteUser),
    controller.deleteUser
)

router.route(permissions.userPasswordResetUser.path).post(
    validator.validateBody(schema.passwordResetUser),
    controller.resetPasswordUser
)

module.exports = router