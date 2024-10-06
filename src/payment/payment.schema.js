const joi = require('joi')
const joiConfig = require('../../config/joiConfig')

module.exports.getPaymentById = joi.object({
    id: joi.string().required().max(24).min(24),
});

module.exports.getPayments = (maxLimit) => {
    return joi.object().keys({
        user_id: joi.string().alphanum().min(24).max(24),
        ...joiConfig.pagination(maxLimit),
    });
};

module.exports.createPayment = joi.object({
    user_id: joi.string().required().max(24).min(24),
    image_link: joi.string().required().min(1),
})

module.exports.updatePayment = joi.object({
    _id: joi.string().max(24).min(24).required(),
    user_id: joi.string().max(24).min(24),
    image_link: joi.string().min(1),
    price: joi.number(),
    status: joi.string(),
    transfer_date: joi.string(),
})

module.exports.deletePayment = joi.object({
    id: joi.string().required().max(24).min(24),
})

