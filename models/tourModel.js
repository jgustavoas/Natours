const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel'); // DISPENSADO AO USAR "REFERENCING" NO LUGAR DE "EMBEDDING"

// const validator = require('validator'); O método isAlpha só funciona com string sem espaços.

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have the maximum of 40 characters!'],
      minlength: [10, 'A tour name must have at least 10 characters!']
      // validate: [
      //   validator.isAlpha,
      //   'Tour name must only contain alphabetic characters!'
      // ]
    },
    slug: String, // Adicionado no vídeo 104
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration.']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size.']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty.'],
      trim: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A rating must be at least 1.0'],
      max: [5, 'A rating cannot be higher than 5.0'],
      set: val => Math.round(val * 10) / 10 // "set" executa uma função qualquer¹
      // ¹Esse cálculo cria resulta num número decimal de um dígito (testar com "toFixed(1)")
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price!']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // "this" aponta para o documento somente na CRIAÇÃO, não funciona com update por exemplo.
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price'
        // {VALUE} é como uma variável interna do Mongoose que retorna o valor do campo
      }
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary.'],
      trim: true
    },
    description: {
      type: String,
      // required: [true, 'A tour must have a description.'],
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must a have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      // Se um tour é "secreto", ou seja exclusivo para turistas VIP
      type: Boolean,
      default: false
    },
    // "startLocation" é de onde parte o tour.
    startLocation: {
      description: String,
      // MongoDB usa um formato que ele chama de GeoJSON para armazenar coordenadas geográficas
      // Note que aqui "type" é um objeto, diferente dos outros campos ateriores a "startLocation"
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number], // [lon, lat] No MongoDB, longitude primeiro e depois latitude.
      address: String
    },
    // "locations" também armanezena dados geográficos (long., lat.)
    // "locations" é um array com os demais lugares que fazem parte do tour.
    /* 
    A estrutura é a seguinte: "locations" é uma array de objetos, cujo "type" também é um objeto...
    ...e "coordinates" é um array de números representando longitude e latitude respectivamente.
    */
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // guides: Array Usado no vídeo 150 e substituído pelo abaixo no vídeo 151
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User' // ref: 'User' dispensa a importação do módulo 'User' no início do arquivo.
      }
    ]
  },
  {
    toJSON: { virtuals: true }, // Indica que os campos virtuais sejam incluídos no output
    toObject: { virtuals: true } // Indica que os campos virtuais sejam incluídos no output
  }
);

// USANDO ÍNDICES PARA MELHORAR PERFORMANCE ========================================================
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); // Adicionado no vídeo 170 em 18:00

// CAMPOS VIRTUAIS =================================================================================
tourSchema.virtual('durationWeeks').get(function() {
  // Não foi usado arrow function por causa do uso do "this"
  return this.duration / 7;
});
/* NOTAS: 
  1) Campos virtuais não podem ser usados em queries
  2) O cálculo de 'durationWeeks' poderia ser feito no controller, mas isso não é considerado boa prática
     porque confude a lógica de negócio (Models) com a lógica da aplicação (Controllers).  
     Então, aqui é seguido segue o conceito de "Fat Models and "Thin Controllers".
*/

// VIRTUAL POPULATE (VÍDEO 156)
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// "DOCUMENT MIDDLEWARE" ===========================================================================
// '.pre()' funciona somente antes de 'create' e de 'save', sendo executado "antes" deles.
tourSchema.pre('save', function(next) {
  // console.log(this);

  // Ao invés de inserir um slug no documento quando este é criado, acho que o slug poderia ser virtual.
  // Seria alguns bytes a menos no banco de dados...
  // ...e sempre manteria consistência com o nome, quando este fosse editado.
  this.slug = slugify(this.name, { lower: true });
  next();
});

/* 
SOLUÇÃO DO VÍDEO 150: "MODELLING TOUR GUIDES: EMBEDDING"
ABORDADO COMO DEMONSTRAÇÃO DO FUNCIONAMENTO, MAS NÃO USADO POR MOTIVO EXLICADO NO FINAL DO VÍDEO
tourSchema.pre('save', async function(next) {
  const guidesInPromises = this.guides.map(
    async guideID => await User.findById(guideID)
  );
  // Como o resultado de map() é uma promise, é necessário esperar que todas elas se cumpram...
  // ...usando "Promise.all", para finalmente inserir seu resultado (uma array) em "this.guide".
  this.guides = await Promise.all(guidesInPromises);
  next();
});
*/

/*
tourSchema.pre('save', function(next) {
  console.log('Saving document to collection...');
  next();
});

// Aqui "post" guarda relação com "pre" do middleware acima
// Indica que é executado "depois" de ocorrer o "save".
tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
});
*/

// QUERY MIDDLEWARE ================================================================================
// É apenas a operação "find" que diferencia este "Query middleware" do "Document middleare" acima
// "find" aponta para uma query e não para um documento em si, por isso a diferença.
tourSchema.pre(/^find/, function(next) {
  // RegExp prática, que serve para 'find', 'findOne', 'findOneAndDelete' etc., economizando código.
  // tourSchema.pre('find', function(next) {
  this.find({ secretTour: { $ne: true } });

  this.startExecutionTime = Date.now(); // É possível criarmos novas propriedades dentro do middleware.
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides', // Na collection "tours", "guides" faz referência à collection "users"
    select: '-__v -passwordChangedAt' // Exclui da exibição esses campos da collection "users"
  });

  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(
    `Query took ${Date.now() - this.startExecutionTime} miliseconds!`
  );
  // console.log(docs);

  next();
});

// AGGREGATION MIDDLEWARE (DESATIVADO NO VÍDEO 171 AOS 09:00) ======================================
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//
//   console.log(this.pipeline());
//   "this" aponta para o objeto de "aggregate", ou seja o resultado da operação.
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
