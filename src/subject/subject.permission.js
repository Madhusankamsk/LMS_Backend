// import permission list
const { superAdmin } = require("../../config/permissionConfig").userRoles;

module.exports.permissions = {
    getSubjects: {
        path: "/",
        granted: [superAdmin],
    },
    getSubjectById: {
        path: "/:id",
        granted: [superAdmin],
    },
    createSubject: {
        path: "/create",
        granted: [superAdmin],
    },
    updateSubject: {
        path: "/update",
        granted: [superAdmin],
    },
    toggleSubject: {
        path: "/toggle/:id",
        granted: [superAdmin],
    },
    deleteSubject: {
        path: "/delete/:id",
        granted: [superAdmin],
    },
};