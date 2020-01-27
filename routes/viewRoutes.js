const express = require('express');
const { isLoggedIn, protect } = require('./../controllers/authController');

const {
  getOverview,
  getTour,
  loginForm,
  getAccount
} = require('./../controllers/viewController');

const router = express.Router();

router.use(isLoggedIn);

router.get('/', getOverview);
router.get('/tour/:slug', getTour);

router.get('/login', loginForm);
router.get('/me', protect, getAccount);

module.exports = router;
