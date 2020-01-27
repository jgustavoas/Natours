const dotenv = require('dotenv');
// Obtendo as variáveis de ambiente em "config.env"
// Uma vez iniciado o servidor, o node grava os dados, dispensando a necessidade do arquivo.
dotenv.config({ path: './config.env' });

/*
VÍDEO 122: CATCHING UNCAUGHT EXCPETIONS
// Escutando o evento "uncaughtException" para qualquer ocorrência.
// O código foi movido para o início do arquivo por volta de 05:20.
*/
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCPETION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const mongoose = require('mongoose');
const app = require('./app');

console.log(app.get('env'));

// Achei desnecessário isso, mas repeti o procedimento do Jonas
const DB = process.env.REMOTE_DATABASE.replace(
  '<PASSWORD>',
  process.env.REMOTE_PASSWORD
);

const localDB = process.env.LOCAL_DATABASE;
const useRemoteDB = false;

mongoose
  .connect(useRemoteDB === true ? DB : localDB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true // Esta última opção foi inserida devido a um aviso do node:
    /* AVISO AO RODAR "npm start" ==========================================================
    (node:27402) DeprecationWarning: current Server Discovery and Monitoring engine is deprecated, 
    and will be removed in a future version. 
    To use the new Server Discover and Monitoring engine, pass option { useUnifiedTopology: true } 
    to the MongoClient constructor.
    */
  })
  .then(() => console.log('Database connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App listening on port ${port}...`);
});

// npm WARN eslint-config-airbnb@18.0.1 requires a peer of eslint-plugin-react-hooks@^1.7.0 but none is installed.
// You must install peer dependencies yourself.

/*
VÍDEO 121: ERRORS OUTSIDE EXPRESS: UNHANDLED REJECTIONS
// Escutando o evento "unhandledRejection" para qualquer ocorrência.
// Na aula, um erro de conexão com o MongoDB foi simulado alterando o a variável REMOTE_PASSWORD
*/
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// console.log(x);
