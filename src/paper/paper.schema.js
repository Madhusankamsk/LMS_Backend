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

module.exports.createPaper = joi.object({
    title: joi.string().required().min(1),
    subject_id: joi.string().required().max(24).min(24),
    category_id: joi.string().required().max(24).min(24),
    teacher_id: joi.string().required().max(24).min(24),
    duration: joi.string().required().min(1),
    publish_date: joi.date().required(),
    is_free: joi.boolean().required(),
    price: joi.string(),
    rate_value: joi.number(),
    paper_link: joi.string().required().min(1),
    display_image_link: joi.string().required().min(1),
    answer_link: joi.string().required().min(1),
    video_link: joi.string().required().min(1),
    description: joi.string().required().min(1),
})

module.exports.updatePaper = joi.object({
    _id: joi.string().max(24).min(24).required(),
    title: joi.string().min(1),
    subject_id: joi.string().max(24).min(24),
    category_id: joi.string().max(24).min(24),
    teacher_id: joi.string().max(24).min(24),
    duration: joi.string().min(1),
    publish_date: joi.date(),
    is_free: joi.boolean(),
    price: joi.string(),
    rate_value: joi.number(),
    paper_link: joi.string().min(1),
    display_image_link: joi.string().min(1),
    answer_link: joi.string().min(1),
    video_link: joi.string().min(1),
    description: joi.string().min(1),
})

module.exports.deletePaper = joi.object({
    _id: joi.string().max(24).min(24).required(),
    role_type: joi.string().valid(...Object.values(Config.role_types)),
    role: joi.string(),
    routes: joi.array().items(updateRouteSchema),
    is_allowed: joi.boolean(),
})

module.exports.getPapers = joi.object({
    _id: joi.string().max(24).min(24).required(),
    role_type: joi.string().valid(...Object.values(Config.role_types)),
    role: joi.string(),
    routes: joi.array().items(updateRouteSchema),
    is_allowed: joi.boolean(),
})

