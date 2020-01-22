const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// Exportado para ser usado como "Params Middleware"
exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is ${val}`);

  if (req.params.id > tours.length) {
    return res.status(404).json({
      status: 'Not found',
      message: 'Inválid ID'
    });
  }
  next();
};

// Desafio do middleware para checar dados no corpo da requisição
exports.checkBody = (req, res, next) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      status: 'Invalid',
      message: 'Missing data in the body'
    });
  }

  next();
};

// Controllers CRUD
exports.getAllTours = (req, res) => {
  console.log(req.reqestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.reqestTime,
    results: tours.length,
    data: {
      tours
    }
  });
};
exports.getTour = (req, res) => {
  // console.log(req.params);

  // req.params.id é uma String, porém quando multiplicado por 1, torna-se um Number
  // Efeito de coercion como "2" + 3 = "23", mas ao contrário, pois Number prevalece sobre String
  const id = req.params.id * 1;
  const tour = tours.find(el => el.id === id);

  // if (id > tours.length) {
  // if (!tour) {
  //   return res.status(404).json({
  //     status: 'Not found',
  //     message: 'Inválid ID'
  //   });
  // }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
};
exports.createTour = (req, res) => {
  // console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = { id: newId, ...req.body };

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );

  // res.send('Done!');
};
exports.updateTour = (req, res) => {
  // const id = req.params.id * 1;
  //
  // if (id > tours.length) {
  //   return res.status(404).json({
  //     status: 'Not found',
  //     message: 'Inválid ID'
  //   });
  // }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};
exports.deleteTour = (req, res) => {
  //  const id = req.params.id * 1;
  //
  //  if (id > tours.length) {
  //    return res.status(404).json({
  //      status: 'Not found',
  //      message: 'Inválid ID'
  //    });
  //  }  A LÓGICA COMENTADA ACIMA FOI PARA O MIDDLEWARE NO COMEÇO DO ARQUIVO

  res.status(204).json({
    status: 'success',
    data: null
  });
};
