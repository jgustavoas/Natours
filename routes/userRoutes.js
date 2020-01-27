const express = require('express');

const router = express.Router();
const {
  signUp,
  signIn,
  logout,
  forgotPassword,
  resetPassword,
  protect,
  restrictTo,
  updatePassword
} = require('./../controllers/authController');
const {
  createUser,
  readOneUser,
  readManyUsers,
  updateUser,
  deleteUser,
  updateMyself,
  deactivateMyself,
  getMe
} = require('./../controllers/userController');

/* 
  Se existe um arquivo controller exclusivo para autenticação,
  faz sentido ter arquivo exclusivo de rota para autenticação também,
  ao invés de colocar a rota "signup" neste userRoutes.js
*/
router.post('/signup', signUp);
router.post('/signin', signIn);
router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect); // Este middleware funcionará para toda rota abaixo dele.

// Na rota abaixo, "My" faz referência à ação deliberada do próprio usuário logado em atualizar a senha
router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMyself', updateMyself);
router.get('/me', getMe, readOneUser);
router.delete('/deactivate', deactivateMyself); // Aqui o método "delete" só indica o tipo de operação.

router.use(restrictTo('admin')); // Este middleware funcionará para toda rota abaixo dele.

/* 
Nos métodos "route()" abaixo, não é mais necessário indicar a url completa
Esta rota está definida na constante "router", que usa a classe "Router" do express.
É como indicar a raiz de uma url para uma série de rotas.
*/
router
  .route('/')
  .get(readManyUsers)
  .post(createUser);

router
  .route('/:id')
  .get(readOneUser)
  .patch(restrictTo('admin'), updateUser)
  .delete(deleteUser);

module.exports = router;
