const path  = require("path");
const tokenService = require("./tokenService");

module.exports = {
    customError(message, res) {
        return res.json({
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
                data.role,
            ),
        })
    },

}