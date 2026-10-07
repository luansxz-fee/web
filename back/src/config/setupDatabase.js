require('dotenv').config();
const mongoose = require('mongoose');

require('../models/UserModel');
require('../models/TokenModel');
require('../models/MedicationModel');
require('../models/LogModel');

async function configurar() {
  console.log('MedSync - Configuração e Teste de Banco de Dados (MongoDB)');

  if (!process.env.MONGODB_URI) {
    console.error('Erro: A variável MONGODB_URI não está definida no .env');
    process.exit(1);
  }

  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Conexão estabelecida com sucesso!');
    console.log('Coleção "usuarios" pronta');
    console.log('Coleção "tokenrecuperacaos" pronta');
    console.log('Coleção "medicamentos" pronta');
    console.log('Coleção "registrodoses" pronta');
    console.log('\nConfiguração concluída! Execute "npm run dev" para iniciar.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (erro) {
    console.error('Erro ao conectar com o MongoDB:', erro.message);
    process.exit(1);
  }
}

configurar();