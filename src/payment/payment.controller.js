const {
  // successWithPaginationData,
  customError,
  successWithData,
} = require("../../services/responseService");

const service = require("./payment.service");

module.exports.getPaymentById = async (req, res) => {
  try {
      const data = await service.getPaymentById(req.params);
      return successWithData(data, res);
  } catch (error) {
      return customError(error.message, res);
  }
};

module.exports.getPayments = async (req, res) => {
  try {
      const data = await service.getPayments(req.query)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}

module.exports.createPayment = async (req, res) => {
  try {
      const data = await service.createPayment(req.body)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}

module.exports.updatePayment = async (req, res) => {
  try {
      const data = await service.updatePayment(req.body)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}

module.exports.deletePayment = async (req, res) => {
  try {
      const data = await service.deletePayment(req.params.id)
      return successWithData(data, res)
  } catch (error) {
      return customError(error.message, res)
  }
}


