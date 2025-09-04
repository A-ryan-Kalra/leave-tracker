const errorHandler = (error, statusCode) => {
  const errorMessage = new Error(
    error?.message || error || "Internal Server Error"
  );
  errorMessage.statusCode = statusCode;
  return errorMessage;
};

export default errorHandler;
