module.exports.validity = (role, grantedArray) => {
  return new Promise((resolve, reject) => {
    if (
      Array.isArray(grantedArray) &&
      grantedArray.length !== 0 &&
      grantedArray.includes(role)
    ) {
      resolve("granted");
    } else {
      reject(new Error("User not authorized to use this route"));
    }
  });
};
