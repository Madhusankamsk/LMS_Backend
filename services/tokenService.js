// Import jwt Library
const jwt = require('jsonwebtoken')
// Import Token Secret
const { secret } = require('../config')

module.exports.generateJwt = (id, email, role, roleId, roleType) =>
    jwt.sign(
        {
            id,
            email,
            role,
            role_id: roleId,
            role_type: roleType,
        },
        secret,
        {
            expiresIn: '30d',
        }
    )