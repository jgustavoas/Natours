const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
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
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

/* USADO APENAS PARA TESTES QUANDO ESTAVA NO ARQUIVO "server.js"
const testTour = new Tour({
  name: 'The Park Camper',
  rating: 4.7,
  price: 497
});

testTour
  .save()
  .then(doc => {
    console.log(doc);
  })
  .catch(error => {
    console.log('Error: ', error);
  });
  */
