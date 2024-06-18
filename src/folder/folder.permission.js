// import permission list
const { superAdmin } = require("../../config/permissionConfig").userRoles;

module.exports.permissions = {
    getUnitById: {
        path: "/:id",
        granted: [superAdmin],
    },
    getUnits: {
        path: "/",
        granted: [superAdmin],
    },
    createUnit: {
        path: "/create",
        granted: [superAdmin],
    },
    updateUnit: {
        path: "/update",
        granted: [superAdmin],
    },
    toggleUnit: {
        path: "/toggle/:id",
        granted: [superAdmin],
    },
    deleteUnit: {
        path: "/delete/:id",
        granted: [superAdmin],
    },
};