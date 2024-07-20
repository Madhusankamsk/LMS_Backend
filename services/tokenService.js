// Import jwt Library
const jwt = require('jsonwebtoken')
// Import Token Secret
const { secret } = require('../config')

module.exports.generateJwt = (id, role ) =>
    jwt.sign(
        {
            id,
            role,
        },
        secret,
        {
            expiresIn: '30d',
        }
    )