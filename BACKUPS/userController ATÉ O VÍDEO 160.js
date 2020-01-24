const User = require('./../models/userModel');
const catchAsyncErrors = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// Função para filtrar os campos editáveis²
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsyncErrors(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.updateMyself = catchAsyncErrors(async (req, res, next) => {
  // 1. Throw error if user posts password data
  if (req.body.password || req.body.passwordConfirm)
    next(
      new AppError(
        'This route is not for password updates. Please use the route "/updateMyPassword".',
        400
      )
    );

  // 2. Update user document¹
  const filteredBody = filterObj(req.body, 'name', 'email'); // ²Motivo disso por volta de 14:00
  const filedsToUpdate = { name: req.body.name, email: req.body.email }; // Minha solução.

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filedsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  /* 
  ¹Jonas não usou o método save(), que utiliza middlewares do userModel.
  O motivo disso é explicado no vídeo 138 em tornde de 11:00
  Acho que daria para usar.
  Minha solução seria obter "user.password" e simplesmente reenviá-lo sem modificação.
  */

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deactivateUser = catchAsyncErrors(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { activeUser: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};
