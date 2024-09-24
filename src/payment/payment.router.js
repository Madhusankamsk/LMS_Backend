const express = require('express')

const router = express.Router()
const validator = require('../../validators/validator')

const { permissions } = require('./payment.permission')
const controller = require('./payment.controller')
const schema = require('./payment.schema')

const joiConfig = require('../../config/joiConfig')

router.route(permissions.getPaymentById.path).get(
    validator.validateRouteParameters(schema.getPaymentById),
    controller.getPaymentById
)

router.route(permissions.getPayments.path).get(
    validator.validateQueryParameters(
        schema.getPayments(joiConfig.maxRecords)
    ),
    controller.getPayments
)

router.route(permissions.createPayment.path).post(
    validator.validateBody(schema.createPayment),
    controller.createPayment
)

router.route(permissions.updatePayment.path).put(
    validator.validateBody(schema.updatePayment),
    controller.updatePayment
)

router.route(permissions.deletePayment.path).delete(
    validator.validateRouteParameters(schema.deletePayment),
    controller.deletePayment
)

module.exports = router
