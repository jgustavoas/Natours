const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true
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
      trim: true
    },
    ratingsAverage: {
      type: Number,
      default: 4.5
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price!']
    },
    priceDiscount: Number,
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
    }
  },
  {
    toJSON: { virtuals: true }, // Indica que os campos virtuais sejam incluídos no output
    toObject: { virtuals: true } // Indica que os campos virtuais sejam incluídos no output
  }
);

// CAMPOS VIRTUAIS ===================================================
tourSchema.virtual('durationWeeks').get(function() {
  // Não foi usado arrow function por causa do uso do "this"
  return this.duration / 7;
});
/* NOTAS: 
  1) Campos virtuais não podem ser usados em queries
  2) O cálculo de 'durationWeeks' poderia ser feito no controller, mas isso não é considerado boa prática
     porque isso confude a lógica de negócio (Models) com a lógica da aplicação (Controllers).  
     Então, aqui segue-se o conceito de "Fat Models and Thin Controllers".
*/

// "DOCUMENT MIDDLEWARE" ===================================================
// '.pre()' funciona somente antes de 'create' e 'save' e indica que é executado "antes" deles.
tourSchema.pre('save', function(next) {
  // console.log(this);

  // Ao invés de inserir um slug no documento quando este é criado, acho que o slug poderia ser virtual.
  // Seria alguns bytes a menos no banco de dados...
  // ...e sempre manteria consistência com o nome, quando este fosse editado.
  this.slug = slugify(this.name, { lower: true });
  next();
});

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

// QUERY MIDDLEWARE =========================================
// É apenas a operação "find" que diferencia este "Query middleware" do "Document middleare" acima
// "find" aponta para uma query e não para um documento em si, por isso a diferença.
tourSchema.pre(/^find/, function(next) {
  // RegExp prática, que serve para 'find', 'findOne', 'findOneAndDelete' etc., economizando código.
  // tourSchema.pre('find', function(next) {
  this.find({ secretTour: { $ne: true } });

  this.startExecutionTime = Date.now(); // É possível criarmos novas propriedades dentro do middleware.
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(
    `Query took ${Date.now() - this.startExecutionTime} miliseconds!`
  );
  console.log(docs);

  next();
});

// AGGREGATION MIDDLEWARE ========================================
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  console.log(this.pipeline()); // "this" aponta para o objeto de "aggregate", ou seja o resultado da operação.
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
