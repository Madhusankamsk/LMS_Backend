const service = require('./comments.service')

const {
    // successWithPaginationData,
    customError,
    successWithData,
  } = require("../../services/responseService");

module.exports.getCommentById = async (req, res) => {
    try {
        const data = await service.getCommentById(req.params);
        return successWithData(data, res);
    } catch (error) {
        return customError(error.message, res);
    }
  }

module.exports.getComments = async (req, res) => {
    try {
        const data = await service.getComments(req.query)
        return successWithData(data, res)
    } catch (error) {
        return customError(error.message, res)
    }
  }

module.exports.createComment = async (req, res) => {
    try {
        const data = await service.createComment(req.body)
        return successWithData(data, res)
    } catch (error) {
        return customError(error.message, res)
    }
  }

  module.exports.updateComment = async (req, res) => {
    try {
        const data = await service.updateComment(req.body)
        return successWithData(data, res)
    } catch (error) {
        return customError(error.message, res)
    }
  }

  module.exports.deleteComment = async (req, res) => {
    try {
        const data = await service.deleteComment(req.params.id)
        return successWithData(data, res)
    } catch (error) {
        return customError(error.message, res)
    }
  }