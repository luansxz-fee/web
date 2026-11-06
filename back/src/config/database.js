
const mongoose = require('mongoose');

require('dotenv').config();

async function conectarBanco() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI não foi definida.');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(
      'Conexão com o MongoDB estabelecida com sucesso!'
    );
  } catch (erro) {
    console.error(
      'Erro ao conectar no MongoDB:',
      erro.message
    );

    throw erro;
  }
}

module.exports = conectarBanco;
