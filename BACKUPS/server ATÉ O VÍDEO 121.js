const dotenv = require('dotenv');
// Obtendo as variáveis de ambiente em "config.env"
// Uma vez iniciado o servidor, o node grava os dados, dispensando a necessidade do arquivo.
dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');
const app = require('./app');

console.log(app.get('env'));

// Achei desnecessário isso, mas repeti o procedimento do Jonas
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
app.listen(port, () => {
  console.log(`App listening on port ${port}...`);
});

// npm WARN eslint-config-airbnb@18.0.1 requires a peer of eslint-plugin-react-hooks@^1.7.0 but none is installed.
// You must install peer dependencies yourself.
