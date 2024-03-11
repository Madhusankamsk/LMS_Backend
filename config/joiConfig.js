const joi = require('joi')

const sortConfig = require('./sort.config')

module.exports.maxRecords = 100

module.exports.id = joi.object().keys({
    id: joi.string().alphanum().min(24).max(24).required(),
})

module.exports.pagination = (maxLimit) => ({
    limit: maxLimit
        ? joi.number().integer().max(maxLimit).required()
        : joi.number().integer().min(0).required(),
    page: joi.number().integer().min(1).required(),
    column: joi.number().integer().min(-1),
    order: joi
        .string()
        .valid(
            sortConfig.sortingOrder.ascending,
            sortConfig.sortingOrder.descending,
            null,
            ''
        ),
    include: joi.array().allow(null, ''),
    exclude: joi.array().allow(null, ''),
    search: joi.string().allow(null, ''),
    _id: joi.string().alphanum().min(24).max(24),
})

module.exports.paginationSchema = (maxLimit) =>
    joi.object().keys({
        ...this.pagination(maxLimit),
    })

module.exports.userRolesPaginationSchema = (maxLimit) =>
    joi.object().keys({
        ...this.pagination(maxLimit),
        admin: joi.boolean(),
    })
