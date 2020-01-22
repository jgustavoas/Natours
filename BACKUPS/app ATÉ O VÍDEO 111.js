const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Utilidade questionável
}

app.use(express.json());

// Exemplo de renderização de arquivos estáticos (neste caso, os templates html)
app.use(express.static(`${__dirname}/public`)); // localhost:3000/overview.html (ou outro arquivo da pasta "public")

app.use((req, res, next) => {
  console.log('Hello from middleware!');
  next();
});

app.use((req, res, next) => {
  req.reqestTime = new Date().toISOString();
  next();
});

// Aqui um pequeno middleware para as rotas "tour" e "user"
// Esse recurso é chamado de "mounting routes"
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
