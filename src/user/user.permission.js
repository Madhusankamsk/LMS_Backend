// import permission list
const { superAdmin } = require("../../config/permissionConfig").userRoles;

module.exports.permissions = {
  usersCreate: {
    path: "/create",
    granted: [superAdmin],
  },
  usersLoginEmail: {
    path: "/login",
  },
  usersForgetPassword: {
    path: "/forget-password",
  },
  userForgotPasswordReset: {
    path: "/forget-password/reset",
  },







  usersGetAll: {
    path: "/",
    granted: [superAdmin],
  },
  usersGetById: {
    path: "/:id",
  },
  usersSave: {
    path: "/",
  },
  superAdminRegister: {
    path: "/super_admin_register",
  },
  userPasswordResetAdmin: {
    path: "/password/reset",
    granted: [superAdmin],
  },
  userPasswordResetUser: {
    path: "/password/user/reset",
  },
  usersConfirmation: {
    path: "/confirm/:id",
  },
  usersUpdate: {
    path: "/",
    granted: [superAdmin],
  },
  deleteUser: {
    path: "/delete",
    granted: [superAdmin],
  },
  blockUser: {
    path: "/block-toggle",
    granted: [superAdmin],
  },
  userResetPassword: {
    path: "/reset-password",
    granted: [superAdmin],
  },
};