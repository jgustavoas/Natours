const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');

// Obtendo as variáveis de ambiente em "config.env"
// Uma vez iniciado o servidor, o node grava os dados, dispensando a necessidade do arquivo.
dotenv.config({ path: './config.env' });

const DB = process.env.REMOTE_DATABASE.replace(
  '<PASSWORD>',
  process.env.REMOTE_PASSWORD
);

mongoose
  .connect(DB, {
    //.connect(process.env.LOCAL_DATABASE, { esta linha caso queira usar o banco de dados local.
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('Database connection successful!'));

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// IMPORT DATA INTO DATABASE COLLECTION
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfuly loaded!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// DELETE DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfuly deleted!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

/* 
QUAL É A LÓGICA DAS CONDICIONAIS ABAIXO?
Ao rodar este arquivo no node com a flag "--import" estamos criando um argumento de mesmo nome "--import" dentro de uma array.
Ou seja, "node dev-data/data/import-dev-data.js --import" retorna a array abaixo:
[
  '/usr/bin/node',
  '/home/gustavo/Development/natours-starter/dev-data/data/import-dev-data.js',
  '--import'
]
Nessa array, os dois primeiros elementos são padrão.
O primeiro elemnto é o caminho absoluto do executável que iniciou o processo do Node.
O segundo elemento é o arquivo que está sendo executado.
A partir de um terceiro elemento são os argumentos adicionados manualmente.
Mais informações em https://nodejs.org/dist/latest-v12.x/docs/api/process.html#process_process_argv
*/
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// console.log(process.argv);
