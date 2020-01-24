const Tour = require('./../models/tourModel');
const catchAsyncErrors = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage';
  next();
};

// Controllers CRUD
exports.createTour = factory.createOne(Tour);
exports.readManyTours = factory.readMany(Tour);
exports.readOneTour = factory.readOne(Tour, { path: 'reviews' });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deletOne(Tour);

// AGGREGATION PIPELINE =============================================
// Mais informações em:
// https://docs.mongodb.com/manual/aggregation/
// https://docs.mongodb.com/manual/reference/operator/aggregation/
exports.getTourStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        // _id: null, // sem agrupamento
        // _id: '$difficulty', // agrupando pelo campo "difficulty"
        _id: { $toUpper: '$difficulty' }, // agrupando pelo campo "difficulty"
        numTours: { $sum: 1 }, // nesta linha, para cada match, somar 1
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    } //,
    // {
    //   $match: { _id: { $ne: 'EASY' } } // Excluindo dos stats os tours de nível "Easy"
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });

  // try {
  // } catch (error) {
  //   res.status(401).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});

exports.getMonthlyPlan = catchAsyncErrors(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12 // Apenas para demonstração pelo Jonas
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });

  // try {
  // } catch (error) {
  //   res.status(401).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});
