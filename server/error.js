// error handling middleware

export const handleError = (status, message) => {
  const error = new Error(); // creating an error object
  error.status = status; // assigning a HTTP status code
  error.message = message; // assigning an error message
  return error; // returning the object
};
