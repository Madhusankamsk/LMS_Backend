const { superAdmin } = require('../../config/permissionConfig').userRoles

module.exports.permissions = {
    getPapers: {
        path: '/',
        granted: [superAdmin],
    },
    createPaper: {
        path: '/create',
        granted: [superAdmin],
    },
    updatePaper: {
        path: '/update',
        granted: [superAdmin],
    },
    deletePaper: {
        path: '/delete/:id',
        granted: [superAdmin],
    },
}