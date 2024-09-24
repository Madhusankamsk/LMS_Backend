// import permission list
const { superAdmin } = require("../../config/permissionConfig").userRoles;

module.exports.permissions = {
    getPaymentById: {
        path: "/:id",
        granted: [superAdmin],
    },
    getPayments: {
        path: "/",
        granted: [superAdmin],
    },
    createPayment: {
        path: "/create",
        granted: [superAdmin],
    },
    updatePayment: {
        path: "/update",
        granted: [superAdmin],
    },
    togglePayment: {
        path: "/toggle/:id",
        granted: [superAdmin],
    },
    deletePayment: {
        path: "/delete/:id",
        granted: [superAdmin],
    },
};