const userRoleService = require("./user-role.service");

const {
  // successWithPaginationData,
  customError,
  successWithData,
} = require("../../services/responseService");

module.exports.createUserRole = async (req, res) => {
  try {
    const data = await userRoleService.createUserRole(req.body);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.userRoleUpdate = async (req, res) => {
  try {
    const data = await userRoleService.updateUserRole(req.body);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.getUserRoles = async (req, res) => {
  try {
    const data = await userRoleService.getUserRoles(req.query);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.getUserRolesById = async (req, res) => {
  try {
    const data = await userRoleService.getUserRolesById(req.params.id);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};

module.exports.toggleBlock = async (req, res) => {
  try {
    const data = await userRoleService.toggleBlock(req.body);
    return successWithData(data, res);
  } catch (error) {
    return customError(error.message, res);
  }
};