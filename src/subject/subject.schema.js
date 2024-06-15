const joi = require('joi');
const joiConfig = require('../../config/joiConfig')

module.exports.getSubjectById = joi.object({
    id: joi.string().required().max(24).min(24),
})

module.exports.getSubjects = joi.object({
    ...joiConfig.pagination,
})

module.exports.createSubject = joi.object({
    name: joi.string().required().min(1).max(30),
    code:joi.string().required(),
})

module.exports.updateSubject = joi.object({
    _id: joi.string().required().max(24).min(24),
    name: joi.string().min(1).max(30),
    code:joi.string(),
})

module.exports.deleteSubject = joi.object({
    id: joi.string().required().max(24).min(24),
})





