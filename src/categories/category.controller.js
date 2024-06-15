const {
    // successWithPaginationData,
    customError,
    successWithData,
} = require('../../services/responseService')

const service = require('./category.service')

module.exports.getCategoryById = async (req, res) => {
    try {
        const data = await service.getCategoryById(req.params);
        return successWithData(data, res);
    } catch (error) {
        return customError(error.message, res);
    }
};

module.exports.createCategory = async (req, res) => {
    try {
        const data = await service.createCategory(req.body)
        return successWithData(data, res)
    } catch (error) {
        return customError(error.message, res)
    }
}

module.exports.updateCategory = async (req, res) => {
    try {
        const data = await service.updateCategory(req.body)
        return successWithData(data, res)
    } catch (error) {
        return customError(error.message, res)
    }
}

module.exports.deleteCategory = async (req, res) => {
    try {
        const data = await service.deleteCategory(req.params.id)
        return successWithData(data, res)
    } catch (error) {
        return customError(error.message, res)
    }
}

module.exports.getCategories = async (req, res) => {
    try {
        const data = await service.getCategories(req.query)
        return successWithData(data, res)
    } catch (error) {
        return customError(error.message, res)
    }
}