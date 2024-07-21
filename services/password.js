const crypto = require("crypto");

module.exports.validatePassword = function (passwordReq, passwordDb, salt) {
  const hash = crypto
    .pbkdf2Sync(passwordReq, salt, 10000, 512, "sha512")
    .toString("hex");
  return passwordDb === hash;
};