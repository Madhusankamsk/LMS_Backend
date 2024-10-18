const joi = require('joi')
const joiConfig = require('../../config/joiConfig')

module.exports.getCommentById= joi.object({
    id: joi.string().required().max(24).min(24),
});

module.exports.getComments = (maxLimit) => {
    return joi.object().keys({
        parent_id: joi.string().alphanum().min(24).max(24),
        paper_id: joi.string().alphanum().min(24).max(24),
        ...joiConfig.pagination(maxLimit),
    });
};

module.exports.createComment= joi.object({
    comment: joi.string().required().min(1),
    paper_id: joi.string().required().max(24).min(24),
    user_id: joi.string().required().max(24).min(24),
});

module.exports.updateComment= joi.object({
    _id: joi.string().max(24).min(24).required(),
    comment: joi.string().required().min(1),
    paper_id: joi.string().max(24).min(24),
    user_id: joi.string().required().max(24).min(24),
});

module.exports.deleteComment = joi.object({
    id: joi.string().required().max(24).min(24),
})