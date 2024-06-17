const joi = require('joi')
const joiConfig = require('../../config/joiConfig')

module.exports.getPaperById = joi.object({
    id: joi.string().required().max(24).min(24),
});

module.exports.getPapers = (maxLimit) => {
    return joi.object().keys({
        subject_id: joi.string().alphanum().min(24).max(24),
        ...joiConfig.pagination(maxLimit),
    });
};

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

module.exports.togglePaper = joi.object({
    id: joi.string().required().max(24).min(24),
})

module.exports.deletePaper = joi.object({
    id: joi.string().required().max(24).min(24),
})

