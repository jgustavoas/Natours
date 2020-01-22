class appError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // `${statusCode}` transforma statusCode, que é um número, numa String diretamente.

    this.isOperacional = true;

    Error.captureStackTrace(this, this.constructor); // Sobre esta linha, ver o vídeo 114 em 06:00
  }
}

module.exports = appError;
