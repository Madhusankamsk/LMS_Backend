// import permission list
const { superAdmin } = require("../../config/permissionConfig").userRoles;

module.exports.permissions = {
    getCategoryById: {
        path: "/:id",
        granted: [superAdmin],
    },
    getCategories: {
        path: "/",
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
    toggleCategory: {
        path: "/toggle/:id",
        granted: [superAdmin],
    },
    deleteCategory: {
        path: "/delete/:id",
        granted: [superAdmin],
    },
};