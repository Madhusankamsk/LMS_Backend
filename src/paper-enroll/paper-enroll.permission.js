// import permission list
const { superAdmin } = require("../../config/permissionConfig").userRoles;

module.exports.permissions = {
    getEnrollPaperById: {
        path: "/:id",
        granted: [superAdmin],
    },
    getEnrollPapers: {
        path: "/",
        granted: [superAdmin],
    },
    createEnrollPaper: {
        path: "/create",
        granted: [superAdmin],
    },
    updateEnrollPaper: {
        path: "/update",
        granted: [superAdmin],
    },
    toggleEnrollPaper: {
        path: "/toggle/:id",
        granted: [superAdmin],
    },
    deleteEnrollPaper: {
        path: "/delete/:id",
        granted: [superAdmin],
    },
};