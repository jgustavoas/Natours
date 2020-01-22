const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsyncErrors = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Jonas usou essa refatoração em "signUp", "signIn", "resetPassword" e "updatePassword"
// Ver vídeo 137 aos 10:00
// Usei apenas em "updatePassword" (no final do arquivo)
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      // Obtendo 90 dias em milisegundos para cálculo de tempo:
      // 90 * 24 (horas) * 60 (minutos) * 60 (segundos) * 1000 (milesgundos)
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true, // https, somente para em ambiente de produção
    // A propriedade abaixo,impede que o cookie seja acessado e modificado através do browser
    // Evita ataques "Cross Site Scripting"
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // Hack pra não exibir o password no output:
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signUp = catchAsyncErrors(async (req, res, next) => {
  // const newUser = await User.create(req.body); Substituído no vídeo 128 aos 03:00 (falha de segurança).
  const {
    name,
    email,
    password,
    role,
    passwordConfirm,
    passwordChangedAt
  } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    role,
    passwordConfirm,
    passwordChangedAt
  });

  createSendToken(newUser, 201, res); // Inseri por causa do cookie introduzido no vídeo 141.
});

exports.signIn = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email and password were into the body
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2. Check if user exists && password is correct
  // Como em userModel está definido select:false para o password, seleciona-se o campo manualmente.
  // Para isso, usa-se "select('+NOMEDOCAMPO')".
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. If everything is ok, send token to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsyncErrors(async (req, res, next) => {
  // 1. Getting token and checking if it's ok
  let token;
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError('You are not signed in! Please sign in to get access', 401)
    );
  // 2. Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded.id); (Gradd)

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError('The user of this token does no longer exist!', 401)
    );

  // 4. Check if user changed password after token was issued
  // console.log('bool', currentUser.changedPasswordAfter(decoded.iat));
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User has changed password. Please sign in again.', 401)
    );
  }

  // Grant access to protected routes.
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You're not allowed to perform this action.", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  // 1. Get user based on provided email
  const user = await User.findOne({ email });
  if (!user)
    return next(new AppError('There is no user with this email address.', 404));

  // 2. Generate the ramdom reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send token to user's email.
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? 
  Submit a PATCH request with your new password and passwordConfirm to ${resetUrl}.\n
  If you didn't forget your password, please ignore this e-mail.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error by sending the email. Please try again later.',
        500
      )
    );
  }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // 1. Get user based on the token sent
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2. If token not expired and user exists, set new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3. Update changePasswordAt property for the user

  // 4. Log user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  // 1. Get user from the collection
  const user = await User.findById(req.user.id).select('+password');

  // 2. Check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is incorrect.', 401));
  }

  // 3. If true, Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // "user.findAndUpdate" não funciona com os middlewares do Mongo (ver vídeo 137 em 08:30)

  // 4. Log user in, send JWT
  createSendToken(user, 200, res);
});
