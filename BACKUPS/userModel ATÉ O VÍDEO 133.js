const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please tell us your email.'],
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please type your password'],
    minlength: 8,
    trim: true,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!
      // Detalhe: "save()" pode ser usado para atualizar dados.
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date
});

userSchema.pre('save', async function(next) {
  // Se o cadastro do usuário for editado mas o campo password não for modificado, retornar next().
  if (!this.isModified('password')) return next();

  // Sendo falso o "if" acima, então encriptar a senha.
  this.password = await bcrypt.hash(this.password, 12);

  // Como a validação é feita pelo MongoDB, o campo passwordConfirm é utilizado.
  // Porém, após a validação e a encriptação, esse campo não é mais necessário estar no banco de dados.
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // console.log(JWTTimestamp, changedTimeStamp);
    // console.log(JWTTimestamp < changedTimeStamp);
    return JWTTimestamp < changedTimeStamp;
  }

  // false means not changed password
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
