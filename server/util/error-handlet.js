const errorHandler = (statusCode, message) => {
  const errorMessage = new Error(message);
  errorMessage.statusCode = statusCode;
  return errorMessage;
};

export default errorHandler;
