const Tour = require('./../models/tourModels');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsyncErrors = require('./../utils/catchAsync');

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage';
  next();
};

// Controllers CRUD
exports.getAllTours = catchAsyncErrors(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });

  // try {
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err
  //   });
  // }
});

exports.getTour = catchAsyncErrors(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { tour }
  });

  // try {
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err
  //   });
  // }
});

// Implementado no vídeo 115 e depois inserido num arquivo externo em './../utils/catchAsync.js'
/* 
  const catchAsyncErrors = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
*/

exports.createTour = catchAsyncErrors(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });

  // try {
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err
  //   });
  // }
});

exports.updateTour = catchAsyncErrors(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });

  // try {
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err
  //   });
  // }
});

exports.deleteTour = catchAsyncErrors(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    // 204 ("No content") é um código de status usado ao deletar
    status: 'success',
    data: null // Aqui uma diferença, não se costuma retornar dados depois que estes são deletados
  });

  // try {
  // } catch (err) {
  //   res.status(401).json({
  //     status: 'fail',
  //     message: err
  //   });
  // }
});

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
