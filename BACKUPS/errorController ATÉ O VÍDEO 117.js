module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error'; // "status" aqui faz referência a como o Jonas chama no json().

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};
