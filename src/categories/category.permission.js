// import permission list
const { superAdmin } = require("../../config/permissionConfig").userRoles;

module.exports.permissions = {
    getCategories: {
        path: "/",
        granted: [superAdmin],
    },
    getCategoryById: {
        path: "/:id",
        granted: [superAdmin],
    },
    createCategory: {
        path: "/create",
        granted: [superAdmin],
    },
    updateCategory: {
        path: "/update",
        granted: [superAdmin],
    },
    deleteCategory: {
        path: "/delete/:id",
        granted: [superAdmin],
    },
};