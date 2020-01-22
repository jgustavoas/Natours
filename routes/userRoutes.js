const express = require('express');

const router = express.Router();
const {
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword
} = require('./../controllers/authController');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMyself,
  deactivateUser
} = require('./../controllers/userController');

/* 
  Se existe um arquivo controller exclusivo para autenticação,
  faz sentido ter arquivo exclusivo de rota para autenticação também,
  ao invés de colocar a rota "signup" neste userRoutes.js
*/
router.post('/signup', signUp);
router.post('/signin', signIn);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Na rota abaixo, "My" faz referência à ação deliberada do próprio usuário logado em atualizar a senha
router.patch('/updateMyPassword', protect, updatePassword);

router.patch('/updateMyself', protect, updateMyself);
router.delete('/deactivate', protect, deactivateUser); // O método "delete" só indica o tipo de operação.

/* 
Nos métodos "route()" abaixo, não é mais necessário indicar a url completa
Esta rota está definida na constante "router", que usa a classe "Router" do express.
É como indicar a raiz de uma url para uma série de rotas.
*/
router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
