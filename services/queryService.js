/**
 * Include/exclude fields depending on operator
 * @param fields
 * @param operator
 */
module.exports.includeExcludeFields = (fields, operator) => {
    const returnObject = {};
  
    fields.forEach((field) => {
      returnObject[field] = operator;
    });
  
    return returnObject;
  };