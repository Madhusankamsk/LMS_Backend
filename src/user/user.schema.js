const joi = require('joi')
const config = require('../../config/config')
const joiConfig = require('../../config/joiConfig')

const passwordValidation = joi
    .string()
    .min(8)
    .regex(/^\S+$/)
    .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must not contain spaces',
    })
    .required()

module.exports.createUser = joi.object().keys({
    email: joi
        .string()
        .email({ tlds: { allow: false } })
        .required(),
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    profile_picture: joi.string(),
    phone: joi.string().length(10).required(),
    password: passwordValidation,
    address: joi.string(),
    school: joi.string(),
    grade: joi.string(),
})

module.exports.loginUser = joi.object().keys({
    email: joi
        .string()
        .email({ tlds: { allow: false } })
        .required(),
    password: joi.string().required(),
})

module.exports.forgetPassword = joi.object().keys({
    email: joi
        .string()
        .email({ tlds: { allow: false } })
        .required(),
})

module.exports.forgetPasswordReset = joi.object().keys({
    password: passwordValidation,
    email: joi
        .string()
        .email({ tlds: { allow: false } })
        .required(),
    password_reset_code: joi.string().required(),
})

module.exports.userEmailVerify = joi.object().keys({
    email: joi
        .string()
        .email({ tlds: { allow: false } })
        .required(),
})

module.exports.emailVerifyWithCode = joi.object().keys({
    email: joi
        .string()
        .email({ tlds: { allow: false } })
        .required(),
    email_verify_code: joi.string().required(),
})

module.exports.updateUser = joi.object().keys({
    _id: joi.string().required().max(24).min(24),
    email: joi
        .string()
        .email({ tlds: { allow: false } }),
    first_name: joi.string(),
    last_name: joi.string(),
    profile_picture: joi.string(),
    phone: joi.string().length(10),
    password: passwordValidation,
    re_enter_password: passwordValidation,
    address: joi.string(),
    school: joi.string(),
    grade: joi.string(),
})

















module.exports.resetPassword = joi.object().keys({
    email: joi
        .string()
        .email({ tlds: { allow: false } })
        .required(),
    new_password: passwordValidation,
    password: joi.string().required(),
})

module.exports.passwordResetAdmin = joi.object().keys({
    password: passwordValidation,
    _id: joi.string().required().max(24).min(24),
})

module.exports.passwordResetUser = joi.object().keys({
    current_password: passwordValidation,
    new_password: passwordValidation,
    _id: joi.string().required().max(24).min(24),
})

module.exports.deleteUser = joi.object().keys({
    _id: joi.string().required().max(24).min(24),
})

module.exports.blockUser = joi.object().keys({
    _id: joi.string().required().max(24).min(24),
})

module.exports.resetPassword = joi.object().keys({
    _id: joi.string().required().min(24).max(24),
})

module.exports.getAllUsers = joi.object().keys({
    ...joiConfig.pagination(joiConfig.maxRecords),
    roleType: joi.string().valid(...Object.values(config.role_types)),
})


//test comment