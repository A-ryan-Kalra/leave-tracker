const errorHandler = (statusCode, error) => {
  const errorMessage = new Error(error.message || "Internal Server Error");
  errorMessage.statusCode = statusCode;
  return errorMessage;
};

export default errorHandler;
