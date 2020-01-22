const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true
    },
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
    startDates: [Date]
  },
  { toJSON: { virtuals: true } }, // Indica que os campos virtuais sejam incluídos no output
  { toObject: { virtuals: true } } // Indica que os campos virtuais sejam incluídos no output
);

tourSchema.virtual('durationWeeks').get(function() {
  // Não foi usado arrow function por causa do uso do "this"
  return this.duration / 7;
});
/* NOTAS SOBRE CAMPOS VIRTUAIS: 
  1) Campos virtuais não podem ser usados em queries
  2) O cálculo de 'durationWeeks' poderia ser feito no controller, mas isso não é considerado boa prática
     porque isso confude a lógica de negócio (Models) com a lógica da aplicação (Controllers).  
     Então, aqui segue-se o conceito de "Fat Models and Thin Controllers".
*/

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
