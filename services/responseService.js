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

}