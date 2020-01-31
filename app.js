const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // ¹
// ¹Motivo do formato "path.join(__dirname, 'views')" no vídeo 175 aos 03:50

// 1.GLOBAL MIDDLEWARES ==============================================================================
// Serving static files
app.use(express.static(path.join(__dirname, 'public'))); // ²como em ¹ e movido da metade do arquivo pra cá.

// Set security HTTP
app.use(helmet()); // É importante este middleware estar no topo.

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same API
const limiter = rateLimit({
  max: 100, // máximo de 100 requests do mesmo IP num intervalo de 1h (definido abaixo);
  windowMs: 60 * 60 * 1000, // 1 hora = 60 (minutos) * 60 (segundos) * 1000 (milisegundos)
  // 1000 milisegundos = 1 segundo; 1s * 60 = 1 minuto; 1min * 60 = 1h; 1h * 24 = 1d.
  message: 'Too many requests from this IP. Please try again in one hour.'
});
app.use('/api', limiter);

// Renderização de arquivos estáticos (body parser) com limite de tamanho
app.use(express.json({ limit: '10kb' }));

// Parsing cookie
app.use(cookieParser());

// Data sanitization against noSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS attacks
app.use(xss());

// Preventing parameters pollution (ideal pelo final)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
); // evita confusão caso existam, por exemplo, parâmetros duplicados na URL.
// Exemplo: "/tours?sort=price&sort=duration" consideraria o último parâmetro

// Serving static files
// ²app.use(express.static(`${__dirname}/public`)); // localhost:3000/overview.html (ou outro arquivo da pasta "public")

/* USADO COMO EXEMPLO SIMPLES DE MIDDLEWARE
app.use((req, res, next) => {
  console.log('Hello from middleware!');
  next();
});
*/

// Middleware usado como teste
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});
// =================================================================================================

// 2.ROUTES MIDDLEWARES ============================================================================
// Mounting routes ---------------------------------------------------------------------------------
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

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

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404; // ERRO CRIADO ARTIFICIALMENTE PARA TESTES

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  // QUALQUER parâmetro passado dentro de next() é considerado como o de erro pelo Express.
  // Esse parâmetro de erro pode estar em QUALQUER middleware em qualquer linha do código da aplicação.
  // Ele SEMPRE irá lançar o erro (passado como parâmetro em "next") dentro do middleware de error handling.
  // O middleware de error handling é SEMPRE aquele com quatro parâmetros, sendo o primeiro parâmetro o do erro.
});
// =================================================================================================

// 3.ERROR HANDLING MIDDLEWARE =====================================================================
// VÍDEO 113
// O Express reconhece uma função com quatro parâmetros como um middleware de error handling...
// ...com o primeiro parâmetro sendo SEMPRE o de erro.
app.use(globalErrorHandler);
//==================================================================================================

module.exports = app;
