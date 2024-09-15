const joi = require('joi')
const joiConfig = require('../../config/joiConfig')

module.exports.getEnrollPaperById = joi.object({
    //id: joi.string().required().max(24).min(24),
    paper_id: joi.string().required().max(24).min(24),
    user_id: joi.string().required().max(24).min(24),
});

module.exports.getEnrollPapers = (maxLimit) => {
    return joi.object().keys({
        //paper_id: joi.string().alphanum().min(24).max(24),
        user_id: joi.string().alphanum().min(24).max(24),
        teacher_id: joi.string().alphanum().min(24).max(24),
        ...joiConfig.pagination(maxLimit),
    }).xor('user_id', 'teacher_id'); // Ensures either user_id or teacher_id is required, but not both
};

module.exports.createEnrollPaper = joi.object({
    paper_id: joi.string().required().max(24).min(24),
    user_id: joi.string().required().max(24).min(24),
})

module.exports.updateEnrollPaper = joi.object({
    _id: joi.string().max(24).min(24).required(),
    paper_id: joi.string().max(24).min(24),
    user_id: joi.string().max(24).min(24),
    student_link: joi.string(),
    mark: joi.number(),
    answer_time: joi.string(),
    feedback: joi.string(),
    status: joi.string().required(),
    student_answer_time: joi.string(),
})

module.exports.toggleEnrollPaper = joi.object({
    id: joi.string().required().max(24).min(24),
})

module.exports.deleteEnrollPaper = joi.object({
    id: joi.string().required().max(24).min(24),
})

