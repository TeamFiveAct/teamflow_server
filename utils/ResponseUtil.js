const responseUtil = (response_status, response_msg, response_data) => {
  return {
    status: response_status,
    message: response_msg,
    data: response_data,
  };
};

module.exports = responseUtil;
