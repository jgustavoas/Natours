const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

// Obtendo as variáveis de ambiente em "config.env"
// Uma vez iniciado o servidor, o node grava os dados, dispensando a necessidade do arquivo.
dotenv.config({ path: './config.env' });

const DB = process.env.REMOTE_DATABASE.replace(
  '<PASSWORD>',
  process.env.REMOTE_PASSWORD
);

const localDB = process.env.LOCAL_DATABASE;
const useRemoteDB = false;

mongoose
  .connect(useRemoteDB === true ? DB : localDB, {
    //.connect(process.env.LOCAL_DATABASE, { esta linha caso queira usar o banco de dados local.
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('Database connection successful!'));

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// IMPORT DATA INTO DATABASE COLLECTION
// NOTA: AO IMPORTAR OS DADOS DOS USUÁRIOS DESABILITAR OS MIDDLEWARES "pre('save)" EM "userModel.js"
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Tours data successfuly loaded!');
    await User.create(users, { validateBeforeSave: false });
    console.log('Users data successfuly loaded!');
    await Review.create(reviews);
    console.log('Reviews data successfuly loaded!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// DELETE DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Tours data successfuly deleted!');
    await User.deleteMany();
    console.log('Users data successfuly deleted!');
    await Review.deleteMany();
    console.log('Reviews data successfuly deleted!');
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
Nessa array, os dois primeiros elementos são por padrão.
O primeiro elemento é o caminho absoluto do executável que iniciou o processo do Node.
O segundo elemento é o arquivo que está sendo executado.
A partir de um terceiro elemento são listados os argumentos adicionados manualmente.
Mais informações em https://nodejs.org/dist/latest-v12.x/docs/api/process.html#process_process_argv
*/
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// console.log(process.argv); // Para ver os argumentos.
