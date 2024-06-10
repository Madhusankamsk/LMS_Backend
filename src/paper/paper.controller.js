const paperService = require("./paper.service");

const {
  // successWithPaginationData,
  customError,
  successWithData,
} = require("../../services/responseService");

module.exports.createPaper = async (req, res) => {
  try {
    const data = await paperService.createPaper(req.body);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.updatePaper = async (req, res) => {
  try {
    const data = await paperService.updatePaper(req.body);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.getPapers = async (req, res) => {
  try {
    const data = await paperService.getPaper(req.query);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.deletePapers = async (req, res) => {
  try {
    const data = await paperService.getPapers(req.query);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

