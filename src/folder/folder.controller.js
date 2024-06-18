const {
  // successWithPaginationData,
  customError,
  successWithData,
} = require("../../services/responseService");

const service = require("./folder.service");

module.exports.getFolderById = async (req, res) => {
  try {
      const data = await service.getFolderById(req.params);
      return successWithData(data, res);
  } catch (error) {
      return customError(error.message, res);
  }
};

module.exports.getFolders = async (req, res) => {
  try {
      const data = await service.getFolders(req.query)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}

module.exports.createFolder = async (req, res) => {
  try {
      const data = await service.createFolder(req.body)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}

module.exports.updateFolder = async (req, res) => {
  try {
      const data = await service.updateFolder(req.body)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}

module.exports.toggleFolder = async (req, res) => {
  try {
      const data = await service.toggleFolder(req.params.id)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}

module.exports.deleteFolder = async (req, res) => {
  try {
      const data = await service.deleteFolder(req.params.id)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}


