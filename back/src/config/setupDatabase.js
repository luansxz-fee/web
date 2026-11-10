require('dotenv').config();
const mongoose = require('mongoose');

// Registra os models (e, com eles, os índices e coleções).
require('../models/UserModel');
require('../models/TokenModel');
require('../models/MedicationModel');
require('../models/LogModel');

/*
 * Mantém só o registro mais recente de cada dose
 * (usuário + medicamento + dia + horário) e apaga os demais.
 */
async function removerDosesDuplicadas(RegistroDose) {
  const documentos = await RegistroDose.find(
    {},
    '_id usuario_id medicamento_id data_dose horario_agendado atualizado_em criado_em'
  ).lean();

  const maisRecente = new Map();
  const apagar = [];

  for (const doc of documentos) {
    const chave = [
      doc.usuario_id,
      doc.medicamento_id,
      doc.data_dose,
      doc.horario_agendado,
    ].join('|');

    const data = (d) => new Date(d.atualizado_em || d.criado_em || 0).getTime();
    const atual = maisRecente.get(chave);

    if (!atual) {
      maisRecente.set(chave, doc);
    } else if (data(doc) > data(atual)) {
      apagar.push(atual._id);
      maisRecente.set(chave, doc);
    } else {
      apagar.push(doc._id);
    }
  }

  if (apagar.length > 0) {
    await RegistroDose.deleteMany({ _id: { $in: apagar } });
  }

  console.log(`Doses duplicadas removidas: ${apagar.length}`);
}

// Os índices são criados manualmente abaixo, depois da limpeza de duplicatas.
mongoose.set('autoIndex', false);

async function configurar() {
  console.log('MedSync - Configuração e Teste de Banco de Dados (MongoDB)');

  if (!process.env.MONGODB_URI) {
    console.error('Erro: A variável MONGODB_URI não está definida no .env');
    process.exit(1);
  }

  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log('Conexão estabelecida com sucesso!');

    // Cria de fato as coleções e índices de cada model.
    for (const nome of Object.keys(mongoose.models)) {
      const modelo = mongoose.models[nome];
      await modelo.createCollection().catch(() => {});

      // O índice único de doses falha se já houver duplicatas.
      if (nome === 'RegistroDose') {
        await removerDosesDuplicadas(modelo);
      }

      await modelo.syncIndexes();
      console.log(`Coleção "${modelo.collection.name}" pronta`);
    }

    console.log('\nConfiguração concluída! Execute "npm run dev" para iniciar.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (erro) {
    console.error('Erro ao configurar o MongoDB:', erro.message);
    process.exit(1);
  }
}

configurar();