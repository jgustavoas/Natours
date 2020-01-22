const express = require('express');

const router = express.Router();

const {
  aliasTopTours,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan
} = require('./../controllers/tourController');

// Params Middleware ===============================
// router.param('id', checkID); // Exemplo completo no backup até o vídeo 87

/* 
Nos métodos "route()" abaixo, não é mais necessário indicar a url completa
Esta rota está definida na constante "router", que é uma classe "Router" do express.
É como indicar a raiz de uma url para uma série de rotas.
*/

router.route('/top-5-tours').get(aliasTopTours, getAllTours);

// Aggregation pipeline =========================
// Descobrir por que não pode ficar depois por último, antes de modules.export
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router
  .route('/')
  .get(getAllTours)
  .post(createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;
