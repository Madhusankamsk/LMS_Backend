// import permission list
const { superAdmin } = require("../../config/permissionConfig").userRoles;

module.exports.permissions = {
    getPaperById: {
        path: "/:paper_id/:user_id",
        granted: [superAdmin],
    },
    getPapers: {
        path: "/",
        granted: [superAdmin],
    },
    createPaper: {
        path: "/create",
        granted: [superAdmin],
    },
    updatePaper: {
        path: "/update",
        granted: [superAdmin],
    },
    togglePaper: {
        path: "/toggle/:id",
        granted: [superAdmin],
    },
    deletePaper: {
        path: "/delete/:id",
        granted: [superAdmin],
    },
};