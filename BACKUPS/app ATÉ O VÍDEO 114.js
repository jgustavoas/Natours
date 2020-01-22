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

/* USADO COMO EXEMPLO SIMPLES DE MIDDLEWARE
app.use((req, res, next) => {
  console.log('Hello from middleware!');
  next();
});
*/

app.use((req, res, next) => {
  req.reqestTime = new Date().toISOString();
  next();
});

// Aqui um pequeno middleware para as rotas "tour" e "user"
// Esse recurso é chamado de "mounting routes"
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

/* 
VÍDEO 111: "HANDLING UNHANDLED ROUTES"
MIDDLEWARE PARA TRATAR DE ROTAS NÃO EXISTENTES ==================================================
Caso nenhuma das rotas definidas na aplicação (tourRouter ou userRouter, por exemplo) encontre a URL,
...então usar este middleware para TODOS os métodos (get, post, patch, delete etc.)
Funciona somente depois de passar pelos "Routers" que foram definidos.
O asterisco indica todas as rotas não reconhecidas pelos Routers que foram definidos.
Pode considerar como um tratamento de erro de exceção¹...
...pois EXCETO pelas rotas definidas nos Routers, TODAS ('*') as URL's cairão neste middleware. 

(¹) Na verdade esse tipo de erro é chamado "erro operacional", o conceito de "exceção" é diferente.
*/
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`
  // });

  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404; // ERRO CRIADO ARTIFICIALMENTE PARA TESTES

  next(err); // QUALQUER parâmetro passado dentro de next() é considerado como o de erro pelo Express.
  // Esse parâmetro de erro pode estar em QUALQUER middleware em qualquer linha do código da aplicação.
  // Ele SEMPRE irá lançar o erro (passado como parâmetro em "next") dentro do middleware de error handling.
  // O middleware de error handling é SEMPRE aquele com quatro parâmetros, sendo o primeiro parâmetro o do erro.
});

/* VÍDEO 113: IMPLEMENTING A GLOBAL ERROR HANDLING MIDDLEWARE
// O Express reconhece uma função com quatro parâmetros como um middleware de error handling...
// ...com o primeiro parâmetro sendo SEMPRE o de erro.
*/
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error'; // "status" aqui faz referência a como o Jonas chama no json().

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
