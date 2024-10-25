const joi = require('joi')
const joiConfig = require('../../config/joiConfig')

module.exports.getFolderById = joi.object({
    id: joi.string().required().max(24).min(24),
});

module.exports.getFolders = (maxLimit) => {
    return joi.object().keys({
        category_id: joi.string().alphanum().min(24).max(24),
        ...joiConfig.pagination(maxLimit),
    });
};

module.exports.createFolder = joi.object({
    name: joi.string().required().min(1),
    subject_id: joi.string().required().max(24).min(24),
    category_id: joi.string().required().max(24).min(24),
})

module.exports.updateFolder = joi.object({
    _id: joi.string().max(24).min(24).required(),
    name: joi.string().min(1),
    subject_id: joi.string().max(24).min(24),
    category_id: joi.string().max(24).min(24),
})

module.exports.toggleFolder = joi.object({
    id: joi.string().required().max(24).min(24),
})

module.exports.deleteFolder = joi.object({
    id: joi.string().required().max(24).min(24),
})

