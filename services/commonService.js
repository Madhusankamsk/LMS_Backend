/**
 * Populate data using $lookup
 * @param from
 * @param localField
 * @param foreignField
 * @param as
 * @returns {{$lookup: {localField, as, foreignField, from}}}
 */
module.exports.lookUpField = (from, localField, foreignField, as) => ({
    $lookup: {
      from,
      localField,
      foreignField,
      as,
    },
  });
  
  /**
   * Unwind field (convert array to objects) using $unwind
   * @param path
   * @param preserveNullAndEmptyArrays
   * @returns {{$unwind: {path, preserveNullAndEmptyArrays}}}
   */
  module.exports.unwindField = (path, preserveNullAndEmptyArrays) => ({
    $unwind: {
      path,
      preserveNullAndEmptyArrays,
    },
  });
  
  /**
   * Include/exclude fields depending on operator
   * @param fields
   * @param operator
   */
  module.exports.setLimitToPositiveValue = (limit, recordsTotal) => {
    let positiveLimit;
    if (!limit || limit <= 0 || Number.isNaN(limit)) {
      if (recordsTotal > 0) {
        positiveLimit = recordsTotal;
      } else {
        positiveLimit = 1;
      }
    } else {
      positiveLimit = limit;
    }
  
    return positiveLimit;
  };
  