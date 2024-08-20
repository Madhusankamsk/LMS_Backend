// import permission list
const { superAdmin } = require("../../config/permissionConfig").userRoles;

module.exports.permissions = {
    getCommentById: {
        path: "/:id",
        granted: [superAdmin],
    },
    getComments: {
        path: "/",
        granted: [superAdmin],
    },
    createComment: {
        path: "/create",
        granted: [superAdmin],
    },
    updateComment: {
        path: "/update",
        granted: [superAdmin],
    },
    deleteComment: {
        path: "/delete/:id",
        granted: [superAdmin],
    },
};