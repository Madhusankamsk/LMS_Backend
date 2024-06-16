const {
    // successWithPaginationData,
    customError,
    successWithData,
} = require('../../services/responseService')

const service = require('./subject.service')

module.exports.getSubjectById = async (req, res) => {
    try {
        const data = await service.getSubjectById(req.params);
        return successWithData(data, res);
    } catch (error) {
        return customError(error.message, res);
    }
};

module.exports.getSubjects = async (req, res) => {
    try {
        const data = await service.getSubjects(req.query)
        return successWithData(data, res)
    } catch (error) {
        return customError(error.message, res)
    }
}

module.exports.createSubject = async (req, res) => {
    try {
        const data = await service.createSubject(req.body)
        return successWithData(data, res)
    } catch (error) {
        return customError(error.message, res)
    }
}

module.exports.updateSubject = async (req, res) => {
    try {
        const data = await service.updateSubject(req.body)
        return successWithData(data, res)
    } catch (error) {
        return customError(error.message, res)
    }
}

module.exports.toggleSubject = async (req, res) => {
    try {
        const data = await service.toggleSubject(req.params.id)
        return successWithData(data, res)
    } catch (error) {
        return customError(error.message, res)
    }
}

module.exports.deleteSubject = async (req, res) => {
    try {
        const data = await service.deleteSubject(req.params.id)
        return successWithData(data, res)
    } catch (error) {
        return customError(error.message, res)
    }
}
