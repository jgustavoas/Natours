const Tour = require('./../models/tourModels');

// Controllers CRUD
exports.getAllTours = async (req, res) => {
  try {
    const queryObj = { ...req.query };

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // const query = Tour.find(req.query);
    // POR QUE NÃO FOI USADO SIMPLESMENTE req.query? =============================================
    // Se for usado req.query o MongoDB vai buscar no banco de dados todas as queries da URL
    // Porém, a query "page", por exemplo, não faz parte da collection, mas apenas da paginação
    // As queries "page", "sort", "limit" etc fazem parte do filtro e da ordenação da collection.
    // Então, usa-se uma cópia de req.query excluídos os itens da array "excludedFields"
    const query = Tour.find(queryObj); // Isto é o mesmo que o exemplo abaixo:
    // const query = Tour.find({duration: 5, difficulty: 'easy'});

    // Explicação no minuto 17 do vídeo 94.
    const tours = await query;

    console.log('query', req.query);

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { tour }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }

  //res.status(200).json({
  //  status: 'success',
  //  data: {
  //    tour
  //  }
  //});
};

exports.createTour = async (req, res) => {
  /* Substituído pelo método "create()" e usado de forma assíncrona
  const newTour = new Tour({});
  newTour.save();
  */

  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      // 204 ("No content") é um código de status usado ao deletar
      status: 'success',
      data: null // Aqui uma diferença, não se costuma retornar dados depois que estes são deletados
    });
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err
    });
  }
};
