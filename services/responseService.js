const path  = require("path");
const tokenService = require("./tokenService");

module.exports = {
    customError(message, res) {
        return res.status(422).json({
            status: false,
            msg: message,
        })
    },

    successWithData(data, res) {
        return res.json({
            status: true,
            data,
        })
    },

    successWithDataAndToken(data, res) {
        return res.json({
            status: true,
            data,
            token: tokenService.generateJwt(
                data._id,
                data.email,
                data.user_role.role,
                data.user_role._id,
                data.user_role.role_type
            ),
        })
    },

}