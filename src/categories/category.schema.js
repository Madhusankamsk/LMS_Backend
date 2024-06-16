const joi = require('joi');
const joiConfig = require('../../config/joiConfig')

module.exports.getCategoryById = joi.object({
    id: joi.string().required().max(24).min(24),
})

// module.exports.getCategories = joi.object({
//     ...joiConfig.pagination,
// })

module.exports.getCategories = (maxLimit) => {
    return joi.object().keys({
        subject_id: joi.string().alphanum().min(24).max(24),
        ...joiConfig.pagination(maxLimit),
    });
};

module.exports.createCategory = joi.object({
    name: joi.string().required().min(1).max(30),
    subject_id:joi.string().required().max(24).min(24),
})

module.exports.updateCategory = joi.object({
    _id: joi.string().required().max(24).min(24),
    name: joi.string().min(1).max(30),
    subject_id:joi.string().max(24).min(24),
})

module.exports.deleteCategory = joi.object({
    id: joi.string().required().max(24).min(24),
})