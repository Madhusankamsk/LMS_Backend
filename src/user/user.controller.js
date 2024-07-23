// import service
const service = require("./user.service");
// import response service to handle the output
const {
  // successWithPaginationData,
  customError,
  successWithData,
  successWithDataAndToken,
} = require("../../services/responseService");

module.exports.createUser = async (req, res) => {
  try {
    const data = await service.createUser(req.body);
    //console.log(data);
    return successWithDataAndToken(data, res);
  } catch (error) {
    console.log(error.message);
    return customError(error.message, res);
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    const data = await service.loginUser(req.body);
    return successWithDataAndToken(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.userForgotPasswordEmail = async (req, res) => {
  try {
    const data = await service.userForgotPasswordEmail(req.body);
    return successWithData(data, res);
  } catch (error) {
    console.log(error.message);
    return customError(error.message, res);
  }
};





module.exports.userForgotPasswordResetWithCode = async (req, res) => {
  try {
    const data = await service.userForgotPasswordReset(req.body);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.userPasswordReset = async (req, res) => {
  try {
    const data = await service.userPasswordReset(req.body);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const data = await service.updateUser(req.body);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.getUserById = async (req, res) => {
  try {
    const data = await service.getUserById(req.params);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.getUsers = async (req, res) => {
  try {
    const data = await service.getUsers(req.query);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const data = await service.deleteUser(req.body);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.blockUser = async (req, res) => {
  try {
    const data = await service.blockUser(req.body);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.resetPasswordAdmin = async (req, res) => {
  try {
    const data = await service.resetPasswordAdmin(req.body);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.resetPasswordUser = async (req, res) => {
  try {
    const data = await service.resetPasswordUser(req.body);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
}