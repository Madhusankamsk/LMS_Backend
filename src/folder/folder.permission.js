// import permission list
const { superAdmin } = require("../../config/permissionConfig").userRoles;

module.exports.permissions = {
    getFolderById: {
        path: "/:id",
        granted: [superAdmin],
    },
    getFolders: {
        path: "/",
        granted: [superAdmin],
    },
    createFolder: {
        path: "/create",
        granted: [superAdmin],
    },
    updateFolder: {
        path: "/update",
        granted: [superAdmin],
    },
    toggleFolder: {
        path: "/toggle/:id",
        granted: [superAdmin],
    },
    deleteFolder: {
        path: "/delete/:id",
        granted: [superAdmin],
    },
};