const service = require("./paper.service");

const {
  // successWithPaginationData,
  customError,
  successWithData,
} = require("../../services/responseService");

module.exports.getPaperById = async (req, res) => {
  try {
      const data = await service.getPaperByIdToFrontEnd(req.params);
      return successWithData(data, res);
  } catch (error) {
      return customError(error.message, res);
  }
};

module.exports.getPapers = async (req, res) => {
  try {
      const data = await service.getPapers(req.query)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}

module.exports.createPaper = async (req, res) => {
  try {
      const data = await service.createPaper(req.body)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}

module.exports.updatePaper = async (req, res) => {
  try {
      const data = await service.updatePaper(req.body)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}

module.exports.togglePaper = async (req, res) => {
  try {
      const data = await service.togglePaper(req.params.id)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}

module.exports.deletePaper = async (req, res) => {
  try {
      const data = await service.deletePaper(req.params.id)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}


