const service = require("./paper-enroll.service");

const {
  // successWithPaginationData,
  customError,
  successWithData,
} = require("../../services/responseService");

module.exports.getEnrollPaperById = async (req, res) => {
  try {
    console.log(req.params.paper_id);
      const data = await service.getEnrollPaperByStudentIdWithPaperID(req.params.paper_id, req.params.user_id);
      return successWithData(data, res);
  } catch (error) {
      return customError(error.message, res);
  }
};

module.exports.getEnrollPapers = async (req, res) => {
  try {
      const data = await service.getEnrollPapers(req.query)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}

module.exports.createEnrollPaper = async (req, res) => {
  try {
      const data = await service.createEnrollPaper(req.body)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}

module.exports.updateEnrollPaper = async (req, res) => {
  try {
      const data = await service.updateEnrollPaper(req.body)
      return successWithData(data, res)
  } catch (error) {
    console.log(error);
      return customError(error.message, res)
  }
}

module.exports.deleteEnrollPaper = async (req, res) => {
  try {
      const data = await service.deleteEnrollPaper(req.params.id)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}


