const joi = require('joi')
const Config = require('../../config/config')

const submitButtonActionSchema = joi.object({
    name: joi.string().required(),
    index: joi.number().required(),
    is_allowed: joi.boolean().required(),
})

const routeSchema = joi.object({
    baseRoute: joi.string().required(),
    is_allowed: joi.boolean().required(),
    submit_button_actions: joi.array().items(submitButtonActionSchema),
})

const updateSubmitButtonActionSchema = joi.object({
    _id: joi.string().max(24).min(24),
    name: joi.string().required(),
    index: joi.number().required(),
    is_allowed: joi.boolean().required(),
})

const updateRouteSchema = joi.object({
    _id: joi.string().max(24).min(24),
    baseRoute: joi.string().required(),
    submit_button_actions: joi.array().items(updateSubmitButtonActionSchema),
    is_allowed: joi.boolean().required(),
    action: joi.string().valid('delete', 'insert', 'update').required(),
})

module.exports.createRole = joi.object({
    role: joi.string().required(),
    role_type: joi
        .string()
        .valid(...Object.values(Config.role_types))
        .required(),
    is_allowed: joi.boolean().required(),
    routes: joi.array().when('role_type', {
        is: 'admin',
        then: joi.array().items(routeSchema).required().min(1),
        otherwise: joi.array().items(routeSchema),
    }),
})

module.exports.updateRole = joi.object({
    _id: joi.string().max(24).min(24).required(),
    role_type: joi.string().valid(...Object.values(Config.role_types)),
    role: joi.string(),
    routes: joi.array().items(updateRouteSchema),
    is_allowed: joi.boolean(),
})

module.exports.toggleBlock = joi.object({
    _id: joi.string().max(24).min(24).required(),
})