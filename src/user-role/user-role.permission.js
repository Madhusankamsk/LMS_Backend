// import permission list
const { superAdmin } = require("../../config/permissionConfig").userRoles;

module.exports.permissions = {
  userRoleGetAll: {
    path: "/",
    granted: [superAdmin],
  },
  userRoleGetById: {
    path: "/:id",
    granted: [superAdmin],
  },
  userRoleCreate: {
    path: "/create",
    granted: [superAdmin],
  },
  userRoleUpdate: {
    path: "/",
    granted: [superAdmin],
  },
  toggleBlock: {
    path: "/block-toggle",
    granted: [superAdmin],
  },
  userRoleRemove: {
    path: "/:id",
    granted: [superAdmin],
  },
};