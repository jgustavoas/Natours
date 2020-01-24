const express = require('express');

const router = express.Router();

const { protect, restrictTo } = require('./../controllers/authController');

const {
  aliasTopTours,
  createTour,
  readManyTours,
  readOneTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan
} = require('./../controllers/tourController');

// const { createReview } = require('./../controllers/reviewController');

const reviewRoutes = require('./../routes/reviewRoutes');

// MERGE PARAMS do Express: caso a rota contenha "/:tourId/reviews", usar na verdade "reviewRoutes".
// É um middleware, na prática.
router.use('/:tourId/reviews', reviewRoutes);

// Params Middleware ===============================
// router.param('id', checkID); // Exemplo completo no backup até o vídeo 87

/* 
Nos métodos "route()" abaixo, não é mais necessário indicar a url completa
Esta rota está definida na constante "router", que é uma classe "Router" do express.
É como indicar a raiz de uma url para uma série de rotas.
*/

router.route('/top-5-tours').get(aliasTopTours, readManyTours);

// Aggregation pipeline ==============================================================
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router
  .route('/')
  .get(readManyTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(readOneTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);
// Nos middleware de "delete", primeiro protegemos a página contra usários não autenticados...
// ...em seguida, restringimos o poder de deletar tours a dois perfis ("admin" e "lead-tour").

// VÍDEO 157: ======================================================================================
// ABAIXO, DEMONSTRAÇÃO DO FUNCIONAMENTO DE NESTED ROUTES, SUBSTITUÍDO POR "MERGE PARAMS" DO EXPRESS
// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('tourist'), createReview);

module.exports = router;
